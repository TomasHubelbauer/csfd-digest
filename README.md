# Puppeteer CSFD.cz Scraper

Scrapes CSFD.cz for cinema schedules and allows annotating movies with interest
level. Notifies about new movies found since the last time.

`npm start` (refresh data) followed by `npm run tag` or `npm run suggest`

## To-Do

Finalize the `suggest` TUI command for listing the movies annotated *probably*
followed by the ones annotated *maybe* with screenings

Allow tagging movies with *watched* so that in the deletion index it is clear
what was deleted because I didn't like it and what was deleted because I have
already seen it

Consider turning the TUI into a web GUI or providing it alongside the TUI
