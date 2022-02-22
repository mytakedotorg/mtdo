# openjdk 17.0.2
# node 16.13.2
# Get the versions by `docker run nedtwigg/testrunner:{VERSION} node --version`
FROM "cimg/openjdk:17.0.2-node"

# install postres using docker space-saving technique from: https://pythonspeed.com/articles/system-packages-docker/
COPY install-packages.sh .
RUN ./install-packages.sh
