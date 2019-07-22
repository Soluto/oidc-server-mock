FROM node:10-alpine

COPY package.json yarn.lock ./
RUN yarn
COPY ./tests ./tests

CMD yarn test