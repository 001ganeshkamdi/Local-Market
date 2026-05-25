#!/bin/bash

# Start Spring Boot backend
cd localmarket
./mvnw spring-boot:run &

# Go back to root folder
cd ..

# Start React frontend
cd localmarket-ui
npm run dev &

# Keep script running
wait
