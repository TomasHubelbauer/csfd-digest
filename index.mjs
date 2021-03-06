import puppeteer from 'puppeteer';
import fs from 'fs-extra';

// Study how the batch size impacts the workflow duration by cycling between 1 and 30 daily
const batchSize = new Date().getDate();

// Crash the process to fail the workflow if there is an uncaught error
process.on('unhandledRejection', error => { throw error; });

void async function () {
  const browser = await puppeteer.launch();
  const pages = await browser.pages();
  const page = pages[0];
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
      await fs.emptyDir('data');
      await fs.ensureDir('study');
      for (const cinemaScheduleDiv of await page.$$('.cinema-schedule')) {
        const cinemaName = await cinemaScheduleDiv.$eval('.header h2', h2 => h2.textContent.substring('Praha - '.length));
        cinemas.push(cinemaName);
        console.log(`Processing the schedule for ${cinemaName}`);

        for (const dayTable of await cinemaScheduleDiv.$$('table')) {
          const [_, day, month, year] = await dayTable.$eval('caption', caption => /(\d+)\.(\d+)\.(\d+)/g.exec(caption.textContent));

          for (const movieTr of await dayTable.$$('tr')) {
            const { name, url } = await movieTr.$eval('th a', a => ({ name: a.textContent.trim(), url: a.href }));
            const movieYear = Number(await movieTr.$eval('th span.film-year', span => span.textContent.slice(1, -1)));
            const idMatch = /\/(\d+-[\w-]+)\//g.exec(url);
            if (idMatch === null || idMatch.length !== 2) {
              throw new Error('Failed to parse the ID out of', url);
            }

            const id = idMatch[1];

            let movie = movies.find(m => m.id === id);
            if (!movie) {
              movie = { id, url, name, year: movieYear, screenings: { [cinemaName]: [] } };
              movies.push(movie);
              if (!(await fs.pathExists('data/' + movie.id + '.json'))) {
                newMovies.push(movie);
              }
            } else {
              if (movie.name.length < name.length) {
                // Replace the same name with ellipses with the full version if found
                movie.name = name;
              }

              if (!movie.screenings[cinemaName]) {
                movie.screenings[cinemaName] = [];
              }
            }

            for (const time of await movieTr.$$eval('td:not(.flags)', tds => tds.map(td => td.textContent).filter(time => time))) {
              const [_, hour, minute] = /(\d+):(\d+)/g.exec(time);
              movie.screenings[cinemaName].push(new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute)));
            }
          }
        }
      }

      const now = Date.now();
      const batchCount = ~~(movies.length / batchSize);
      for (let batchIndex = 0; batchIndex < batchCount; batchIndex++) {
        const batchNumber = batchIndex + 1;
        const batch = movies
          .slice(batchIndex * batchSize, batchIndex * batchSize + batchSize)
          .map(async m => {
            const page = await browser.newPage();
            await block3rdPartyNetworking(page);

            // Do not await this to make it run in parallel later using `Promise.all`
            return scrapeMovie(page, m, cinemas);
          });
        console.log(`Scraping the batch #${batchNumber}/${batchCount} of ${batch.length} movies:`);
        await Promise.all(batch);
      }

      await fs.appendFile(`study/${batchSize}.log`, `${new Date().toLocaleString()} ${~~((Date.now() - now) / 1000)} s\n`)

      // Sort alphabetically to make the index diffs nicer
      movies.sort((a, b) => a.name.localeCompare(b.name));

      await fs.writeJson('data/index.json', { dateAndTime: new Date(), cinemas, movies }, { spaces: 2 });
    }
    else {
      const index = await fs.readJson('data/index.json');
      cinemas.push(...index.cinemas);
      for (const movie of index.movies) {
        try {
          const data = await fs.readJson('data/' + movie.id + '.json');
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

    let email = '';
    email += 'From: Cinema Bot <bot@hubelbauer.net>\n';
    email += `Subject: Tonight's Cinema\n`;
    email += 'Content-Type: text/html\n';
    email += '\n';
    email += '<br />\n';

    const tonight = new Date();
    // TODO: Order cinemas by the total number of screenings as a proxy for popularity
    for (const cinema of cinemas) {
      email += `<b>${cinema}</b>\n`;
      const hits = [];
      for (const movie of newMovies) {
        if (!movie.screenings[cinema]) {
          continue;
        }

        const tonightsScreenings = movie.screenings[cinema].filter(d => d.getFullYear() === tonight.getFullYear() && d.getMonth() === tonight.getMonth() && d.getDate() === tonight.getDate());
        if (tonightsScreenings.length === 0) {
          continue;
        }

        hits.push({ movie, screenings: tonightsScreenings });
      }

      if (hits.length > 0) {
        // Sort by the number of screenings in the evening as a proxy for popularity
        hits.sort((a, b) => b.screenings.length - a.screenings.length);

        email += '<br />\n';
        for (let index = 0; index < Math.min(hits.length, 5); index++) {
          // TODO: Download and attach the unique images as inline attachments
          email += `<img src='${hits[index].movie.posterUrl}?h180' />\n`;
        }

        email += '<ul>\n';
        for (const hit of hits) {
          email += `<li><b><a href='${hit.movie.url}'>${hit.movie.name}</a></b>: ${hit.screenings.map(s => s.toLocaleTimeString()).join(', ')}</li>\n`;
        }

        email += '</ul>\n';
      }
    }

    email += '<br />\n';
    email += 'Thank you\n';
    await fs.writeFile('email.eml', email);
  } finally {
    await browser.close();
  }
}()

const allowedHostnames = ['csfd.cz', 'www.csfd.cz', 'img.csfd.cz', 'www.youtube.com' /* Trailer */];
async function block3rdPartyNetworking(page) {
  // Block 3rd party networking to speed up the scraping
  await page.setRequestInterception(true);
  page.on('request', request => {
    const { hostname } = new URL(request.url());
    if (!allowedHostnames.includes(hostname)) {
      request.abort();
    } else {
      request.continue();
    }
  });
}

async function scrapeMovie(page, movie, cinemas) {
  try {
    await page.goto(movie.url);

    try {
      movie.content = await page.$eval('div#plots li:not([style^="display: none;"])', li => li.textContent.trim());
    } catch (error) {
      // Ignore missing content li
    }

    try {
      movie.imdbUrl = await page.$eval('a[title="profil na IMDb.com"]', a => a.href);
    } catch (error) {
      // Ignore missing IMDB a
    }

    try {
      movie.posterUrl = await page.$eval('img.film-poster', img => img.src.slice(0, -'?h###'.length));
    } catch (error) {
      // Ignore missing poster img (some old movies do not have them)
    }

    await page.goto(`https://www.youtube.com/results?search_query=trailer ${movie.name} ${movie.year}`);
    movie.trailerUrl = await page.$eval('#video-title', a => a.href);

    await fs.writeJson(`data/${movie.id}.json`, movie, { spaces: 2 });
    console.log(`Scraped ${movie.name} (${movie.year})`);
  } catch (error) {
    console.log(`Errored ${movie.name} (${movie.year}): ${error.message}`);
  } finally {
    // Delete non-index information to serialize only index information later on
    delete movie.url;
    delete movie.content;
    delete movie.imdbUrl;
    delete movie.trailerUrl;
    movie.cinemas = Object.keys(movie.screenings).map(c => cinemas.indexOf(c));
    movie.screenings = Object.keys(movie.screenings).reduce((a, c) => a + movie.screenings[c].length, 0);

    await page.close();
  }
}
