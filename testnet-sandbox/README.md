# Dockerized testnet and indexer/processor infrastructure

###**⚠️ Available ONLY for usage in GH Actions linux/amd64 runners for now. ⚠️**

You can use yarn command `yarn fullruntime:clean-setup-start` which can 
- run testnet container 
- clear/config processor
- run processor container
- run indexer infra containers

This image is used for testnet container - [polkadot-basilisk-testnet-sandbox-multiarch](https://hub.docker.com/r/mckrava/polkadot-basilisk-testnet-sandbox-multiarch)

You will get testnet/processor/indexer infrastructure fully ready for work and testing.
All containers are wrapped into one docker network `basilisk-wrapper-network` what allows to use a service name as path
to appropriate container instead of ip.

As result, you will see such config:

```shell
> docker network inspect basilisk-wrapper-network

[
    {
        "Name": "basilisk-wrapper-network",
        ...
        "Driver": "bridge",
        "EnableIPv6": false,
        ...
        "Containers": {
            "<container_id>": {
                "Name": "db-processor",
                ...
            },
            "container_id": {
                "Name": "polkadot-basilisk-testnet-sandbox",
                ...
            },
            "container_id": {
                "Name": "basilisk-indexer-indexer-1",
                ...
            },
            "container_id": {
                "Name": "basilisk-indexer-db-1",
                ...
            },
            "container_id": {
                "Name": "basilisk-indexer-indexer-status-service-1",
                ...
            },
            "container_id": {
                "Name": "basilisk-indexer-indexer-gateway-1",
                ...
            },
            "container_id": {
                "Name": "basilisk-indexer-redis-1",
                ...
            }
        },
        ...
    }
]
```

```shell
> docker container ls

CONTAINER ID   IMAGE                                                            COMMAND                  CREATED         STATUS              PORTS                                                                                      NAMES
bdd28c3f70cb   subsquid/hydra-indexer-gateway:5                                         "/docker-entrypoint.…"   2 minutes ago   Up About a minute   0.0.0.0:4010->8080/tcp                                                                     basilisk-indexer-indexer-gateway-1
cef4d962fad0   subsquid/hydra-indexer-status-service:5                                  "docker-entrypoint.s…"   2 minutes ago   Up About a minute                                                                                              basilisk-indexer-indexer-status-service-1
d24ae6dfaf23   subsquid/hydra-indexer:5                                                 "docker-entrypoint.s…"   2 minutes ago   Up About a minute                                                                                              basilisk-indexer-indexer-1
5bdfb331d40c   redis:6.0-alpine                                                         "docker-entrypoint.s…"   2 minutes ago   Up 2 minutes        0.0.0.0:56031->6379/tcp                                                                    basilisk-indexer-redis-1
29c3dd572b95   postgres:12                                                              "docker-entrypoint.s…"   2 minutes ago   Up 2 minutes        5432/tcp                                                                                   basilisk-indexer-db-1
805bdad366be   postgres:12                                                              "docker-entrypoint.s…"   2 minutes ago   Up 2 minutes        0.0.0.0:5433->5432/tcp                                                                     db-processor
1572e277425f   mckrava/polkadot-basilisk-testnet-sandbox-multiarch:6.1.1-0.9.13-0.1.3   "docker-entrypoint.s…"   4 minutes ago   Up 4 minutes        127.0.0.1:9944->9944/tcp, 127.0.0.1:9988-9989->9988-9989/tcp, 127.0.0.1:30333->30333/tcp   polkadot-basilisk-testnet-sandbox
```

Docker-compose config `dockerized-network.yml` is using together with `processor-docker-compose.yml` and `./indexer/docker-compose.yml` for
adding `networks` parameter.

Dockerized testnet generates a folder (volume) `./testnet-sandbox-logs` 
which contains `polkadot-launch` logs from container path `./Basilisk-api/logs`. This logs can be saved in GH Action workflow as 
artifacts for further investigation.