#!/bin/bash

# Bash "strict mode", to help catch problems and bugs in the shell
# script. Every bash script you write should include this. See
# http://redsymbol.net/articles/unofficial-bash-strict-mode/ for
# details.
set -euo pipefail

# Tell apt-get we're never going to be able to give manual
# feedback:
export DEBIAN_FRONTEND=noninteractive

# Update the package listing, so we know what package exist:
sudo apt-get update

# Install security updates:
# apt-get -y upgrade

# Install a new package, without unnecessary recommended packages:
sudo apt-get -y install --no-install-recommends postgresql-client

# Install dependencies of headless chrome
# https://circleci.com/orbs/registry/orb/threetreeslight/puppeteer 0.1.2 (latest as of 2020-08-20)
sudo apt-get install -yq \
          gconf-service libasound2 libatk1.0-0 libatk-bridge2.0-0 libc6 libcairo2 libcups2 libdbus-1-3 \
          libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 \
          libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 \
          libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates \
          fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils wget

# Delete cached files we don't need anymore:
sudo apt-get clean
sudo rm -rf /var/lib/apt/lists/*
