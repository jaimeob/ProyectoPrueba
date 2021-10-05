let path = require('path')
let fs = require("fs")

if (process.env.ENV === 'production') {
  exports.privateKey = fs.readFileSync(path.join('/etc/letsencrypt/live/api.calzzapato.com/privkey.pem')).toString()
  exports.certificate = fs.readFileSync(path.join('/etc/letsencrypt/live/api.calzzapato.com/fullchain.pem')).toString()
}
else if (process.env.ENV === 'staging') {
  exports.privateKey = fs.readFileSync(path.join('/etc/letsencrypt/live/calzzapato.dev/privkey.pem')).toString()
  exports.certificate = fs.readFileSync(path.join('/etc/letsencrypt/live/calzzapato.dev/fullchain.pem')).toString()
}
else {
	exports.privateKey = ''
	exports.certificate = ''
}
