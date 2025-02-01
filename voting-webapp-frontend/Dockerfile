FROM node:23 AS build

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install the application dependencies
RUN npm install --force

# Copy the rest of the application files
COPY . .

ARG NEXT_PUBLIC_API_SERVER
ENV NEXT_PUBLIC_API_SERVER=$NEXT_PUBLIC_API_SERVER

RUN npm run build

FROM nginx:1.27.3-alpine

ARG NGINX_HSTS
ENV NGINX_HSTS=$NGINX_HSTS
ENV NGINX_ENVSUBST_OUTPUT_DIR=/etc/nginx

COPY nginx.conf.template /etc/nginx/templates/nginx.conf.template
COPY --from=build /app/out /usr/share/nginx/html

EXPOSE 80
