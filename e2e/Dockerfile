FROM node:lts-alpine

COPY package.json yarn.lock ./
RUN yarn
COPY ./tests ./tests

CMD yarn test