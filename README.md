# codename mytake.org

Here's what we have so far:

- [A pitch](https://github.com/nedtwigg/mytake/wiki/Pitch)
- [A design for our product](https://github.com/nedtwigg/mytake/wiki/Design)
- [A prototype for our product](https://nedtwigg.github.io/mytake/)
- We're discussing how to improve these [here](https://github.com/nedtwigg/mytake/issues).

# build instructions
 
 From root folder:

 - `npm install`
 - `npm test`
 - `npm start`

This opens a browser which will refresh when you make any changes, and it will also write the compiled changes into the `docs` folder.  The `docs` folder gets served at https://nedtwigg.github.io/mytake/

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
