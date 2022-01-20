# Dockerized testnet and indexer/processor infrastructure

###**⚠️ Available ONLY for usage in GH Actions linux/amd64 runners for now. ⚠️**

You can use yarn command `yarn fullruntime:clean-setup-start` which can 
- run testnet container 
- clear/config processor
- run processor container
- run indexer infra containers

This image is used for testnet container - [polkadot-basilisk-testnet-multiarch](https://hub.docker.com/r/mckrava/polkadot-basilisk-testnet-multiarch)

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
                "Name": "polkadot-basilisk-testnet",
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

CONTAINER ID   IMAGE                                                            COMMAND                  CREATED         STATUS         PORTS                                                                                      NAMES
ed065cc21a5e   subsquid/hydra-indexer-gateway:5                                 "/docker-entrypoint.…"   3 minutes ago   Up 2 minutes   0.0.0.0:4010->8080/tcp                                                                     basilisk-indexer-indexer-gateway-1
72a53e1f6364   subsquid/hydra-indexer:5                                         "docker-entrypoint.s…"   3 minutes ago   Up 2 minutes                                                                                              basilisk-indexer-indexer-1
db13a16b8983   subsquid/hydra-indexer-status-service:5                          "docker-entrypoint.s…"   3 minutes ago   Up 3 minutes                                                                                              basilisk-indexer-indexer-status-service-1
9ef9c4eafc96   postgres:12                                                      "docker-entrypoint.s…"   3 minutes ago   Up 3 minutes   5432/tcp                                                                                   basilisk-indexer-db-1
eebd1c360e8d   redis:6.0-alpine                                                 "docker-entrypoint.s…"   3 minutes ago   Up 3 minutes   0.0.0.0:61853->6379/tcp                                                                    basilisk-indexer-redis-1
401096870f6a   postgres:12                                                      "docker-entrypoint.s…"   3 minutes ago   Up 3 minutes   0.0.0.0:5433->5432/tcp                                                                     db-processor
64135c5db793   mckrava/polkadot-basilisk-testnet-multiarch:6.1.1-0.9.13-0.1.1   "docker-entrypoint.s…"   5 minutes ago   Up 5 minutes   127.0.0.1:9944->9944/tcp, 127.0.0.1:9988-9989->9988-9989/tcp, 127.0.0.1:30333->30333/tcp   polkadot-basilisk-testnet
```

Docker-compose config `dockerized-network.yml` is using together with `processor-docker-compose.yml` and `./indexer/docker-compose.yml` for
adding `networks` parameter.