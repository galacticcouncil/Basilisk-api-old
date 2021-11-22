import {useDatabase, useServer} from "./util/setup";
import expect from "expect"

import {TestBlockOverTimeResolver} from "../resolvers/test.resolver"


describe('Resolver tests', function () {

        const table_name = "public.test_block"

        useDatabase([
            //`CREATE TABLE ${table_name} ("id" character varying NOT NULL, "block_height" numeric NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "pk_constraint" PRIMARY KEY ("id"))`,
            `insert into ${table_name} (id, block_height, created_at, pool_id)
             values (0, 0, '2021-07-11T11:00:00', 1)`,
            `insert into ${table_name} (id, block_height, created_at, pool_id)
             values (1, 1, '2021-07-11T11:00:20', 1)`,
            `insert into ${table_name} (id, block_height, created_at, pool_id)
             values (2, 2, '2021-07-11T11:01:00', 1)`,
            `insert into ${table_name} (id, block_height, created_at, pool_id)
             values (3, 3, '2021-07-11T11:01:00', 1)`,
            `insert into ${table_name} (id, block_height, created_at, pool_id)
             values (4, 4, '2021-07-11T11:01:00', 1)`,
            `insert into ${table_name} (id, block_height, created_at, pool_id)
             values (5, 5, '2021-07-11T11:05:00', 1)`,
            `insert into ${table_name} (id, block_height, created_at, pool_id)
             values (6, 6, '2021-07-11T11:11:00', 1)`,
            `insert into ${table_name} (id, block_height, created_at, pool_id)
             values (7, 7, '2021-07-11T11:12:00', 2)`,
            `insert into ${table_name} (id, block_height, created_at, pool_id)
             values (8, 8, '2021-07-11T11:21:00', 2)`,
            `insert into ${table_name} (id, block_height, created_at, pool_id)
             values (9, 9, '2021-07-11T11:28:00', 2)`,
            `insert into ${table_name} (id, block_height, created_at, pool_id)
             values (10, 10, '2021-07-11T11:30:00', 2)`,
            `insert into ${table_name} (id, block_height, created_at, pool_id)
             values (11, 11, '2021-07-11T11:38:00', 2)`,
            `insert into ${table_name} (id, block_height, created_at, pool_id)
             values (12, 12, '2021-07-11T11:40:00', 2)`,
            `insert into ${table_name} (id, block_height, created_at, pool_id)
             values (13, 13, '2021-07-11T11:45:00', 1)`,
            `insert into ${table_name} (id, block_height, created_at, pool_id)
             values (14, 14, '2021-07-11T11:50:00', 2)`,
            `insert into ${table_name} (id, block_height, created_at, pool_id)
             values (15, 15, '2021-07-11T11:55:00', 1)`,
            `insert into ${table_name} (id, block_height, created_at, pool_id)
             values (16, 16, '2021-07-11T12:00:00', 2)`,
            `insert into ${table_name} (id, block_height, created_at, pool_id)
             values (17, 17, '2021-07-11T12:30:00', 1)`,
            `insert into ${table_name} (id, block_height, created_at, pool_id)
             values (18, 18, '2021-07-11T13:00:00', 2)`,
            `insert into ${table_name} (id, block_height, created_at, pool_id)
             values (19, 19, '2021-07-11T13:30:00', 1)`,
            `insert into ${table_name} (id, block_height, created_at, pool_id)
             values (20, 20, '2021-07-11T14:00:00', 2)`,
            `insert into ${table_name} (id, block_height, created_at, pool_id)
             values (21, 21, '2021-07-11T14:30:00', 1)`,
            `insert into ${table_name} (id, block_height, created_at, pool_id)
             values (22, 22, '2021-07-11T15:00:00', 2)`,
            `insert into ${table_name} (id, block_height, created_at, pool_id)
             values (23, 23, '2021-07-11T15:30:00', 1)`,
            `insert into ${table_name} (id, block_height, created_at, pool_id)
             values (24, 24, '2021-07-11T16:00:00', 2)`,
        ])

        it('can compute chunk size', function () {
            let resolver = new TestBlockOverTimeResolver();

            expect(resolver.chunkSizeInSeconds("2021-11-11T10:00", "2021-11-11T11:00", 60)).toStrictEqual(60);
            expect(resolver.chunkSizeInSeconds("2021-11-11T10:00", "2021-11-11T11:00", 10)).toStrictEqual(360);
            expect(resolver.chunkSizeInSeconds("2021-11-11T10:00", "2021-11-11T14:00", 4)).toStrictEqual(3600);
        });
        const client = useServer()

        it('can fetch all blocks', function () {
                return client.test(`
        query MyQuery {
              testBlocks {
                id
              }
            }
        `,
                    {
                        "testBlocks": [
                            {
                                "id": "0"
                            },
                            {
                                "id": "1"
                            },
                            {
                                "id": "2"
                            },
                            {
                                "id": "3"
                            },
                            {
                                "id": "4"
                            },
                            {
                                "id": "5"
                            },
                            {
                                "id": "6"
                            },
                            {
                                "id": "7"
                            },
                            {
                                "id": "8"
                            },
                            {
                                "id": "9"
                            },
                            {
                                "id": "10"
                            },
                            {
                                "id": "11"
                            },
                            {
                                "id": "12"
                            },
                            {
                                "id": "13"
                            },
                            {
                                "id": "14"
                            },
                            {
                                "id": "15"
                            },
                            {
                                "id": "16"
                            },
                            {
                                "id": "17"
                            },
                            {
                                "id": "18"
                            },
                            {
                                "id": "19"
                            },
                            {
                                "id": "20"
                            },
                            {
                                "id": "21"
                            },
                            {
                                "id": "22"
                            },
                            {
                                "id": "23"
                            },
                            {
                                "id": "24"
                            }
                        ]
                    });
            }
        );

        it("can fetch 6 points 10 minutes apart", function () {

            return client.test(`
        query {
          testBlocksOverTime(quantity: 6, from: "2021-07-11T11:00", to: "2021-07-11T12:00") {
            block_height
            created_at
          }
        }

        `, {
                "testBlocksOverTime": [
                    {
                        "block_height": "0",
                        "created_at": "2021-07-11T11:00:00.000Z"
                    },
                    {
                        "block_height": "6",
                        "created_at": "2021-07-11T11:11:00.000Z"
                    },
                    {
                        "block_height": "8",
                        "created_at": "2021-07-11T11:21:00.000Z"
                    },
                    {
                        "block_height": "10",
                        "created_at": "2021-07-11T11:30:00.000Z"
                    },
                    {
                        "block_height": "12",
                        "created_at": "2021-07-11T11:40:00.000Z"
                    },
                    {
                        "block_height": "14",
                        "created_at": "2021-07-11T11:50:00.000Z"
                    },
                    {
                        "block_height": "16",
                        "created_at": "2021-07-11T12:00:00.000Z"
                    }
                ]

            })


        });


        it("can fetch 10 points over time", function () {

            return client.test(`
        query {
          testBlocksOverTime(quantity: 60, from: "2021-07-11T11:00", to: "2021-07-11T12:00") {
            block_height
            created_at
          }
        }
        `, {
                "testBlocksOverTime": [
                    {
                        "block_height": "0",
                        "created_at": "2021-07-11T11:00:00.000Z"
                    },
                    {
                        "block_height": "2",
                        "created_at": "2021-07-11T11:01:00.000Z"
                    },
                    {
                        "block_height": "3",
                        "created_at": "2021-07-11T11:01:00.000Z"
                    },
                    {
                        "block_height": "4",
                        "created_at": "2021-07-11T11:01:00.000Z"
                    },
                    {
                        "block_height": "5",
                        "created_at": "2021-07-11T11:05:00.000Z"
                    },
                    {
                        "block_height": "6",
                        "created_at": "2021-07-11T11:11:00.000Z"
                    },
                    {
                        "block_height": "7",
                        "created_at": "2021-07-11T11:12:00.000Z"
                    },
                    {
                        "block_height": "8",
                        "created_at": "2021-07-11T11:21:00.000Z"
                    },
                    {
                        "block_height": "9",
                        "created_at": "2021-07-11T11:28:00.000Z"
                    },
                    {
                        "block_height": "10",
                        "created_at": "2021-07-11T11:30:00.000Z"
                    },
                    {
                        "block_height": "11",
                        "created_at": "2021-07-11T11:38:00.000Z"
                    },
                    {
                        "block_height": "12",
                        "created_at": "2021-07-11T11:40:00.000Z"
                    },
                    {
                        "block_height": "13",
                        "created_at": "2021-07-11T11:45:00.000Z"
                    },
                    {
                        "block_height": "14",
                        "created_at": "2021-07-11T11:50:00.000Z"
                    },
                    {
                        "block_height": "15",
                        "created_at": "2021-07-11T11:55:00.000Z"
                    },
                    {
                        "block_height": "16",
                        "created_at": "2021-07-11T12:00:00.000Z"
                    }
                ]

            })
        });


        it("can fetch 4 hourly points ", function () {

            return client.test(`
        query {
          testBlocksOverTime(quantity: 4, from: "2021-07-11T11:00", to: "2021-07-11T15:00") {
            block_height
            created_at
          }
        }
        `, {
                    "testBlocksOverTime": [
                        {
                            "block_height": "0",
                            "created_at": "2021-07-11T11:00:00.000Z"
                        },
                        {
                            "block_height": "16",
                            "created_at": "2021-07-11T12:00:00.000Z"
                        },
                        {
                            "block_height": "18",
                            "created_at": "2021-07-11T13:00:00.000Z"
                        },
                        {
                            "block_height": "20",
                            "created_at": "2021-07-11T14:00:00.000Z"
                        },
                        {
                            "block_height": "22",
                            "created_at": "2021-07-11T15:00:00.000Z"
                        }
                    ]

                }
            )
        });

        it("can fetch 4 hourly points for pool id 1", function () {

            return client.test(`
        query {
          testBlocksOverTime(quantity: 4, from: "2021-07-11T11:00", to: "2021-07-11T15:00", pool_id: "1") {
            block_height
            created_at
            pool_id
          }
        }
        `, {
                    "testBlocksOverTime": [
                        {
                            "block_height": "0",
                            "created_at": "2021-07-11T11:00:00.000Z",
                            "pool_id": 1
                        },
                        {
                            "block_height": "17",
                            "created_at": "2021-07-11T12:30:00.000Z",
                            "pool_id": 1
                        },
                        {
                            "block_height": "19",
                            "created_at": "2021-07-11T13:30:00.000Z",
                            "pool_id": 1
                        },
                        {
                            "block_height": "21",
                            "created_at": "2021-07-11T14:30:00.000Z",
                            "pool_id": 1
                        }
                    ]

                }
            )
        });
    }
);
