# MyTake.org Node.js API server

## Dev quickstart

- `nvm use` to get the correct version of node and npm
- `./gradlew beforeCompile` (populates the `common` and `java2ts` directories of `src/main/scripts`)
- `npm start` to launch the server
    - if you change a file and save, it will automatically rebuild and restart the server
    - [13th Amendment](http://localhost:3000/api/images/o_dRqrNJ62wzlgLilTrLxkHqGmvAS9qTpa4z4pjyFqA=_54-86_0-218.jpg)
    - [Mondale Reagan](http://localhost:3000/api/images/hNPKEqwAyuJdu2OQY6ESAieCq_xQXX1it4bjA7DRlIg=_5839.620-5949.290.png)
    - [broken link](http://localhost:3000/api/images/vrhLapmIbWECYassLC2Umf7Z16fusYgWWGhTP7KgIYU=_5839.620-5949.290.jpg)

## Deployment

This server is deployed to `node.mytake.org` using Heroku, in lockstep with the Java served up at `mytake.org`.

## Requirements

TL;DR our target image is 1200x628 (even though Twitter prefers 1200x675).

- Facebook
  - [debugger](https://developers.facebook.com/tools/debug/)
  - min dimensions 600x315
  - max dimensions 1200x630
  - recommended aspect ratio is 1.91:1
- Twitter
  - [debugger](https://cards-dev.twitter.com/validator)
  - [summary card with large image](https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/summary-card-with-large-image)
    - 518x273 logical pixels, 1036x546 on HiDPI mac
    - aspect ratio of 2:1
    - min dimensions 300x157
    - max dimensions 4096x4096
    - less than 5MB
- OpenGraph
  - [debugger](https://search.google.com/structured-data/testing-tool/u/0/)
  - [spec](https://ogp.me/)
