const fetch = require("make-fetch-happen").defaults({
  cacheManager: "./build/fetch-cache", // path where cache will be written (and read)
});

async function get(path, cache) {
  if (path.startsWith('/')) {
    path = 'https://mytake.org' + path;
  }
  const res = await fetch(path);
  return res.json();
}

exports.get = get
