const fetch = require('fetch-vcr');
 
// Configure where the recordings should be loaded/saved to.
// The path is relative to `process.cwd()` but can be absolute.
fetch.configure({
  fixturePath: './build',
  mode: 'cache'
})

async function get(path, cache) {
  if (!path.startsWith('http')) {
    path = 'https://mytake.org' + path;
  }
  const res = await fetch(path);
  return res.json();
}

exports.get = get
