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

## Quickstart

- Run `./gradlew runDev`, and you'll get a server running at `localhost:8080`.
- If you `cd` into the `client` directory and run `gulp proxyDev`, you'll get a [Browsersync](https://www.browsersync.io/) instance proxying `localhost:8080`.
    + Changes to sass files in [`/client/src/main/styles`](client/src/main/styles) will be pushed to the browser instantly. 
    + Changes to typescript files in [`/client/src/main/scripts`](client/src/main/scripts) will be compiled by webpack hot reload, but require a browser refresh to see their effects.
- We use [VSCode](https://code.visualstudio.com/) for client-side development.
- For server development, run `gradlew ide`, and it will launch an Eclipse IDE preconfigured for the MyTake.org project.
- You can see the full task dependencies in [gradleTaskGraph.pdf](gradleTaskGraph.pdf).

### Code sharing between java and typescript (jsweet)

The `:client:jsweet` task transpiles the java in [`/client/src/main/java/java2ts`](client/src/main/java/java2ts) into TypeScript that lives in `/client/src/main/typescript/java2ts`, using [jsweet](http://www.jsweet.org/).  This ensures that the structured data sent back and forth between the server and browser is typed correctly.

### Database schema management and typesafe queries (Postgres, Flyway, and jOOQ)

The `:server:jooq` task:

- Starts a Postgres process using [otj-pg-embedded](https://github.com/opentable/otj-pg-embedded).
- Runs the SQL scripts in [`/server/src/main/resources/db/migration`](server/src/main/resources/db/migration) using [flyway](https://flywaydb.org/) to set the database's schema.
- Generates java code for all tables using [jooq](https://www.jooq.org/), and puts the result in `/server/src/main/jooq-generated`.

### Typesafe server templates (rocker)

The `:server:compileRocker` task transpiles the [rocker templates](https://github.com/fizzed/rocker) in [`/server/src/main/rocker`](server/src/main/rocker) into java code in `/server/src/main/rocker-generated`.

### Live (broken)

If you run `./gradlew live`, you'll get:

- a server at `localhost:8080` with hot reload on its rocker templates
- a browsersync proxying it with hot reload for sass and typescript

But it's unreliable.  1 in 2 starts works, and it crashes itself quickly.  Not recommended for use, but it would be great to have help getting it to work.  The code [lives here](buildSrc/src/main/java/org/mytake/gradle/live/LivePlugin.java), and uses [spring-loaded](https://github.com/spring-projects/spring-loaded) for hot reloading.

## Travis CI

Travis runs `./gradlew check`

## Heroku deployment

Every PR is deployed in a test instance on Heroku.  The code is deployed as a fat jar, which you can preview using `./gradlew shadowJar`.

## update deps

Update gradle deps with `./gradlew dependencyUpdates` ([ref](https://github.com/ben-manes/gradle-versions-plugin)).

Update npm deps in client folder with

```
npm outdated               - shows which packages are out of date
npm update <packagename>   - updates packagename to "Wanted", but won't pass semver
```
