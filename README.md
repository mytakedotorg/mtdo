# [MyTake.org](https://mytake.org)

[![Travis CI](https://travis-ci.org/mytakedotorg/mytakedotorg.svg?branch=master)](https://travis-ci.org/mytakedotorg/mytakedotorg)
[![License GPLv2](https://img.shields.io/badge/license-GPLv2-brightgreen.svg)](https://tldrlegal.com/license/gnu-general-public-license-v2)
[![Live chat](https://img.shields.io/badge/gitter-chat-brightgreen.svg)](https://gitter.im/mytakedotorg/mytakedotorg)

MyTake.org is a mind bicycle for politics.  It's a website for writing essays ("takes") about U.S. politics, similar to Medium.com, except that users can link only to a finite set of [undisputed facts](https://mytake.org/foundation).  By focusing on primary sources that both sides agree are accurate and fair, we make it easier to engage on substance rather than being distracted by name calling or accusations of bias.

The MyTake.org "foundation" of undisputed facts includes only facts which meet all of the following criteria:

- must be a primary source (because primary sources aren't subjective opinions, they really happened)
- must be official (because it's easy to verify that they are authentic and not forged)
- complete and unedited (to make sure it can't be taken out of context)
- part of a large and complete set (to prevent selection bias)

Taking the U.S. Presidential debates as an example, they fit the rubric because:

- must be a primary source: a candidate might have lied, but it is true that they said what they said
- must be official: we only include the official stage debate, not backstage rumors
- complete and unedited: we include the full debate without commentary
- part of a large and complete set: there have been many presidential debates, and we include every single one - this ensures that MyTake.org can't be a victim of selection bias where we only show the subset of debates that support a particular viewpoint

If you'd like to write a take, [create an account](https://mytake.org/login) and get to writing!  If you'd like to read some takes, [see what people are writing here](https://mytake.org).

If you're a programmer or designer and you'd like to improve the site, it's really easy to run the site on your laptop by following the instructions below.  See [CONTRIBUTING.md](CONTRIBUTING.md) for our project management guidelines.

# Build instructions

## Quickstart

- Run `./gradlew runDev`, and you'll get a server running at `localhost:8080`.
- If you then `cd` into the `client` directory and run `gulp proxyDev`, you'll get a [Browsersync](https://www.browsersync.io/) instance proxying `localhost:8080`.
    + Changes to sass files in [`/client/src/main/styles`](client/src/main/styles) will be pushed to the browser instantly. 
    + Changes to typescript files in [`/client/src/main/scripts`](client/src/main/scripts) will be compiled by webpack hot reload, but require a browser refresh to see their effects.
- We use [VSCode](https://code.visualstudio.com/) for client-side development.
- For server development, run `./gradlew ide`, and it will launch an Eclipse IDE preconfigured for the MyTake.org project.
- You can see the full task dependencies in [gradleTaskGraph.pdf](gradleTaskGraph.pdf).

### Code sharing between java and typescript (jsweet)

The `:client:jsweet` task transpiles the java in [`/client/src/main/java/java2ts`](client/src/main/java/java2ts) into TypeScript that lives in `/client/src/main/typescript/java2ts`, using [jsweet](http://www.jsweet.org/).  This ensures that the structured data sent back and forth between the server and browser is typed correctly.

The [`/client/src/main/java/java2ts/CodegenConfig.java`](client/src/main/java/java2ts/CodegenConfig.java) file is used by the `:client:jsoniterCodegen` task to generate the java code needed to parse and decode these classes as JSON.

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

## Update dependencies

Update gradle dependencies with `./gradlew dependencyUpdates` ([ref](https://github.com/ben-manes/gradle-versions-plugin)).

Update npm dependencies in client folder with

```
npm outdated               - shows which packages are out of date
npm update <packagename>   - updates packagename to "Wanted", but won't pass semver
```
