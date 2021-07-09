FROM node:10-alpine3.10
WORKDIR /usr/src/app
EXPOSE 8080
COPY package.json package*.json ./
RUN npm install --only=production
COPY . .
CMD ["node", "init.js", "topic-test", "sub-test", "dataset-test", "table-test"]
CMD ["node", "main-server/index.js", "topic-test", "dataset-test", "table-test"]
CMD ["node", "info-register-server/index.js", "topic-test", "dataset-test", "table-test"]
