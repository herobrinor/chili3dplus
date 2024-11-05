FROM node:alpine AS builder
WORKDIR '/app'
COPY package.json .
RUN npm install --registry=https://mirrors.huaweicloud.com/repository/npm/
RUN npm install strip --save
COPY . .
RUN npm run build
 
FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html