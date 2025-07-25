FROM ubuntu:22.04

# Install Node.js
RUN apt-get update && apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs

# Install Java and required tools
RUN apt-get update && apt-get install -y openjdk-11-jdk unzip wget

# Set environment variables
ENV ANDROID_SDK_ROOT=/opt/android-sdk
ENV PATH="${PATH}:${ANDROID_SDK_ROOT}/cmdline-tools/tools/bin:${ANDROID_SDK_ROOT}/platform-tools:${ANDROID_SDK_ROOT}/build-tools/33.0.0"

# Install Android SDK command-line tools
RUN mkdir -p ${ANDROID_SDK_ROOT}/cmdline-tools && \
    cd ${ANDROID_SDK_ROOT}/cmdline-tools && \
    wget https://dl.google.com/android/repository/commandlinetools-linux-9477386_latest.zip -O tools.zip && \
    unzip tools.zip && rm tools.zip && mv cmdline-tools tools

# Install sdkmanager packages (build-tools contains apksigner)
RUN yes | sdkmanager --sdk_root=${ANDROID_SDK_ROOT} \
    "platform-tools" "build-tools;33.0.0"

# Copy your app files
WORKDIR /app
COPY . .

# Install app dependencies
RUN npm install

# Expose the port your app runs on
EXPOSE 10000

# Start the app
CMD ["npm", "start"]
