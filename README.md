# prangular - backend

> prangular - バックエンド

## 1. install softwares

- install git

- install node.js(version >= 8.4)

- install python(version == 2.7.x)

- install awscli and configure s3

``` bash
pip install awscli
aws configure
AWS Access Key ID [None]: any key
AWS Secret Access Key [None]: any secret
Default region name [None]: any region
Default output format [None]: json
```

- install mongodb(make sure that mongodb service is on) and create db user

``` bash
brew install mongodb
brew services start mongodb
# make sure mongo is working.
mongo
# create user.
use prangular
db.createUser({
  user: "prangular",
  pwd: "prangular.123",
  roles: [{role: "readWrite", db: "prangular"}]
})
# exit mongo
exit
# restart service
brew services restart mongodb
# config file is here if necessary
vim /usr/local/etc/mongod.conf

# if you installed without brew, you may use this command to serve mongodb
sudo mongod --fork --dbpath /var/lib/mongodb --logpath /var/log/mongodb.log
```

- i recommend to use this mongo IDE: https://studio3t.com/

- install yarn

- install visual studio code

- install pm2(production enviroment)

## 2. download source code

``` bash
cd /your/path/like/desktop
git clone https://your-git-account@github.com/synva/prangular-back.git
```

## 3. install dependencies

``` diff
- make sure your os is 64bit architecture. if not, remove sharp in package.json!
```

``` bash
cd /your/path/like/desktop/prangular-back
yarn install
```

## 4. boot backend

### if linux

``` bash
cd /your/path/like/desktop/prangular-back
npm run dev
```

### if windows

set `NODE_ENV` to enviroment, value should be "development".

``` bash
cd /your/path/like/desktop/prangular-back
npm run windev
```

## 5. development

once you change backend source code, you must reboot service to make it working.

## 6. deploy to production enviroment

make sure dist folder that frontend created is here. (/your/path/like/desktop/prangular-back/dist)

``` bash
cd /your/path/like/desktop/prangular-back
# confirm pm2
pm2 list
# if bd is not exists
pm2 start pm2production.json
# if bd is already exists and the status is offline
pm2 start bd
# if bd is already exists and the status is online
pm2 restart bd
```
