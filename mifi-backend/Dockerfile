# Use temurin java image as base image
FROM eclipse-temurin:22

# Set an argument that defines the place of the JAR file
ARG JAR_FILE=target/*.jar

# Copy JAR file to container
COPY ${JAR_FILE} app.jar

# Run Java application
ENTRYPOINT ["java", "-jar", "/app.jar"]