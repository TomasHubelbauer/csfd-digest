# Puppeteer CSFD.cz Scraper

[
  ![](https://tomashubelbauer.visualstudio.com/puppeteer-csfd-cz-scraper/_apis/build/status/TomasHubelbauer.puppeteer-csfd-scraper?branchName=master)
](https://tomashubelbauer.visualstudio.com/puppeteer-csfd-cz-scraper/_build/latest)

[**LIVE**](https://tomashubelbauer.github.io/puppeteer-csfd-scraper)

Scrapes CSFD.cz for cinema schedules and allows annotating movies with interest
level. Notifies about new movies found since the last time.

`npm start` to refresh `data.json`

`npx serve .` to access the web app

## To-Do

Finalize the `suggest` TUI command for listing the movies annotated *probably*
followed by the ones annotated *maybe* with screenings

Allow tagging movies with *watched* so that in the deletion index it is clear
what was deleted because I didn't like it and what was deleted because I have
already seen it

Set up a scheduled Azure Pipeline which runs `npm start` and pushes the result to
the repository daily for the web app to pick up and allow the user to tag on
their device where it is saved in local storage.

Instead of directories and files, there is just a single large JSON for the web
app (images loaded using an `img` tag from CSFD not the repo) and status not
present in it but in local storage.

The local storage gets purged so statuses (including deletions) for movies no
longer in the index get removed and the local storage doesn't just grow
indefinitely.

Do this for all cities not just Prague?
