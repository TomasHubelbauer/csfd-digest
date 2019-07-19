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

Display floating buttons on movie list item hover with options to tag as a maybe,
tag as a probably, delete or tag as watched or display a badge if already tagged.
Do not display deleted items (remember deletion in the local storage).
Add filters for states (untagged, maybe, probably, deleted, watched).

Purge the local storage so statuses (including deletions) for movies no longer
in the data get removed and the local storage doesn't just grow indefinitely.

Scrape all cities, not just Prague and add a switcher and geolocation integration.

Order selected cinemas first then unselected to avoid concealing selection with
scroll.

Fallback to the 180 poster image if the 360 one fails to load and to a no-image
image if both fail to load.

Finalize the movie detail page to not be so ugly - add some sort of a timeline
or something.

Make logo clickable (go to main page).

Use a better cinema picker (all/remembered cinemas by default), clicking opens a
list / a map in a modal and each cinema shows the number of movies.
