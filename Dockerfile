FROM node:alpine

WORKDIR /app
COPY package.json .
RUN apk add --update --no-cache git \
 && npm install \
 && apk del git
COPY . .

ENTRYPOINT ["node"]
CMD ["build/dev-server.js"]