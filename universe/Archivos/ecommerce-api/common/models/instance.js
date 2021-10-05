'use strict'

const fs = require("fs")

module.exports = function(Instance) {
	Instance.observe('loaded', function loaded(ctx, next) {
    fs.readFile(__dirname + '/../..' + ctx.data.configs.es, 'utf8', function (err, data) {
      if (err) {
  		  console.log(err)
        next()
      }
	  	else {
        delete ctx.data.configs.es
        delete ctx.data.configs.en
        ctx.data.langs = {
          es: JSON.parse(data),
          en: JSON.parse(data)
        }

	  	  next()
	  	}
  	})
	})
}
