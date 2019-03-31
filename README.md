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
- Run `cd node && gulp`, and you'll get a node server running at `localhost:4000` (`Ctrl-C` twice to stop).
- If you then `cd` into the `client` directory and run `gulp proxyDev`, you'll get a [Browsersync](https://www.browsersync.io/) instance proxying `localhost:8080`.
    + Changes to sass files in [`/client/src/main/styles`](client/src/main/styles) will be pushed to the browser instantly. 
    + Changes to typescript files in [`/client/src/main/scripts`](client/src/main/scripts) will be compiled by webpack hot reload, but require a browser refresh to see their effects.
- We use [VSCode](https://code.visualstudio.com/) for client-side development.
- For server development, run `./gradlew ide`, and it will launch an Eclipse IDE preconfigured for the MyTake.org project.
    + Run the main in `DevHotReload` for fast server development.
- You can see the full task dependencies in [gradleTaskGraph.pdf](gradleTaskGraph.pdf).

## Mac and Docker

The build needs docker-compose to run.  Here are the instructions for mac:

- Download and install [from the Docker site](https://store.docker.com/editions/community/docker-ce-desktop-mac).
    + Normally I prefer `brew`, but I couldn't get it to work.
- If the build fails with `Couldn't connect to Docker daemon. You might need to start Docker for Mac.`, but it's already started, try: `docker-machine start default`.
- To kill all docker containers: `docker kill $(docker ps -q)`

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

# Data Model

See [`foundation-gen/FOUNDATION_DESIGN.md`](foundation-gen/FOUNDATION_DESIGN.md) for info on how the foundation.

## VideoFactContent
To help understand the data model, let's build it using a 14 word sample:

**Raddatz:**  Good evening I'm Martha Raddatz from ABC News.
**Cooper:**  And I'm Anderson Cooper from CNN.

```
VideoFactContent = {
  speakers: [
    {
      firstname: Martha, 
      lastname: Raddatz
    }, 
    {
      firstname: Anderson, 
      lastname: Cooper
    }
  ],
  charOffsets: [0, 5, 13, 17, 24, 32, 37, 41, 47, 51, 55, 64, 71, 76], // Length 14, 1 entry for each word
  timeStamps: [/* Length 14, omitting data for brevity */],
  speakerPerson: [0, 1], // 2 people have spoken, first Raddatz, then Cooper. 
  speakerWord: [0, 8], // 2 people have spoken, Raddatz at word 0, Cooper at word 8
  ... // Other fields are self explanatory, like youtubeId
}
```

Now, let's say "Martha Raddatz" has been highlighted:

**Raddatz:**  Good evening I'm **Martha Raddatz** from ABC News.
**Cooper:**  And I'm Anderson Cooper from CNN.

We represent this in the client code as:
```
charRange = [17, 32]
timeRange = [1.92, 2.129]
```

# meta.MyTake.org

## Header syncing
When the MyTake.org header is updated, the meta.mytake.org header needs to be updated too. Login to meta.mytake.org as an admin and navigate to **Admin -> Customize -> MyTake.org Header -> Edit CSS/HTML**

In the **CSS** tab paste the compiled SASS for only the `.header` component. These styles are grouped together inside `client/src/main/resources/assets-dev/styles/main.css`. Also do the following:

* Increase the `.header` z-index to 10000.
* Replace `width: 768px;` to `width: 1110px;` everywhere it is present. (Do not change media queries).
* Convert and replace all rem units with px. In MyTake.org 1rem = 10px;
* Adjust any other styles as necessary and document them.

In the **Header** tab paste the html for the `<header>` tag. Copy this from the mytake.org homepage from the Chrome Developer tools by right clicking on the `<header>` tag and then **Copy -> Copy outerHTML**. Also do the following:

* Replace all relative href attributes with absolute URLs to http://mytake.org.
* Remove the `.header__searchbar` div from the header.
* Remove the `.header__usernav` div from the header.

In the **</body>** tab do the following:

* Add the following JS, making sure to update the scrollY conditional check to match the height of the header.

```
<script type="text/javascript">
"use strict"
setTimeout(function () { addScrollEvent(); }, 500);
function addScrollEvent() {
	var body = document.body;
	var dHeader = document.getElementsByClassName("d-header")[0];
	var headerHeight;
    if (window.innerWidth > 768) {
        headerHeight = 100;
    } else {
        headerHeight = 80;
    }
    function handleScroll(e) {
        if (dHeader) {
            if (window.scrollY >= headerHeight) {
                body.classList.add("docked");
            }
            else {
                body.classList.remove("docked");
            }
        }
    }
    window.addEventListener("scroll", handleScroll);
}
</script>
```
