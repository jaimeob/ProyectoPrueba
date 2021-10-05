'use strict'
const Utils = require('../Utils.js')
var ObjectId = require('mongodb').ObjectID

const capitalizeFirstLetter = (word) => (word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).trim()


module.exports = (ProductDetail) => {


    ProductDetail.addDetail = async (data) => {
        let response = {
            created: false,
            edited: false
        }

        let tagsMongo = null

        if (data !== null && data !== undefined) {
            tagsMongo = await Utils.mongoFind('Tag')
        }

        if (data.data !== null && data.data !== undefined && tagsMongo !== null && tagsMongo !== undefined) {

            await Promise.all(data.data.map(async (products) => {

                let tagsToSave = []
                let featuresToSave = []


                for (let product in products) {
                    if (product.match(/^[tT]_/g)) {
                        let prod = product.trim()
                        let tag = tagsMongo.find(t => t.excelCode == prod)
                        if (tag) tagsToSave.push(tag._id)
                    }
                }


                for (let product in products) {
                    if (product.match(/^[fF]_/g)) {
                        let word = product.replace(/^[fF]_/g, "")

                        featuresToSave.push({
                            description: capitalizeFirstLetter(word),
                            value: capitalizeFirstLetter(products[product])
                        })
                    }
                }

                let objectToSave = {
                    code: products.lote,
                    title: products.title,
                    description: products.description,
                    tags: tagsToSave,
                    features: featuresToSave,
                    raiting: 0,
                    comments: []
                }

                let exist = await Utils.mongoFind('ProductDetail', { code: String(products.lote) })

                if (exist.length > 0) {
                    let update = await Utils.updateMongoDb(ProductDetail.app.models.ProductDetail, objectToSave, ObjectId(String(exist[0]._id)))
                    if (update.success) {
                        response.edited = true
                    }
                } else {
                    let create = await Utils.createMongoDB(ProductDetail.app.models.ProductDetail, objectToSave)
                    if (create.success) {
                        response.created = true
                    }
                }
            }))
        }
        return response
    }

    ProductDetail.remoteMethod('addDetail', {
        description: 'Create product with detail.',
        http: {
            path: '/create',
            verb: 'POST'
        },
        accepts: [
            { arg: 'data', type: "object", http: { source: 'body' }, require: true }
        ],
        returns: {
            arg: 'response',
            type: 'object',
            root: true
        }
    })
}