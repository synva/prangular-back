#!/bin/bash

git pull
# pm2 stop bd
# pm2 delete bd
# pm2 start pm2production.json

dockerid=`docker ps -a | grep "r-budousan" | awk '{print $1}'`

if [ "${dockerid}" == "" ]; then
  docker exec `docker ps -a | grep "st_nodejs" | awk '{print $1}'` /bin/bash -c "cd /opt/gittest/budousan-back && yarn install && pm2 stop bd && pm2 delete bd && pm2 start pm2production.json"
else
  docker exec `docker ps -a | grep "r-budousan" | awk '{print $1}'` /bin/bash -c "cd /opt/budousan-back && yarn install && pm2 stop bd && pm2 delete bd && pm2 start pm2production.json"
fi