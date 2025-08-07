# --- Stage 1: Build React App ---
FROM node:18-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm install
RUN npm install --save-dev @types/node 
COPY . .

ARG VITE_LENDING_API_URL
ARG VITE_FINES_API_URL
ENV VITE_LENDING_API_URL=$VITE_LENDING_API_URL
ENV VITE_FINES_API_URL=$VITE_FINES_API_URL


RUN npm run build

# --- Stage 2: Serve with Nginx ---
FROM nginx:alpine

# Copy built files to Nginx html directory
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom Nginx config for React Router support
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]
