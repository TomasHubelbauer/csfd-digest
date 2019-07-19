# Puppeteer CSFD.cz Scraper

[
  ![](https://tomashubelbauer.visualstudio.com/puppeteer-csfd-cz-scraper/_apis/build/status/TomasHubelbauer.puppeteer-csfd-scraper?branchName=master)
](https://tomashubelbauer.visualstudio.com/puppeteer-csfd-cz-scraper/_build/latest)

[**LIVE**](https://tomashubelbauer.github.io/puppeteer-csfd-scraper)

Scrapes CSFD.cz for cinema schedules and allows annotating movies with interest
level. Notifies about new movies coming out.

- https://tomashubelbauer.github.io/puppeteer-csfd-scraper
- `npm start` to refresh `data.json`
- `npx serve .` to access the web app at http://localhost:5000/

## To-Do

Remove local storage items for movies no longer in the data (including deletions)
so the local storage doesn't just grow indefinitely.

Scrape all cities, not just Prague and add a switcher and geolocation integration.

Order selected cinemas first then unselected to avoid concealing selection with
scroll.

Finalize the movie detail page to not be so ugly - add some sort of a timeline
or something.

Use a better cinema picker (all/remembered cinemas by default), clicking opens a
list / a map in a modal and each cinema shows the number of movies.

Consider introducing a control strip atop the movie list where watched and deleted
movies could be enabled to be displayed.
