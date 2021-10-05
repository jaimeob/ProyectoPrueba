'use strict'

const Utils = require('../Utils.js')
const mongodb = require('../classes/mongodb.js')
const ObjectId = require('mongodb').ObjectID

module.exports = function(Block) {
  Block.observe('loaded', async (ctx) => {
    const db = mongodb.getConnection('db')
    if (ctx.data.blockTypeId === 18) {
      await Utils.asyncForEach(ctx.data.configs, async (item) => {
        item.carousel = await mongodb.mongoFind(db, 'Block', { _id: ObjectId(item.carousel) })
        if (item.carousel.length === 1) {
          item.carousel = item.carousel[0]
        }
      })
    }
  })
}
