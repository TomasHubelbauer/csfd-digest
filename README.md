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

The above strip could also have a filter for recently released movies only (say
this and last year).

Add a undo for undeleting the last film (maybe a notification with a button).

See if I can link directly to purchase from the time slot for cinemas which have
online ticket sales.

Display the tag buttons in the display page as well.
Removal/watched tag returns the user back to the main page.

Remove time slots which are not up to date (index gets refreshed daily so in the
evening some times might have already passed), cut them off 10 minutes after
movie start (in case you show up just on time to buy tickets skipping the ads,
you should still see the movie in the app).

Display production country and original title if available.

Order probably and maybe tagged movies preferentially.

Display a date range in the card to see how much time is left to see the movie.
Also add a badge along the lines of "Ends soon" or something if just a few days.

Display movie ratings in the cards.

Do not unmount the list with a detail open so that when a detail closes scroll
position is preserved. (Probably do that by making the detail a different modal
`div` and conditionally render that when a card is selected.)
