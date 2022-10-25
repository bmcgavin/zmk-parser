FROM node:18-alpine

WORKDIR /app

COPY package.json yarn.lock /app/
RUN yarn install --frozen-lockfile --production

COPY server.js /app/
COPY dist /app/dist/

EXPOSE 8080

ENTRYPOINT [ "node", "server.js" ]