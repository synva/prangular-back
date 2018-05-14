git pull
# pm2 stop bd
# pm2 delete bd
# pm2 start pm2production.json

#set dockerid = `docker ps -a | grep "r-budousan" | awk '{print $1}'`
docker exec `docker ps -a | grep "budousan" | awk '{print $1}'` /bin/bash -c "cd /opt/budousan-back && yarn install && pm2 stop bd && pm2 delete bd && pm2 start pm2production.json"