#!/bin/sh

# if you run `gradlew live` and exit with `Ctrl+C` instead of `/exit`, then you get zombies
# this kills them
killall -9 gulp
killall -9 java
