# openjdk 11.0.9
# node 14.15.0
# Get the versions by `docker run nedtwigg/testrunner:{VERSION} node --version`
FROM "cimg/openjdk:11.0.9-node"

# install postres using docker space-saving technique from: https://pythonspeed.com/articles/system-packages-docker/
COPY install-packages.sh .
RUN ./install-packages.sh
