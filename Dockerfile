FROM node

COPY . /source/
WORKDIR /source

RUN yarn && yarn bootstrap

RUN yarn lerna run --scope vanaheim-shared build

CMD yarn dev
