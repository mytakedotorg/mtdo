# codename mytake.org

[![Travis CI](https://travis-ci.org/mytake/mytake.svg?branch=master)](https://travis-ci.org/mytake/mytake)
[![License GPLv2](https://img.shields.io/badge/license-GPLv2-brightgreen.svg)](https://tldrlegal.com/license/gnu-general-public-license-v2)
[![Live chat](https://img.shields.io/badge/gitter-chat-brightgreen.svg)](https://gitter.im/mytake/mytake)

Here's what we have so far:

- [A pitch](https://github.com/mytake/mytake/wiki/Pitch)
- [A design for our product](https://github.com/mytake/mytake/wiki/Design)
- [A prototype for our product](https://mytake.netlify.com/)
- We're discussing how to improve these [here](https://github.com/mytake/mytake/issues).

# build instructions
 
## source locations

- Sass lives in `/assets`
- Typescript lives in `/src`
- Html lives in `/nunjucks`

## how to get started

- `npm start` serves the site from `/dist`, with live reloading.

## CI

- Netlify deploys the site by running `npm run deploy` and then serving the `/dist` folder, with asset fingerprinting built-in to the serve.
- Travis runs `npm run-script format-list` and `npm run-script test`

## update deps

```
npm outdated               - shows which packages are out of date
npm update <packagename>   - updates packagename to "Wanted", but won't pass semver
```
## troubleshooting

If `npm install` generates EINTEGRITY warnings, try the following

```
npm install -g npm@5.2.0
rm package-lock.json
rm -rf node_modules/
npm cache clear --force
npm install
```

npm5 has some key features, but apparently lots of bugs.
