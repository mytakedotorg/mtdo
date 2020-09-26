# Factset Plugin

If you go to `mytake.org/facts` you will see a timeline with two radio buttons. Each radio button represents a factset, which is a git repository containing a set of facts.

The most important file in the repository is `README.md`. This file describes what the factset contains.

- If someone has the opinion that something should be added or removed from the factset, it should be easy to tell what the right answer is based on the `README.md`.
- If someone wants to count every single thing in the factset, they should be able to. Ideally the count would be in the dozens or less, but there's no hard rule.

After the `README.md`, the git repository has two important directories:

- `ingredients` contains the easy-to-edit files which are used to write the fact down
  - it can have as many subfolders as you want, or none at all, subfolders are meaningless
  - for videos, each fact should have a matching `<name>.json`, `<name>.said`, and `<name>.vtt`
  - for documents, each fact should have a matching `<name>.json` and `<name>.md`
- `sausage` contains the compiled result, which is served directly to the MyTake.org website
  - there is an `index.json`, which is generated automatically
  - there is a `<fact-title>.json` for every fact (no subfolders)
    - the title is slugified from the `title` field inside the `<name>.json`
    - the content is compiled from the `ingredients`
    - the format is raw json, with some line breaks and `⌊comments⌋` added
      - these line breaks and `⌊comments⌋` are automatically removed when loaded by MyTake.org
      - they make it easy to see the diffs not only in the `ingredients`, but also in the `sausage` which gets produced

The rules for how the `ingredients` directory gets turned into the `sausage` directory are set by the `build.gradle` file. You'll probably need a programmer to help with this part, or you can just copy one from an existing FactSet. The purpose of the rules is just to make sure that the fact metadata is consistent within the factset.

Finally, and most importantly, there is the `CHANGELOG.md`. This file describes how the facts are changing. As we have [described elsewhere](TODO), God's Facts don't change, but the facts that we mortals write down have typos. Maybe we'll decide to change whether transcripts should say `one-thousand` or `1,000`. Anytime a fact changes, the reason why it changed is in the changelog.

## How to use it (person)

You don't need to be a programmer to use it. If you're on Windows, double-click `gui.bat`, or if you're on Linux or Mac, double-click `gui.sh`.

## How to use it (programmer)

If you run `gradlew check`, it will tell you anything you're doing wrong, and how to fix it.  If you run

```gradle
plugins {
  id 'org.mytake.factset' version '1.0.0'
}
mtdoFactset {
  title = 'U.S. Presidential Debates'
  video {
    json {
        // setup rules to make sure that fact titles are consistent and typo free
    }
    said {
        // setup rules to make sure that transcripts use consistent spelling
    }
  }
}
```




```gradle
plugins {
  id 'org.mytake.factset' version '1.0.0'
}

mtdoFactset {
  title = 'U.S. Presidential Debates'
  video {
    json {
        meta ->
            String lastNames = meta.speakers.stream()
          .filter(speaker -> speaker.role.contains("for President"))
          .map(speaker -> {
            int lastSpace = speaker.fullName.lastIndexOf(' ');
            return speaker.fullName.substring(lastSpace + 1);
          })
          .sorted().collect(Collectors.joining(", "));
      Matcher matcher = Pattern.compile("\\((\\d) of (\\d)\\)").matcher(meta.fact.title);
      Preconditions.checkArgument(matcher.find());
      meta.fact.title = "Presidential Debate - " + lastNames + " (" + matcher.group(1) + " of " + matcher.group(2) + ")";
    }
    said {
      transcriptDefault('en-US')
    }
  }
}
```

```gradle
plugins {
  id 'org.mytake.factset'
}

mtdoFactSet {
  title = 'U.S. Founding Documents'
  document {
    json { meta ->
            String lastNames = meta.speakers.stream()
          .filter(speaker -> speaker.role.contains("for President"))
          .map(speaker -> {
            int lastSpace = speaker.fullName.lastIndexOf(' ');
            return speaker.fullName.substring(lastSpace + 1);
          })
          .sorted().collect(Collectors.joining(", "));
      Matcher matcher = Pattern.compile("\\((\\d) of (\\d)\\)").matcher(meta.fact.title);
      Preconditions.checkArgument(matcher.find());
      meta.fact.title = "Presidential Debate - " + lastNames + " (" + matcher.group(1) + " of " + matcher.group(2) + ")";
    }
    md {

    }
  }
}
```

# Changelog

## [Unreleased]
### Fixed
* `index.json` now has correct blob sha1 (was missing blob header).

## [0.2.4] - 2020-09-25
### Fixed
* Abandon shadow, can't get it to work.

## [0.2.3] - 2020-09-25
### Fixed
* No need to relocate packages.

## [0.2.2] - 2020-09-25
### Fixed
* Remove jsweet-core from the POM.

## [0.2.1] - 2020-09-25
### Fixed
* Embed jsweet-core into the fatjar.

## [0.2.0] - 2020-09-25
### Added
* Workable for demo, setup semi-fatjar.

## [0.1.0] - 2020-09-23
* First version.
