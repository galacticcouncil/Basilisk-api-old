FROM node:16
WORKDIR /src

ADD . /src

RUN chown -R node: /src

USER node
RUN yarn install
RUN npm run processor:codegen
RUN npm run processor:typegen
RUN npm run build

entrypoint ["/bin/bash"]
