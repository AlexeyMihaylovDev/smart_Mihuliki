# Use a Node.js base image for development
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to leverage Docker's cache
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Expose the port the app runs on (default for most React setups is 3000)
EXPOSE 3000

# Command to run the application in development mode
CMD ["npm", "start"]
