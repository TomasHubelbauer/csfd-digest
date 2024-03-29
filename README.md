# Puppeteer CSFD.cz Scraper

![](https://github.com/tomashubelbauer/puppeteer-csfd-scraper/workflows/github-pages/badge.svg)

[**LIVE**](https://tomashubelbauer.github.io/csfd-digest)

Scrapes CSFD.cz for cinema schedules and allows annotating movies with interest
level. Notifies about new movies coming out.

## Running

Run `npm start` to run the scraper script (runs in GitHub Actions).

Run `npx serve .` to serve the contents of the repository directory.

Access http://localhost:5000 to visit the old app (HTML).

Run `npm start` in `cra` in addition (to keep serving `docs` for the proxy) and
access http://localhost:3000 to visit the new app (React).

## To-Do

### Remove local storage items for movies no longer in the data

(including deletions) so the local storage doesn't just grow indefinitely.

### Scrape all cities, not just Prague and add a switcher and geolocation integration

### Order selected cinemas first then unselected to avoid concealing selection with scroll

### Add a timeline kind control to the movie page for screenings

if I can come up with a useful and good looking one.

### Use a better cinema picker (all/remembered cinemas by default)

clicking opens a list / a map in a modal and each cinema shows the number of movies.

### Add a search & filter strip between cinemas and movies 

Where movies can be searched for, watched/deleted can be enabled to be displayed and a release year
may be selected (maybe a check for "recent movies only" [this and last year]).

### Add a notification when marking movies as watched and deleted

with an undo button (not for probably and maybe as those do not hide when tagged).

### See if I can link directly to purchase from the time slot

for cinemas which have online ticket sales.

### Remove time slots which are not up to date

(index gets refreshed daily so in the
evening some times might have already passed), cut them off 10 minutes after
movie start (in case you show up just on time to buy tickets skipping the ads,
you should still see the movie in the app).

### Display production country and original title if available

### Display a date range in the card to see how much time is left to see the movie

Also add a badge along the lines of "Ends soon" or something if just a few days.

### Scrape and display movie ratings in the cards

### Use the history API instead of hashes

to avoid the problem where closing the
movie popup by clearing the hash scrolls the page up (as well as general history
pollution).

### Fix player fullscreen dismissing the popup for some reason

(probably the scroll to dismiss handler).

### Hook up Esc to dismiss the modal

### Consider running the pipeline with Puppeteer-Firefox in parallel with Chrome

to benchmark how stable it is (failing this one will not fail the CI).

- https://github.com/GoogleChrome/puppeteer/tree/master/experimental/puppeteer-firefox
- https://aslushnikov.github.io/ispuppeteerfirefoxready/
- https://www.npmjs.com/package/puppeteer-firefox

### Minimize modal top margin on mobile

### Make the YouTube embed 100% modal width on mobile

### Reset modal scroll position when opening new movie on mobile

### See if modal scroll can be made smooth like main scroll in iOS Safari

### Display a note if no screening dates are available in the selected cinemas

(How can this happen? Yet it does for some movies.)

### Add in and out transition animation for the popup

### Fix 3D animation perspective for the tile shake on mobile

or remove it is weird.

### Render the movie popup by loading the movie file when opened in both versions

### Fix some movies not getting deleted - not in index but have data files

### Send descriptions in the email with new movies

### Consider rendering the movie gallery statically into the HTML

Use JavaScript only for things like hiding and stuff.
Maybe use react-snap or react-snapshot.
