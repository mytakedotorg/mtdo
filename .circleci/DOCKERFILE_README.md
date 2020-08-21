We make a small modification to the default CircleCI environment.

To make a new one:

```
docker login
docker build -t nedtwigg/testrunner:${VERSION} .
sudo docker push nedtwigg/testrunner:${VERSION}
```

# Changelog
## [1.3.1] - 2020-08-20
### Fixed
- headless Chrome was missing `libgbm1`

## [1.3.0] - 2020-08-20
### Changed
- from `cimg/openjdk:8.0.252-node` to `8.0.262-node`
### Added
- deps needed for headless Chrome

## [1.2.0] - 2020-05-06
### Changed
- from `circleci/openjdk:8u252-node` to `cimg/openjdk:8.0.252-node`
- reduced filesize impact of adding postgres client tools

## [1.1.0] - 2020-04-28
### Added
- built-in node support
## [1.0] - 2020-04-28
- First version.