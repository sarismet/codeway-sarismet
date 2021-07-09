FROM node:10-alpine3.10
WORKDIR /usr/src/app
EXPOSE 8080
COPY package.json package*.json ./
RUN npm install --only=production
COPY . .
CMD ["node", "init.js", "topic_test", "sub_test", "dataset_test", "table_test"]
CMD ["node", "main-server/index.js", "topic_test", "dataset_test", "table_test"]
CMD ["node", "info-register-server/index.js", "topic_test", "dataset_test", "table_test"]
