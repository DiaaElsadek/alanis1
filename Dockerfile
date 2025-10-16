# Use the official lightweight Node.js image.
FROM node:20-alpine as build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build

# Production image, copy all the files and run next
FROM node:20-alpine as production
WORKDIR /app
COPY --from=build /app .
EXPOSE 3000
CMD ["npm", "start"]
