# MyTake.org Node.js API server

This server has two routes:

- `/static/social-image/` renders a social media preview image using puppeteer
  - this gets called by social media website
- `/static/social-header/` renders meta tags for the social media preview
  - this gets called only by our own `mytake.org` web server

## Dev

See [`DEV_QUICKSTART.md` in the parent folder](../DEV_QUICKSTART.md) for details/ 


- `nvm use` to get the correct version of node and npm
- `./gradlew beforeCompile` (populates the `common` and `java2ts` directories of `src/main/scripts`)
- `npm start` to launch the server at port `4000`
    - if you change a file and save, it will automatically rebuild and restart the server

## Deployment

- This server is deployed to `node.mytake.org` using Heroku, in lockstep with the Java served up at `mytake.org`.
- A staging instance is always available `mtdo-node-staging.herokuapp.com`, autodeploys from `master`.
- You can change the number of puppeteer tabs used in parallel with the `NUM_TABS` environment variable.

## Social embed requirements

TL;DR our target image is 1200x628 (even though Twitter maybe prefers 1200x675).

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
