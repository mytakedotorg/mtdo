# Factset how-to

Every factset has the following elements:

## `README.md`

This file describes what is in the factset, how it was built, how it has changed in the past, and how it might change in the future.

### `README.md`: Inclusion criteria

The is the most important part of the entire factset. The inclusion criteria is a **concise and complete description** of what the factset contains.

- If someone wants something to be added or removed from the factset, it should be easy to tell what the right answer is based only on the inclusion criteria.
- If someone wants to count every single thing in the factset, they should be able to. Ideally the count would be in the dozens or less, but there's no hard rule.

### `README.md`: Notes

The point of this section is to provide context for the factset.  Why is the inclusion criteria the way that it is, how might the criteria expand in the future, etc.

### `README.md`: Changelog

Anytime the factset changes in any way, it should be noted here in the changelog. All changes are categorized as either:

- Minor correction: corrected typo in blah
- *New event*: a new event took place on date blah
- *Added detail*: added more information to previously entered facts
- **Changed title of published fact**: changed the name of an existing fact
- **Retraction**: we have removed blah, we made a mistake about blah
- **Inclusion criteria change**: we made the following change to the inclusion criteria
  - ~~removed this~~ this part is the same **this part was added**
  - here is why we made this change

Work-in-progress is collected in the "Unreleased" section.  Once it is pushed live to MyTake.org, we put a version number on it according to "**bold changes**.*italic additions*.minor corrections".

### `README.md`: Acknowledgments

Be sure to credit all the sources which contributed to the factset.

## `ingredients` and `sausage` folders

The best way to edit a factset is to double-click the appropriate `GUI_<your_operating_system>` launcher, which will open a tool that can help you edit the `ingredients`, and grind them into the `sausage`.

- `ingredients` contains the easy-to-edit files which are used to write the fact down
  - it can have as many subfolders as you want, or none at all, subfolders are meaningless to the final result
  - for videos, each fact should have a matching `<name>.json`, `<name>.said`, and `<name>.vtt`
  - for documents, each fact should have a matching `<name>.json` and `<name>.md`
- `sausage` contains the compiled result, which is served directly to the MyTake.org website
  - there is an `index.json` and `build.json`, which are generated automatically
  - there is a `<fact-title>.json` for every fact (no subfolders)
    - the title is slugified from the `title` field inside the `<name>.json`
    - the content is compiled from the `ingredients`
    - the format is raw json, with some line breaks and `⌊comments⌋` added
      - these line breaks and `⌊comments⌋` are automatically removed when loaded by MyTake.org
      - they make it easy to see the diffs not only in the `ingredients`, but also in the `sausage` which gets produced


## `build.gradle`

This file configures the grinding process. It lets you put various quality-checks in place, such as enforcing the ordering or names, or using consistent spelling of certain words. You might need a programmers's help for this part.
