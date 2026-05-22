# raiding.space

A react website to identify where there are skyhooks that can be raided soon in Eve Online.  The website will display these locations with both a map of the universe (and the region once a region is clicked on) and a list of available systems.

## Rules

* Avoid implicit and explicit any
* The app should run entirely client-side.

## Technology Stack

* React
* Webpack

## Data Sources

* Universe Map SVG: https://evemaps.dotlan.net/svg/New_Eden.dark.svg
* Region Maps SVG: https://evemaps.dotlan.net/svg/[URL ENCODED REGION NAME].dark.svg
* Raidable Skyhook List: https://esi.evetech.net/skyhooks/raidable
  * Requires Header "X-Compatibility-Date: 2026-05-19"
  * Returns: JSON {skyhooks:[{planet_id: number, solar_system_id: number, theft_vulnerability: {start: date, end: date}}]}
  * Cached for 5 minutes.
