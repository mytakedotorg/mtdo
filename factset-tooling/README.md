# Factset Plugin

This folder contains the sourcecode to the `org.mytake.factset` gradle plugin, which is used to build our factset repositories and make them available on the MyTake.org website.

- [How to build a factset](FACTSET_HOWTO.md)
- [The philosophy behind a factset](FACTSET_PHILOSOPHY.md)
- [The technical design of our factset implementation](FACTSET_TECHNICAL_DESIGN.md)

# Changelog

Changelog for the `org.mytake.factset` plugin, in keepachangelog format.

## [Unreleased]

## [1.1.0] - 2020-10-27
### Added
* `grindCheck` task for running CI on a factset. `check` automatically depends on `grindCheck`.

## [1.0.5] - 2020-10-07
### Fixed
* Another attempt to fix classpath problems with the match gui.

## [1.0.4] - 2020-10-07
### Fixed
* Fix classpath problems with the match gui.

## [1.0.3] - 2020-10-06
### Fixed
* Changelog tag is now `v`.

## [1.0.2] - 2020-10-06
### Fixed
* Changelog format now has `*Added detail*` and `**Changed title of published fact**`.

## [1.0.1] - 2020-10-06
### Fixed
* Accidental imports of gradle-internal classes in the GUI.

## [1.0.0] - 2020-10-06
### Fixed
* `index.json` now has correct blob sha1 (was missing blob header).
* include `.DS_Store` in `.gitignore`
### Added
* A `gui` task, which involved a huge amount of work ([#405](https://github.com/mytakedotorg/mtdo/pull/405))
* `index.json` now has `id` and `title` fields, and the SHA1 of the `id` is prepended to every fact hash
### Changed
* Default branch is now assumed to be `staging`, just like for this repo.

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
