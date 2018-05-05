git pull
# pm2 stop bd
# pm2 delete bd
# pm2 start pm2production.json

set dockerid = `docker ps -a | grep "r-budousan" | awk '{print $1}'`
docker exec ${dockerid} bash -c "cd /opt/gittest/budousan-back && yarn install && pm2 stop bd && pm2 delete bd && pm2 start pm2staging.json"