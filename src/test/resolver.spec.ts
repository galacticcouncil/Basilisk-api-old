import {useDatabase, useServer} from "./util/setup";
import expect from "expect"

import {TestBlockOverTimeResolver} from "../resolvers/test.resolver"


describe('Resolver tests', function () {

        const table_name = "public.test_block"

        useDatabase([
            //`CREATE TABLE ${table_name} ("id" character varying NOT NULL, "block_height" numeric NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "pk_constraint" PRIMARY KEY ("id"))`,
            `insert into ${table_name} (id, block_height, created_at)
             values (0, 0, '2021-07-11T11:00:00')`,
            `insert into ${table_name} (id, block_height, created_at)
             values (1, 1, '2021-07-11T11:00:20')`,
            `insert into ${table_name} (id, block_height, created_at)
             values (2, 2, '2021-07-11T11:01:00')`,
            `insert into ${table_name} (id, block_height, created_at)
             values (3, 3, '2021-07-11T11:01:00')`,
            `insert into ${table_name} (id, block_height, created_at)
             values (4, 4, '2021-07-11T11:01:00')`,
            `insert into ${table_name} (id, block_height, created_at)
             values (5, 5, '2021-07-11T11:05:00')`,
            `insert into ${table_name} (id, block_height, created_at)
             values (6, 6, '2021-07-11T11:11:00')`,
            `insert into ${table_name} (id, block_height, created_at)
             values (7, 7, '2021-07-11T11:12:00')`,
            `insert into ${table_name} (id, block_height, created_at)
             values (8, 8, '2021-07-11T11:21:00')`,
            `insert into ${table_name} (id, block_height, created_at)
             values (9, 9, '2021-07-11T11:28:00')`,
            `insert into ${table_name} (id, block_height, created_at)
             values (10, 10, '2021-07-11T11:30:00')`,
            `insert into ${table_name} (id, block_height, created_at)
             values (11, 11, '2021-07-11T11:38:00')`,
            `insert into ${table_name} (id, block_height, created_at)
             values (12, 12, '2021-07-11T11:40:00')`,
            `insert into ${table_name} (id, block_height, created_at)
             values (13, 13, '2021-07-11T11:45:00')`,
            `insert into ${table_name} (id, block_height, created_at)
             values (14, 14, '2021-07-11T11:50:00')`,
            `insert into ${table_name} (id, block_height, created_at)
             values (15, 15, '2021-07-11T11:55:00')`,
            `insert into ${table_name} (id, block_height, created_at)
             values (16, 16, '2021-07-11T12:00:00')`,
            `insert into ${table_name} (id, block_height, created_at)
             values (17, 17, '2021-07-11T12:30:00')`,
            `insert into ${table_name} (id, block_height, created_at)
             values (18, 18, '2021-07-11T13:00:00')`,
            `insert into ${table_name} (id, block_height, created_at)
             values (19, 19, '2021-07-11T13:30:00')`,
            `insert into ${table_name} (id, block_height, created_at)
             values (20, 20, '2021-07-11T14:00:00')`,
            `insert into ${table_name} (id, block_height, created_at)
             values (21, 21, '2021-07-11T14:30:00')`,
            `insert into ${table_name} (id, block_height, created_at)
             values (22, 22, '2021-07-11T15:00:00')`,
            `insert into ${table_name} (id, block_height, created_at)
             values (23, 23, '2021-07-11T15:30:00')`,
            `insert into ${table_name} (id, block_height, created_at)
             values (24, 24, '2021-07-11T16:00:00')`,
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

            client.test(`
        query {
          liquidityOverTime(quantity: 6, from: "2021-07-11T11:00", to: "2021-07-11T12:00") {
            height
            at
          }
        }

        `, {
                "liquidityOverTime": [
                    {
                        "height": "0",
                        "at": "2021-07-11T11:00:00.000Z"
                    },
                    {
                        "height": "6",
                        "at": "2021-07-11T11:11:00.000Z"
                    },
                    {
                        "height": "8",
                        "at": "2021-07-11T11:21:00.000Z"
                    },
                    {
                        "height": "10",
                        "at": "2021-07-11T11:30:00.000Z"
                    },
                    {
                        "height": "12",
                        "at": "2021-07-11T11:40:00.000Z"
                    },
                    {
                        "height": "14",
                        "at": "2021-07-11T11:50:00.000Z"
                    },
                    {
                        "height": "16",
                        "at": "2021-07-11T12:00:00.000Z"
                    }
                ]

            })


        });


        it("can fetch 10 points over time", function () {

            client.test(`
        query {
          liquidityOverTime(quantity: 60, from: "2021-07-11T11:00", to: "2021-07-11T12:00") {
            height
            at
          }
        }
        `, {
                "liquidityOverTime": [
                    {
                        "height": "0",
                        "at": "2021-07-11T11:00:00.000Z"
                    },
                    {
                        "height": "2",
                        "at": "2021-07-11T11:01:00.000Z"
                    },
                    {
                        "height": "3",
                        "at": "2021-07-11T11:01:00.000Z"
                    },
                    {
                        "height": "4",
                        "at": "2021-07-11T11:01:00.000Z"
                    },
                    {
                        "height": "5",
                        "at": "2021-07-11T11:05:00.000Z"
                    },
                    {
                        "height": "6",
                        "at": "2021-07-11T11:11:00.000Z"
                    },
                    {
                        "height": "7",
                        "at": "2021-07-11T11:12:00.000Z"
                    },
                    {
                        "height": "8",
                        "at": "2021-07-11T11:21:00.000Z"
                    },
                    {
                        "height": "9",
                        "at": "2021-07-11T11:28:00.000Z"
                    },
                    {
                        "height": "10",
                        "at": "2021-07-11T11:30:00.000Z"
                    },
                    {
                        "height": "11",
                        "at": "2021-07-11T11:38:00.000Z"
                    },
                    {
                        "height": "12",
                        "at": "2021-07-11T11:40:00.000Z"
                    },
                    {
                        "height": "13",
                        "at": "2021-07-11T11:45:00.000Z"
                    },
                    {
                        "height": "14",
                        "at": "2021-07-11T11:50:00.000Z"
                    },
                    {
                        "height": "15",
                        "at": "2021-07-11T11:55:00.000Z"
                    },
                    {
                        "height": "16",
                        "at": "2021-07-11T12:00:00.000Z"
                    }
                ]

            })
        });


        it("can fetch 4 hourly points ", function () {

            client.test(`
        query {
          liquidityOverTime(quantity: 4, from: "2021-07-11T11:00", to: "2021-07-11T15:00") {
            height
            at
          }
        }
        `, {
                    "liquidityOverTime": [
                        {
                            "height": "0",
                            "at": "2021-07-11T11:00:00.000Z"
                        },
                        {
                            "height": "16",
                            "at": "2021-07-11T12:00:00.000Z"
                        },
                        {
                            "height": "18",
                            "at": "2021-07-11T13:00:00.000Z"
                        },
                        {
                            "height": "20",
                            "at": "2021-07-11T14:00:00.000Z"
                        },
                        {
                            "height": "22",
                            "at": "2021-07-11T15:00:00.000Z"
                        }
                    ]

                }
            )
        });

    }
);