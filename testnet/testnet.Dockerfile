#FROM node:14
#
#RUN apt-get update && curl https://getsubstrate.io -sSf | bash -s -- --fast
#RUN yarn global add polkadot-launch
#
#RUN wget -O polkadot.tar.gz https://github.com/paritytech/polkadot/archive/refs/tags/v0.9.14.tar.gz
#RUN tar -xvzf polkadot.tar.gz
#RUN mv polkadot-0.9.14 polkadot
#
#WORKDIR /polkadot/target/release
##We shuold use "set -o pipefail &&" in step below
#RUN wget https://github.com/paritytech/polkadot/releases/download/v0.9.13/polkadot
#RUN chmod +x polkadot
##RUN ["/bin/bash", "-c", "set -o pipefail && wget https://github.com/paritytech/polkadot/releases/download/v0.9.13/polkadot | chmod +x polkadot"]
#
#WORKDIR /
#
#RUN wget -O Basilisk-node.tar.gz https://github.com/galacticcouncil/Basilisk-node/archive/refs/tags/v6.1.0.tar.gz
#RUN tar -xvzf Basilisk-node.tar.gz
#RUN mv Basilisk-node-6.1.0 Basilisk-node
#
#WORKDIR /Basilisk-node/target/release
##We shuold use "set -o pipefail &&" in step below
#RUN wget https://github.com/galacticcouncil/Basilisk-node/releases/download/v6.1.0/basilisk
#RUN cp basilisk testing-basilisk
#RUN chmod +x basilisk
#RUN chmod +x testing-basilisk
##RUN ["/bin/bash", "-c", "set -o pipefail && wget https://github.com/galacticcouncil/Basilisk-node/releases/download/v6.1.0/basilisk | cp basilisk testing-basilisk | chmod +x basilisk | chmod +x testing-basilisk"]
#
#WORKDIR /
#CMD ["polkadot-launch", "/Basilisk-node/rococo-local/testing-config.json"]


FROM node:14

ENV VERSIION_POLKADOT_NODE=0.9.12
ENV VERSIION_BASILISK_NODE=6.1.0

RUN apt-get update && curl https://getsubstrate.io -sSf | bash -s -- --fast

RUN git clone -b develop https://github.com/galacticcouncil/Basilisk-api.git
WORKDIR /Basilisk-api
RUN yarn

WORKDIR /

RUN wget -O polkadot.tar.gz https://github.com/paritytech/polkadot/archive/refs/tags/v$VERSIION_POLKADOT_NODE.tar.gz
RUN tar -xvzf polkadot.tar.gz
RUN mv polkadot-$VERSIION_POLKADOT_NODE polkadot

WORKDIR /polkadot/target/release
#We shuold use "set -o pipefail &&" in step below
RUN wget https://github.com/paritytech/polkadot/releases/download/v$VERSIION_POLKADOT_NODE/polkadot
RUN chmod +x polkadot
#RUN ["/bin/bash", "-c", "set -o pipefail && wget https://github.com/paritytech/polkadot/releases/download/v0.9.13/polkadot | chmod +x polkadot"]

WORKDIR /

RUN wget -O Basilisk-node.tar.gz https://github.com/galacticcouncil/Basilisk-node/archive/refs/tags/v$VERSIION_BASILISK_NODE.tar.gz
RUN tar -xvzf Basilisk-node.tar.gz
RUN mv Basilisk-node-$VERSIION_BASILISK_NODE Basilisk-node

WORKDIR /Basilisk-node/target/release
#We shuold use "set -o pipefail &&" in step below
RUN wget https://github.com/galacticcouncil/Basilisk-node/releases/download/v$VERSIION_BASILISK_NODE/basilisk
RUN cp basilisk testing-basilisk
RUN chmod +x basilisk
RUN chmod +x testing-basilisk
#RUN ["/bin/bash", "-c", "set -o pipefail && wget https://github.com/galacticcouncil/Basilisk-node/releases/download/v6.1.0/basilisk | cp basilisk testing-basilisk | chmod +x basilisk | chmod +x testing-basilisk"]

WORKDIR /Basilisk-api
CMD ["yarn", "testnet:start"]
