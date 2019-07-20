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

Add a timeline kind control to the movie page for screenings if I can come up
with a useful and good looking one.

Use a better cinema picker (all/remembered cinemas by default), clicking opens a
list / a map in a modal and each cinema shows the number of movies.

Add a search & filter strip between cinemas and movies where movies can be
searched for, watched/deleted can be enabled to be displayed and a release year
may be selected (maybe a check for "recent movies only" [this and last year]).

Add a notification when marking movies as watched and deleted with an undo
button (not for probably and maybe as those do not hide when tagged).

See if I can link directly to purchase from the time slot for cinemas which have
online ticket sales.

Remove time slots which are not up to date (index gets refreshed daily so in the
evening some times might have already passed), cut them off 10 minutes after
movie start (in case you show up just on time to buy tickets skipping the ads,
you should still see the movie in the app).

Display production country and original title if available.

Display a date range in the card to see how much time is left to see the movie.
Also add a badge along the lines of "Ends soon" or something if just a few days.

Scrap and display movie ratings in the cards.

Use the history API instead of hashes to avoid the problem where closing the
movie popup by clearing the hash scrolls the page up (as well as general history
pollution).
