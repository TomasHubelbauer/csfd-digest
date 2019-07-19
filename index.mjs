import puppeteer from 'puppeteer';
import fetch from 'node-fetch';
import fs from 'fs-extra';
import terminalImage from 'terminal-image';
import readline from 'readline';

void async function () {
  // Handle CLI commands
  switch (process.argv[2]) {
    case 'tag': {
      for (const path of await fs.readdir('.')) {
        // Skip non-movie directory and the index keeping track of deleted movies (to not get readded)
        if (!path.startsWith('_') || path === '_') {
          continue;
        }

        const data = await fs.readJSON(path + '/data.json');

        // Ignore already tagged movies
        if (data.status === 'maybe' || data.status === 'probably') {
          continue;
        }

        console.log(await terminalImage.file(path + '/poster-large.jpg'));
        console.log(data.name, data.year);
        console.log(data.content);
        switch (await ask('Tag? ([m]aybe, [p]robably, [d]elete, anything else = [s]kip):')) {
          case 'm': {
            data.status = 'maybe';
            await fs.writeJSON(path + '/data.json', data, { spaces: 2 });
            break;
          }
          case 'p': {
            data.status = 'probably';
            await fs.writeJSON(path + '/data.json', data, { spaces: 2 });
            break;
          }
          case 'd': {
            await fs.remove(path);
            await fs.appendFile('_', JSON.stringify({ id: data.id, name: data.name }));
          }
        }
      }

      return;
    }

    case 'suggest': {
      // TODO: List "probably" and then "maybe" tagged movies
      return;
    }
  }

  const browser = await puppeteer.launch({ args: ['--window-size=800,600' /* Match default viewport */] });
  const pages = await browser.pages();
  const page = pages[0];

  // Block 3rd party networking to speed up crawling and clean up screenshots
  await page.setRequestInterception(true);
  page.on('request', request => {
    const url = new URL(request.url());
    if (url.hostname !== 'csfd.cz' && url.hostname !== 'www.csfd.cz' && url.hostname !== 'img.csfd.cz') {
      //console.log('Blocked 3rd party networking with ' + url.hostname);
      request.abort();
    } else {
      request.continue();
    }
  });

  await page.goto('https://csfd.cz/kino/?period=all');
  try {
    const deletionIndex = String(await fs.readFile('_'));

    const movies = [];
    for (const cinemaScheduleDiv of await page.$$('.cinema-schedule')) {
      const cinemaName = await cinemaScheduleDiv.$eval('.header h2', cinemaH2 => cinemaH2.textContent.substring('Praha - '.length));

      for (const dayTable of await cinemaScheduleDiv.$$('table')) {
        const [_, day, month, year] = await dayTable.$eval('caption', dateCaption => /(\d+)\.(\d+)\.(\d+)/g.exec(dateCaption.textContent));
        console.log(`Processing schedule for ${cinemaName} on ${year}/${month}/${day}`);

        for (const movieTr of await dayTable.$$('tr')) {
          const { name, url } = await movieTr.$eval('th a', movieA => ({ name: movieA.textContent.trim(), url: movieA.href }));
          const movieYear = await movieTr.$eval('th span.film-year', fileYearSpan => fileYearSpan.textContent);
          console.log(`\tProcessing ${name} ${movieYear}`);
          const idMatch = /\/(\d+-[\w-]+)\//g.exec(url);
          if (idMatch === null || idMatch.length !== 2) {
            throw new Error('Failed to parse the ID out of', url);
          }

          const id = idMatch[1];

          // Avoid readding deleted movies as new movies
          if (deletionIndex.includes(id)) {
            continue;
          }

          let movie = movies.find(m => m.id === id);
          if (!movie) {
            movie = { id, url, name, year: movieYear, screenings: [] };
            movies.push(movie);
          } else if (movie.name.length < name.length) {
            // Replace the same name with ellipses with the full version if found
            movie.name = name;
          }

          for (const time of await movieTr.$$eval('td:not(.flags)', timeTds => timeTds.map(timeTd => timeTd.textContent).filter(time => time))) {
            const [_, hour, minute] = /(\d+):(\d+)/g.exec(time);
            movie.screenings.push({ dateAndTime: new Date(year, month - 1, day, hour, minute, 0, 0), cinemaName });
          }
        }
      }
    }

    const addedMovies = [];
    const changedMovies = [];
    for (let index = 0; index < movies.length; index++) {
      const movie = movies[index];

      console.log(`Scraping ${movie.name} (${index + 1} / ${movies.length})`);
      await page.goto(movie.url);

      const posterImg = await page.$('img.film-poster');
      const posterUrl = await page.evaluate(posterImg => posterImg.src, posterImg);

      const imdbA = await page.$('a[title="profil na IMDb.com"]');
      const imdbUrl = await page.evaluate(imdbA => imdbA ? imdbA.href : null, imdbA);

      const contentLi = await page.$('div#plots li:not([style^="display: none;"])');
      const content = await page.evaluate(contentLi => contentLi ? contentLi.textContent.trim() : '', contentLi);

      let storedData;
      let updated = false;
      const data = {
        id: movie.id,
        name: movie.name,
        year: movie.year,
        content,
        csfdUrl: movie.url,
        imdbUrl,
        smallPosterUrl: posterUrl.slice(0, -'?h###'.length) + '?h180',
        largePosterUrl: posterUrl.slice(0, -'?h###'.length) + '?h360',
        screenings: movie.screenings,
      };

      const path = '_' + movie.id;
      await fs.ensureDir(path);

      if (await fs.exists(path + '/data.json')) {
        storedData = await fs.readJSON(path + '/data.json');

        // Preserve tags across refreshes
        if (storedData.status) {
          data.status = storedData.status;
        }
      } else {
        addedMovies.push(movie.name);
      }

      await fs.writeJSON(path + '/data.json', data, { spaces: 2 });

      if (!storedData || storedData.content !== data.content) {
        updated = true;
        console.log('\tContent changed');
      }

      if (!storedData || JSON.stringify(storedData.screenings) !== JSON.stringify(data.screenings)) {
        updated = true;
        console.log('\tScreenings changed');
      }

      if (!storedData || storedData.smallPosterUrl !== data.smallPosterUrl) {
        console.log('Downloading small poster');
        const smallPosterResponse = await fetch(data.smallPosterUrl);
        await fs.writeFile(path + '/poster-small.jpg', await smallPosterResponse.buffer());
        updated = true;
        console.log('\tSmall poster changed');
      }

      if (!storedData || storedData.largePosterUrl !== data.largePosterUrl) {
        console.log('Downloading large poster');
        const largePosterResponse = await fetch(data.largePosterUrl);
        await fs.writeFile(path + '/poster-large.jpg', await largePosterResponse.buffer());
        updated = true;
        console.log('\tLarge poster changed');
      }

      // TODO: Decide if it is worth it checking for updates to the IMDB URL
      // TODO: Decide whether to store and check updates to the gallery photos

      if (updated && !addedMovies.includes(movie.name)) {
        changedMovies.push(movie.name);
      }
    }

    if (addedMovies.length > 0) {
      console.log(`${addedMovies.length} movies added.`, addedMovies);
    } else {
      console.log('No added movies.');
    }

    if (changedMovies.length > 0) {
      console.log(`${changedMovies.length} movies changed.`, changedMovies);
    } else {
      console.log('No changed movies.');
    }
  } finally {
    await browser.close();
  }
}()

function ask(question) {
  return new Promise(resolve => {
    const io = readline.createInterface({ input: process.stdin, output: process.stdout });
    io.question(question + '\n', answer => {
      io.close();
      resolve(answer);
    });
  });
}
