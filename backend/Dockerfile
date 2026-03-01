FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
COPY backend/package*.json ./backend/
RUN npm install
COPY backend/ ./backend/
WORKDIR /app/backend
RUN npx prisma generate
RUN npm run build
EXPOSE 3001
CMD ["npm", "start"]
