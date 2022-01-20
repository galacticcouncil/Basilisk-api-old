#!/bin/bash

yarn global add pm2
pm2 --name processor start yarn -- run processor:start
