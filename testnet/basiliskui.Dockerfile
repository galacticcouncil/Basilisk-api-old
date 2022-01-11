FROM node:14

RUN git clone -b feat/action-log https://github.com/galacticcouncil/Basilisk-ui.git
WORKDIR /Basilisk-ui
RUN yarn
RUN yarn build

CMD ["yarn", "start"]
