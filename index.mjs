import puppeteer from 'puppeteer';
import fs from 'fs-extra';

void async function () {
  const browser = await puppeteer.launch();
  const pages = await browser.pages();
  const page = pages[0];

  // Block 3rd party networking to speed up the scraping
  await page.setRequestInterception(true);
  const allowedHostnames = ['csfd.cz', 'www.csfd.cz', 'img.csfd.cz', 'www.youtube.com' /* Trailer */];
  page.on('request', request => {
    const { hostname } = new URL(request.url());
    if (!allowedHostnames.includes(hostname)) {
      request.abort();
    } else {
      request.continue();
    }
  });

  await page.goto('https://csfd.cz/kino/?period=all');
  try {
    const cinemas = [];
    const movies = [];
    for (const cinemaScheduleDiv of await page.$$('.cinema-schedule')) {
      const cinemaName = await cinemaScheduleDiv.$eval('.header h2', h2 => h2.textContent.substring('Praha - '.length));
      cinemas.push(cinemaName);

      for (const dayTable of await cinemaScheduleDiv.$$('table')) {
        const [_, day, month, year] = await dayTable.$eval('caption', caption => /(\d+)\.(\d+)\.(\d+)/g.exec(caption.textContent));
        console.log(`Processing schedule for ${cinemaName} on ${year}/${month}/${day}`);

        for (const movieTr of await dayTable.$$('tr')) {
          const { name, url } = await movieTr.$eval('th a', a => ({ name: a.textContent.trim(), url: a.href }));
          const movieYear = await movieTr.$eval('th span.film-year', span => span.textContent.slice(1, -1));
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
      }
    }

    for (let index = 0; index < movies.length; index++) {
      const movie = movies[index];
      console.log(`Scraping ${movie.name} (${movie.year}, ${index + 1} / ${movies.length})`);
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

      movie.posterUrl = await page.$eval('img.film-poster', img => img.src.slice(0, -'?h###'.length));

      await page.goto(`https://www.youtube.com/results?search_query=trailer ${movie.name} ${movie.year}`);
      movie.trailerUrl = await page.$eval('#video-title', a => a.href);
    }

    await fs.writeJSON('data.json', { dateAndTime: new Date(), cinemas, movies }, { spaces: 2 });
  } finally {
    await browser.close();
  }
}()
