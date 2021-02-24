# openjdk 15.0.1
# node 14.15.0
# Get the versions by `docker run nedtwigg/testrunner:{VERSION} node --version`
FROM "cimg/openjdk:15.0.1-node"

# install postres using docker space-saving technique from: https://pythonspeed.com/articles/system-packages-docker/
COPY install-packages.sh .
RUN ./install-packages.sh
