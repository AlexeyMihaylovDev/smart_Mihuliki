# Build stage
FROM node:20-alpine as build
WORKDIR /app
# We only copy the root package.json and frontend package.json for caching
COPY package*.json ./
COPY frontend/package*.json ./frontend/
RUN npm install
# Copy rest of the frontend source
COPY frontend/ ./frontend/
WORKDIR /app/frontend
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/frontend/dist /usr/share/nginx/html
# Update nginx config for SPA routing
RUN printf 'server {\n    listen 80;\n    server_name localhost;\n    location / {\n        root /usr/share/nginx/html;\n        index index.html index.htm;\n        try_files $uri $uri/ /index.html;\n    }\n}\n' > /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
