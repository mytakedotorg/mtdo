# openjdk 8u252
# node 12.16.1 https://github.com/CircleCI-Public/cimg-openjdk/blob/c227f885567abfd075025b10671a31be8c147c7c/8.0/node/Dockerfile
FROM "cimg/openjdk:8.0.262-node"

# install postres using docker space-saving technique from: https://pythonspeed.com/articles/system-packages-docker/
COPY install-packages.sh .
RUN ./install-packages.sh
