# Dev quickstart

When you run `./gradlew runDev`, you will get a server running at `localhost:8080` with hot reload for templates.  If you then `cd` into the `client` directory, you can run:

```
nvm use   // get correct version of node & npm
npm ci    // get dependencies
npm start // start proxy server
```

and you will have a browsersync proxy running at `localhost:3000` with hot reload for the react components and sass styles.

If you bump into any problems, we have listed [common errors and their solutions](#common-errors-and-their-solutions) below.

## Entrypoints

There is a file [`Routes.java`](client/src/main/java/java2ts/Routes.java) which gets transpiled by the build into [`Routes.ts`](client/src/main/scripts/java2ts/Routes.ts). You can do symbol navigation from there to see where to start for the server and client.  Below are some of the most commonly used parts:

- `/` (homepage)
  - template
  - [`server/src/main/rocker/views/Placeholder/home.rocker.html`](server/src/main/rocker/views/Placeholder/home.rocker.html)
  - served by
  - [`server/src/main/java/controllers/HomeFeed.java`](server/src/main/java/controllers/HomeFeed.java)
  - styled in TODO, js in TODO
- `/search?q=social%20security` (search)
  - template
  - [`server/src/main/rocker/views/Search/searchResults.rocker.html`](server/src/main/rocker/views/Search/searchResults.rocker.html)
  - client code there triggers js call to `/api/search`
  - server code entrypoints are all in [`server/src/main/java/controllers/SearchModule.java`](server/src/main/java/controllers/SearchModule.java)
  - styled in TODO, js in TODO
- `/foundation-v1/presidential-debate-kennedy-nixon-1-of-4/1961.440-1983.310` (foundation snippet)
  - serves this template
  - [`server/src/main/rocker/views/Placeholder/foundation.rocker.html`](server/src/main/rocker/views/Placeholder/foundation.rocker.html)
  - which triggers `GET`s to static assets, template and assets all served from
  - [`server/src/main/java/controllers/FoundationAssets.java`](server/src/main/java/controllers/FoundationAssets.java)
  - styled in TODO, js in TODO

## Common errors and their solutions

### Java server startup

> Couldn't connect to Docker daemon. You might need to start Docker

Start Docker!

> No container found for postgres_1

```
./gradlew dockerDown
./gradlew runDev
```

> Unable to obtain connection from database: The connection attempt failed.

Just try `./gradlew runDev` again.

### Webpack
