# Dev quickstart

You will need these installed on your system:

- Java 8+
- Docker
- nvm (only if working on frontend)

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
- `/foundation`
- `/foundation/presidential-debate-kennedy-nixon-1-of-4`
- `/foundation/presidential-debate-mondale-reagan-1-of-2/cut:!(2007.9000244140625,2046.1099853515625),fact:oZVEQzZXVzx3lM_PbszcA35XYBJxEDHwJirpx1c7hhg=,kind:videoCut`
  - all are served by this template
  - [`server/src/main/rocker/views/Placeholder/foundation.rocker.html`](server/src/main/rocker/views/Placeholder/foundation.rocker.html)
  - which triggers `GET`s to static assets, template and assets all served from
  - [`server/src/main/java/controllers/FoundationAssets.java`](server/src/main/java/controllers/FoundationAssets.java)
  - styled in TODO, js in TODO

## Social embed

[`client/src/main/scripts/common/social/social.ts`](client/src/main/scripts/common/social/social.ts) defines a set of interface types which are used to define the schemas for all embeds.  These objects are encoded via [rison](https://rison.io/), and then placed at the end of the URL (e.g. the long `cut:!(20...` string above)

If you want to improve the social media embed for any of these types, use the instructions at the top of this file to launch a dev server at `localhost:8080`, with react hot-reload proxy on top `localhost:3000`.

Now, if you open a browser [`localhost:3000/devSocialEmbed`](http://localhost:3000/devSocialEmbed), you can add a `#blahblah` to the URL bar, and it will:

- render the social embed image in the middle of the page ([`SocialImage.tsx`](client/src/main/scripts/common/social/SocialImage.tsx))
- print out the meta headers at the console ([`SocialHeader.tsx`](client/src/main/scripts/common/social/SocialHeader.tsx))
- the template which is harnessing all of this is ([`socialEmbed.tsx`](client/src/main/scripts/socialEmbed.tsx))

Some example URLs are:

- long video cut: http://localhost:3000/devSocialEmbed#cut:!(2007.9000244140625,2046.1099853515625),fact:oZVEQzZXVzx3lM_PbszcA35XYBJxEDHwJirpx1c7hhg=,kind:videoCut
- short video cut: http://localhost:3000/devSocialEmbed#cut:!(2551.0849609375,2560.25),fact:DChTy6FSIkZY5lXpBzEvYoH-2OAqdQ8OXmQFo31jsfQ=,kind:videoCut

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
