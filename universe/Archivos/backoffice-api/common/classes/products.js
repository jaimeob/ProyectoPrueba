const configs = require('../configs.development.json')
const Utils = require('../Utils')
const NODE_ENV = process.env.NODE_ENV || 'development'
let environment = '../../server/datasources.development.json'

if (NODE_ENV === 'staging') {
    environment = '../../server/datasources.staging.json'
} else if (NODE_ENV === 'production') {
    environment = '../../server/datasources.json'
}



// ORIENTACION
const getProductsRelation = async (db, users) => {
    let response = []
    try {
        let products = []
        let productsBody = []
        await Utils.asyncForEach(users, async (user) => {


            let result = await Utils.request({
                method: 'POST',
                url: configs.HOST_IP_ECOMMERCE + ':' + configs.PORT_IP_ECOMMERCE + '/api/users/recomendation-mailing/products',
                json: true,
                body: {
                    user: { id: user.id },
                    instance: 2
                }
            })

            if (result.email === undefined || result.email === null) {
                result.userId = user.id
                result.email = user.email
                products.push(result)
            }
        });

        products.forEach(product => {
            if (product.body !== undefined && product.body.length > 0) {
                productsBody.push(product)
            }
        });

        if (productsBody.length !== 0) {
            productsBody.forEach(product => {

                product.body.forEach(body => {
                    if (body.photos !== undefined && body.photos.length > 0) {
                        body.image = 'https://s3-us-west-1.amazonaws.com/calzzapato/normal/' + body.photos[0].description
                    }
                })
            })
            if (productsBody.length > 20) {
                productsBody = productsBody.slice(0, 20)
            }
            response = productsBody
        }
    } catch (error) {
        console.log(error)
    }
    return response
}


///////////////////////////////////////////////////////////////////////////




const getSeenProducts = async (db, users) => {
    let response = []
    try {
        let products = []
        let productsBody = []

        await Utils.asyncForEach(users, async (user) => {
            console.log(user.id);
            let result = await Utils.request({
                method: 'POST',
                url: configs.HOST_IP_ECOMMERCE + ':' + configs.PORT_IP_ECOMMERCE + '/api/users/seen-mailing/products',
                json: true,
                body: {
                    user: { id: user.id },
                    instance: 2
                }
            })


            if (result.email === undefined || result.email === null) {
                result.userId = user.id
                result.email = user.email
                products.push(result)
            }
        });

        products.forEach(product => {
            if (product.body !== undefined && product.body.length > 0) {
                productsBody.push(product)
            }
        });

        if (productsBody.length !== 0) {
            productsBody.forEach(product => {

                product.body.forEach(body => {
                    if (body.photos !== undefined && body.photos.length > 0) {
                        body.image = 'https://s3-us-west-1.amazonaws.com/calzzapato/normal/' + body.photos[0].description
                    }
                })
            })
            if (productsBody.length > 20) {
                productsBody = productsBody.slice(0, 20)
            }
            response = productsBody
        }


    } catch (error) {
        console.log(error)
    }
    return response
}




///////////////////////////////////////////////////////////////////////////




const getLostCar = async (db, users) => {
    let response = []
    try {
        let carArray = []
        let products = []

        await Utils.asyncForEach(users, async (user) => {
            let obj = {}
            obj = await Utils.mongoFind('Cart', { user: user.id, status: true })
            if (obj !== undefined && obj.length > 0) {
                carArray.push(obj[0])
            }
        });


        if (carArray !== undefined && carArray.length > 0) {
            await Utils.asyncForEach(carArray, async (cart) => {
                await Utils.asyncForEach(cart.products, async (car) => {
                    let productCar = await Utils.mongoFind('Product', { code: car.code })
                    if (car !== undefined) {
                        productCar[0].user = cart.user
                        let user = users.filter(function (el) { return el.id === productCar[0].user });
                        productCar[0].email = user[0].email
                        products.push({ body: [productCar[0]], email: productCar[0].email })
                    }
                });
            })
        }

        if (products.length > 0) {

            if (products.length > 20) {
                products = products.slice(0, 20)
            }
            products.forEach(product => {
                product.body.forEach(body => {

                    if (body !== undefined ) {
                        body.image = 'https://s3-us-west-1.amazonaws.com/calzzapato/normal/' + body.photos[0].description
                        body.url = '/' + Utils.generateURL(body.name) + '-' + body.code
                    }
                })
            })
            response = products
        }
    } catch (error) {
        console.log(error)
    }
    return response
}

const getOffer = async (db, users) => {
    let response = []
    try {
        let productsArray = []
        let products = []
        await Utils.asyncForEach(users, async (user) => {
            productsArray = await Utils.mongoFind('Product', {});

            if (productsArray !== undefined || productsArray.length > 0) {
                productsArray.forEach(product => {
                    if (product.savingPrice > 0 && product.discountPrice > 0) {
                        products.push(product)
                    }

                    
                });
            }
        });

        if (products.length !== 0) {
            if (products.length > 20) {
                products = products.slice(0, 20)
            }

            products.forEach(body => {
                if (body.photos !== undefined && body.photos.length > 0) {
                    body.image = 'https://s3-us-west-1.amazonaws.com/calzzapato/normal/' + body.photos[0].description
                    body.url = Utils.generateURL(body.name)
                }
            })

            

            response = products
        }

    } catch (error) {
        console.log(error)
    }
    return response
}



module.exports = {
    getProductsRelation,
    getSeenProducts,
    getLostCar,
    getOffer,
}


