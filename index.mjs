import puppeteer from 'puppeteer';
import fs from 'fs-extra';

const batchSize = 10;

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

    await fs.emptyDir('data');
    for (const cinemaScheduleDiv of await page.$$('.cinema-schedule')) {
      const cinemaName = await cinemaScheduleDiv.$eval('.header h2', h2 => h2.textContent.substring('Praha - '.length));
      cinemas.push(cinemaName);

      for (const dayTable of await cinemaScheduleDiv.$$('table')) {
        const [_, day, month, year] = await dayTable.$eval('caption', caption => /(\d+)\.(\d+)\.(\d+)/g.exec(caption.textContent));
        console.log(`Processing the schedule for ${cinemaName} on ${year}/${month}/${day}…`);

        for (const movieTr of await dayTable.$$('tr')) {
          const { name, url } = await movieTr.$eval('th a', a => ({ name: a.textContent.trim(), url: a.href }));
          const movieYear = Number(await movieTr.$eval('th span.film-year', span => span.textContent.slice(1, -1)));
          console.log(`\tProcessing ${name} (${movieYear})`);
          const idMatch = /\/(\d+-[\w-]+)\//g.exec(url);
          if (idMatch === null || idMatch.length !== 2) {
            throw new Error('Failed to parse the ID out of', url);
          }

          const id = idMatch[1];

          let movie = movies.find(m => m.id === id);
          if (!movie) {
            movie = { id, url, name, year: movieYear, screenings: { [cinemaName]: [] } };
            movies.push(movie);
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

        console.log(`Processed the schedule for ${cinemaName} on ${year}/${month}/${day}.`);
      }
    }

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
      console.log(`Scraping the batch #${batchNumber}/${batchCount} of ${batch.length} movies…`);
      await Promise.all(batch);
      console.log(`Scraped the batch #${batchNumber}/${batchCount} of ${batch.length} movies…`);
    }

    // Sort alphabetically to make the index diffs nicer
    movies.sort((a, b) => a.name.localeCompare(b.name));

    await fs.writeJSON('data/_.json', { dateAndTime: new Date(), cinemas, movies }, { spaces: 2 });
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
  console.log(`Scraping ${movie.name} (${movie.year})…`);
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

  await fs.writeJson(`data/${movie.id}.json`, { dateAndTime: new Date(), ...movie }, { spaces: 2 });

  // Delete non-index information to serialize only index information later on
  delete movie.url;
  delete movie.content;
  delete movie.imdbUrl;
  delete movie.trailerUrl;
  movie.cinemas = Object.keys(movie.screenings).map(c => cinemas.indexOf(c));
  movie.screenings = Object.keys(movie.screenings).reduce((a, c) => a + movie.screenings[c].length, 0);

  await page.close();
  console.log(`Scraped ${movie.name} (${movie.year}).`);
}
