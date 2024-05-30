# Dev quickstart

You will need [`nvm`](https://github.com/nvm-sh/nvm#installing-and-updating) and Java 8+ installed on your system. If you want to run the full application, you will also need [Docker](https://docs.docker.com/get-docker/).

## Frontend only

First, run `./gradlew :client:assemble`. This one-time step does code-generation into the `java2ts` folder. After that, `cd` into the `client` directory, and run

```
nvm use
npm ci
npm run proxyProd
```

and you will have dev environment which is proxying againg https://mytake.org, which is always deployed against the `prod` branch. Likewise, you can also run `npm run proxyStaging`, which proxies against https://mtdo-naked-staging.herokuapp.com, which is always deployed against the `staging` branch (which is where we accept PRs).

## Full stack

If you run `./gradlew runDev`, you will get a server running at `localhost:8080` with hot reload for server templates. You can then use the frontend instructions above with `npm run proxyDev` to get a local frontend environment.

If you bump into any problems, we have listed [common errors and their solutions](#common-errors-and-their-solutions) below.

## Entrypoints

There is a file [`Routes.java`](client/src/main/java/java2ts/Routes.java) which gets transpiled by the build into [`Routes.ts`](client/src/main/scripts/java2ts/Routes.ts). You can do symbol navigation from there to see where to start for the server and client.  Below are some of the most commonly used parts:

- [`/`](https://mytake.org/) (homepage)
  - react component [`client/src/main/scripts/components/Home.tsx`](client/src/main/scripts/components/Home.tsx)
  - styled in [`client/src/main/styles/components/_home.scss`](client/src/main/styles/components/_home.scss)
  - server template [`server/src/main/rocker/views/Placeholder/home.rocker.html`](server/src/main/rocker/views/Placeholder/home.rocker.html)
  - served by [`server/src/main/java/controllers/HomeFeed.java`](server/src/main/java/controllers/HomeFeed.java)
- [`/search?q=social%20security`](https://mytake.org/search?q=social%20security) (search)
  - react entrypoint [`client/src/main/scripts/components/search/VideoResultsLoader.tsx`](client/src/main/scripts/components/search/VideoResultsLoader.tsx)
  - styled in [`client/src/main/styles/components/_videoResults.scss`](client/src/main/styles/components/_videoResults.scss)
  - server template [`server/src/main/rocker/views/Search/searchResults.rocker.html`](server/src/main/rocker/views/Search/searchResults.rocker.html)
  - client code there triggers js call to `/api/search`
  - server code entrypoints are all in [`server/src/main/java/controllers/SearchModule.java`](server/src/main/java/controllers/SearchModule.java)
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

## Going deeper

The instructions on this page should be enough to improve and extend the existing features of the application. If you want go deeper, and add completely new functionality, you'll need to look at [`DEV_DEEPDIVE.md`](DEV_DEEPDIVE.md).

## Community

For general developer discussion, we have a chatroom on [gitter](https://gitter.im/mytakedotorg).

If you want to help, [these](https://github.com/mytakedotorg/mtdo/projects/3) are the things we think are most important. But every open issue is important, and we welcome any contribution!

## Common errors and their solutions

### Java server startup

> Couldn't connect to Docker daemon. You might need to start Docker

Start Docker!

> 'docker-compose kill' returned exit code 255

The Docker daemon probably isn't running. Start docker!

> No container found for postgres_1

```
./gradlew dockerDown
./gradlew runDev
```

> Unable to obtain connection from database: The connection attempt failed.

Just try `./gradlew runDev` again.

> IDE started by `gradlew ide` is broken

Run `./gradlew ideClean`, and then `./gradlew ide`
