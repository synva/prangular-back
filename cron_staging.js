const exec = require('child_process').exec

exec('./backup_log2s3_staging.sh', (err, stdout, stderr) => {
  if (err) {
    console.log(err)
  }
  console.log(stdout)
})
