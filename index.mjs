import playwright from 'playwright';
import fs from 'fs';

// Study how the batch size impacts the workflow duration by varying it daily
const batchSize = new Date().getDate();

// Block 3rd party navigation to speed up the scraping process
const allowedHostnames = ['csfd.cz', 'www.csfd.cz', 'img.csfd.cz', 'www.youtube.com' /* Trailer */];

const browser = await playwright.firefox.launch();
const page = await browser.newPage();
await block3rdPartyNetworking(page);
await page.goto('https://csfd.cz/kino/?period=all');
try {
  /** @type {string[]} */
  const cinemas = [];
  /** @type {{ id: string; url: string; name: string; year: number; content: string; imdbUrl: string; posterUrl: string; trailerUrl: string; screenings: any[] }[]} */
  const movies = [];
  const newMovies = [];

  const skipScrape = process.argv[2] === 'skip';
  if (!skipScrape) {
    await fs.promises.rm('data', { force: true, recursive: true });
    await fs.promises.mkdir('data');

    try {
      await fs.promises.access('study');
    }
    catch {
      await fs.promises.mkdir('study');
    }

    for (const cinemaScheduleDiv of await page.$$('section[id^="cinema"]')) {
      const cinemaName = await cinemaScheduleDiv.$eval('header > h2', h2 => h2.textContent);
      if (!cinemaName.startsWith('Praha -')) {
        console.log(`Skipping ${cinemaName} (not in Prague)`);
        continue;
      }

      console.log(`Scraping ${cinemaName}`);
      cinemas.push(cinemaName);

      /** @type {[number, number, number]} */
      let ddMmYyyy;
      for (const div of await cinemaScheduleDiv.$$('> div')) {
        const className = await div.evaluate(div => div.className);
        switch (className) {
          case 'box-sub-header': {
            ddMmYyyy = await div.evaluate(div => div.textContent.trim().split(' ')[1].split('.').map(Number));
            console.log('Setting DD-MM-YYYY date to', ddMmYyyy);
            break;
          }
          case 'box-content box-content-table-cinema': {
            for (const tr of await div.$$('tr')) {
              const { name, url } = await tr.$eval('td.name a', a => ({ name: a.textContent.trim(), url: a.href }));
              const match = /film\/(?<id>\d+)/.exec(url);
              if (match === null || !match.groups.id) {
                throw new Error('Failed to parse the ID out of', url);
              }

              const id = Number(match.groups.id);

              let movie = movies.find(m => m.id === id);
              if (!movie) {
                movie = { id, url, name, screenings: { [cinemaName]: [] } };
                movies.push(movie);
                try {
                  await fs.promises.access(`data/${movile.id}.json`);
                }
                catch {
                  newMovies.push(movie);
                }
              }
              else {
                if (movie.name.length < name.length) {
                  // Replace the same name with ellipses with the full version if found
                  movie.name = name;
                }

                if (!movie.screenings[cinemaName]) {
                  movie.screenings[cinemaName] = [];
                }
              }

              for (const [hour, minute] of await tr.$$eval('.td-time', tds => tds.map(td => td.textContent.trim().split(':').map(Number)))) {
                const [day, month, year] = ddMmYyyy;
                movie.screenings[cinemaName].push(new Date(year, month - 1, day, hour, minute));
                console.log('Scraped', movie.name, 'screening', year, month, day, hour, minute, 'in', cinemaName);
              }
            }

            break;
          }
          default: {
            throw new Error(`Unexpected div class '${className}'.`);
          }
        }
      }
    }

    let succeeded = 0;
    let failed = 0;

    const now = Date.now();
    const batchCount = ~~(movies.length / batchSize);
    for (let batchIndex = 0; batchIndex < batchCount; batchIndex++) {
      const batchNumber = batchIndex + 1;
      const batch = movies
        .slice(batchIndex * batchSize, batchIndex * batchSize + batchSize)
        .map(async movie => {
          const page = await browser.newPage();
          await block3rdPartyNetworking(page);

          // Do not await this to make it run in parallel later using `Promise.all`
          return scrapeMovie(page, movie, cinemas);
        });

      console.log(`Scraping the batch #${batchNumber}/${batchCount} of ${batch.length} movies:`);

      const results = await Promise.allSettled(batch);
      const fullfilled = results.reduce((fullfilled, result) => fullfilled + (result.status === 'fulfilled' ? 1 : 0), 0);
      succeeded += fullfilled;
      const rejected = results.reduce((rejected, result) => rejected + (result.status === 'rejected' ? 1 : 0), 0);
      failed += rejected;
      console.log(`Finished the batch #${batchNumber}/${batchCount} of ${batch.length} movies: ${fullfilled} successes and ${rejected} failures`);
    }
    
    const duration = ~~((Date.now() - now) / 1000);
    
    const headers = ['date', 'time', 'movies', 'duration (s)', 'browser', 'successes', 'failures', 'batch', 'movies per second'];
    const cells = [
      new Date().toLocaleDateString(),
      new Date().toLocaleTimeString(),
      movies.length,
      duration,
      browser.browserType().name(),
      succeeded,
      failed,
      batchSize,
      movies.length / duration
    ];

    try {
      await fs.promises.access('study.csv');
    }
    catch {
      await fs.promises.writeFile('study.csv', headers.join(',') + '\n');
    }

    await fs.promises.appendFile('study.csv', cells.join(',') + '\n');
    console.log('Appended the study row:');
    console.log(headers);
    console.log(cells);

    // Sort alphabetically to make the index diffs nicer
    movies.sort((a, b) => a.name.localeCompare(b.name));

    await fs.promises.writeFile('data/index.json', JSON.stringify({ dateAndTime: new Date(), cinemas, movies }, null, 2));
  }
  else {
    const index = JSON.parse(await fs.promises.readFile('data/index.json'));
    cinemas.push(...index.cinemas);
    for (const movie of index.movies) {
      try {
        const data = JSON.parse(await fs.promises.readFile(`data/${movie.id}.json`));
        for (const cinema in data.screenings) {
          data.screenings[cinema] = data.screenings[cinema].map(d => new Date(d));
        }

        movies.push(data);
      }
      catch (error) {
        console.log('Movie in index but not in data: ', movie.name);
      }
    }
  }
}
finally {
  await browser.close();
}

async function block3rdPartyNetworking(/** @type {playwright.Page} */ page) {
  await page.route('**/*', async route => {
    const { hostname } = new URL(route.request().url());
    if (!allowedHostnames.includes(hostname)) {
      await route.abort();
    } else {
      await route.continue();
    }
  });
}

/**
 * 
 * @param {playwright.Page} page 
 * @param {{ id: number, name: string, url: string }[]} movie 
 * @param {unknown} cinemas 
 */
async function scrapeMovie(page, movie, cinemas) {
  try {
    await page.goto(movie.url);

    try {
      movie.content = await page.$eval('.plot-full', li => li.textContent.trim());
    }
    catch {
      // Ignore missing content div
    }

    try {
      movie.posterUrl = await page.$eval('img[alt="všechny plakáty"]', img => img.src);
    }
    catch {
      // Ignore missing poster img (some old movies do not have them)
    }

    await fs.promises.writeFile(`data/${movie.id}.json`, JSON.stringify(movie, null, 2));
    console.log(`Scraped ${movie.name}`);
  }
  catch (error) {
    console.log(`Errored ${movie.name}: ${error.message}`);
    throw error;
  }
  finally {
    // Delete non-index information to serialize only index information later on
    delete movie.url;
    delete movie.content;
    movie.cinemas = Object.keys(movie.screenings).map(c => cinemas.indexOf(c));
    movie.screenings = Object.keys(movie.screenings).reduce((a, c) => a + movie.screenings[c].length, 0);

    await page.close();
  }
}
