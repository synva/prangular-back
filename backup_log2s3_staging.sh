#!/bin/bash

PROG=`basename $0`
LOCKFILE="/tmp/${PROG}.lock"
TIMESTAMP="/tmp/${PROG}.log"
#DATE=`date +%Y-%m-%d --date '1 day ago'`
DATE=`date +%Y-%m-%d`
DELETE_DATE=`date +%Y-%m-%d --date '7 day ago'`
BUCKET="budousan-backup/staging/budousan-back"
BACKUP_LIST=`ls ${BACKUP_PATH} | grep $DATE`
DELETE_LIST=`ls ${BACKUP_PATH} | grep $DELETE_DATE`
BACKUP_PATH="/opt/log/budousan/budousan-back/"

### error
error(){

log "ERROR: $1"
exit 1;
}

### log
log(){
    echo "[`date '+%Y/%m/%d %k:%M:%S'`($$)] $1" >> ${BACKUP_PATH}/backup.log
}

log "*** start ${PROG} ***"
log "DATE:$DATE"
log "BACKUP_PATH:$BACKUP_PATH"
log "BACKUP_LIST:$BACKUP_LIST"
log "DELETE_LIST:$BACKUP_LIST"

### to s3
for list in ${BACKUP_LIST}
do
  log "backup:${list}"
  [ -f "${BACKUP_PATH}/${list}" ] || error "not found backup file.${BACKUP_PATH}/${list}"

  aws s3 cp ${BACKUP_PATH}/${list} s3://${BUCKET}/${DATE}/${list}

  log "FINISHED BACKUP s3://${BUCKET}/${DATE}/${list}"
done

echo ${DELETE_LIST}
for list in ${DELETE_LIST}
do
  log "delete:${list}"
  rm -f ${list}
  log "deleted"
done

log "*** finish ${PROG} ***"

exit