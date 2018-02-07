# budousan - backend

> ブドウさん - バックエンド

## 1. install softwares

- install git

- install node.js(version >= 8.4)

- install python(version == 2.7.x)

- install mongodb(make sure that mongodb service is on)

- i recommend to use this mongo IDE: https://studio3t.com/

- install yarn

- install visual studio code

- install pm2(production enviroment)

## 2. download source code

``` bash
cd /your/path/like/desktop
git clone https://your-git-account@github.com/mrm-xiefan/budousan-back.git
```

## 3. install dependencies

**make sure your os is 64bit architecture. if not, remove sharp in package.json!**

``` bash
cd /your/path/like/desktop/budousan-back
yarn install
```

## 4. boot backend

### if linux

``` bash
cd /your/path/like/desktop/budousan-back
npm run dev
```

### if windows

set `NODE_ENV` to enviroment, value should be "development".

``` bash
cd /your/path/like/desktop/budousan-back
npm run windev
```

## 5. development

once you change backend source code, you must reboot service to make it working.

## 6. deploy to production enviroment

make sure dist folder that frontend created is here. (/your/path/like/desktop/budousan-back/dist)

``` bash
cd /your/path/like/desktop/budousan-back
# confirm pm2
pm2 list
# if bd is not exists
pm2 start pm2production.json
# if bd is already exists and the status is offline
pm2 start bd
# if bd is already exists and the status is online
pm2 restart bd
```
