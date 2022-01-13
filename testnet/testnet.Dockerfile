# Polkadot-launch is not compatible with node >= 15 so we must use node:14
FROM node:14

ENV VERSIION_POLKADOT_NODE=0.9.14
ENV VERSIION_BASILISK_NODE=6.1.0

RUN apt-get update && curl https://getsubstrate.io -sSf | bash -s -- --fast

#RUN git clone -b feature/dockerize-testnet https://github.com/galacticcouncil/Basilisk-api.git
COPY . /Basilisk-api
WORKDIR /Basilisk-api
RUN yarn

WORKDIR /

RUN wget -O polkadot.tar.gz https://github.com/paritytech/polkadot/archive/refs/tags/v$VERSIION_POLKADOT_NODE.tar.gz
RUN tar -xvzf polkadot.tar.gz
RUN mv polkadot-$VERSIION_POLKADOT_NODE polkadot

WORKDIR /polkadot/target/release

RUN wget https://github.com/paritytech/polkadot/releases/download/v$VERSIION_POLKADOT_NODE/polkadot
RUN chmod +x polkadot

WORKDIR /

RUN wget -O Basilisk-node.tar.gz https://github.com/galacticcouncil/Basilisk-node/archive/refs/tags/v$VERSIION_BASILISK_NODE.tar.gz
RUN tar -xvzf Basilisk-node.tar.gz
RUN mv Basilisk-node-$VERSIION_BASILISK_NODE Basilisk-node

WORKDIR /Basilisk-node/target/release
RUN wget https://github.com/galacticcouncil/Basilisk-node/releases/download/v$VERSIION_BASILISK_NODE/basilisk
RUN cp basilisk testing-basilisk
RUN chmod +x basilisk
RUN chmod +x testing-basilisk

WORKDIR /Basilisk-api
CMD ["yarn", "testnet:start"]
