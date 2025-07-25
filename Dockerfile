FROM ubuntu:22.04

# Set noninteractive frontend for smoother installs
ENV DEBIAN_FRONTEND=noninteractive

# Install dependencies
RUN apt-get update && apt-get install -y \
  curl unzip openjdk-11-jdk wget zip git \
  lib32stdc++6 lib32z1

# Install Node.js 18
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs

# Set environment variables for Android SDK
ENV ANDROID_SDK_ROOT=/opt/android-sdk
ENV PATH="${PATH}:${ANDROID_SDK_ROOT}/cmdline-tools/latest/bin:${ANDROID_SDK_ROOT}/platform-tools:${ANDROID_SDK_ROOT}/build-tools/33.0.0"

# Install Android SDK command-line tools
RUN mkdir -p ${ANDROID_SDK_ROOT}/cmdline-tools && \
    cd ${ANDROID_SDK_ROOT}/cmdline-tools && \
    wget https://dl.google.com/android/repository/commandlinetools-linux-9477386_latest.zip -O tools.zip && \
    unzip tools.zip -d temp && \
    mkdir -p ${ANDROID_SDK_ROOT}/cmdline-tools/latest && \
    mv temp/cmdline-tools/* ${ANDROID_SDK_ROOT}/cmdline-tools/latest && \
    rm -rf tools.zip temp

# Install platform-tools and build-tools (includes aapt and apksigner)
RUN yes | ${ANDROID_SDK_ROOT}/cmdline-tools/latest/bin/sdkmanager --sdk_root=${ANDROID_SDK_ROOT} \
    "platform-tools" "build-tools;33.0.0"

# Install ClamAV (optional)
RUN apt-get install -y clamav clamav-daemon && freshclam || true

# Set working directory
WORKDIR /app

# Copy source code
COPY . .

# Install app dependencies
RUN npm install

# Expose API port
EXPOSE 8000

# Start app
CMD ["npm", "start"]
