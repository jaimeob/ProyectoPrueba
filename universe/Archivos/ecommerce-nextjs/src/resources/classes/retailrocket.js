import { number } from 'card-validator'
import Utils from '../../resources/Utils'

// CODE 2
const productPageTrackerFunction = async (product, sizes, paths) => {
    if (Utils.constants.CONFIG_ENV.UUID === '054b980b-6f4e-4d0c-8d53-1915be4abea2') {


        let response = []
        let productsArray = []
        let skusArray = []
        let obj = {}
        let skuValue = []

        sizes.forEach((sizeProduct) => {
            if (sizeProduct.quantity > 0) {

                const element = sizeProduct.size
                let size = element | 0
                if (size < element) {
                    size = String(size) + String(5)
                }

                sizeProduct.size = product.codeRetailRocket + size

                obj[Number(sizeProduct.size)] = {
                    isAvailable: true,
                    name: product.name,
                    color: "",
                    size: sizeProduct.size,
                    url: "https://www.calzzapato.com" + product.url,
                    pictureUrl: Utils.constants.HOST_CDN_AWS + '/normal/' + product.photos[0].description,
                    price: product.price,
                    oldPrice: product.subtotal != undefined ? product.subtotal : 0,
                    description: product.name,
                }


                skuValue = sizeProduct.size
                skusArray.push(skuValue)
                productsArray.push(obj)
            }

        })

        let objProducts = {}
        for (var key in productsArray) {
            objProducts = Object.assign(objProducts, productsArray[key]);
        }

        try {
            (window["rrApiOnReady"] = window["rrApiOnReady"] || []).push(function () {

                // Send products data
                if (product.codeRetailRocket != undefined)
                    retailrocket.productsGroup.post({
                        "groupId": Number(product.codeRetailRocket),
                        "name": product.name,
                        "price": (product.discountPrice !== undefined && product.discountPrice > 0) ? Number(product.discountPrice) : Number(product.price),
                        "pictureUrl": Utils.constants.HOST_CDN_AWS + '/normal/' + product.photos[0].description,
                        "url": "https://www.calzzapato.com" + product.url,
                        "isAvailable": true,
                        "categoryPaths": [paths],
                        "description": product.name,
                        "vendor": product.brand.name,
                        "products": objProducts,
                        "model": product.name,
                        "typePrefix": product.name,
                        "oldPrice": product.price,
                    });
                rrApi.groupView(skusArray);
            });

        } catch (error) {
            console.log(error)
        }
        return response
    }
}

// CODE 3
const categoryPageTracker = async (paths) => {
    if (Utils.constants.CONFIG_ENV.UUID === '054b980b-6f4e-4d0c-8d53-1915be4abea2') {
        if (paths != undefined && paths.length > 0) {
            try {
                (window["rrApiOnReady"] = window["rrApiOnReady"] || []).push(function () {
                    rrApi.categoryView(paths[paths.length - 1].url);
                });

            } catch (error) {
                console.log(error)
            }
        }
    }

}


// CODE 4
const addToCart = async (productId) => {
    
    if (Utils.constants.CONFIG_ENV.UUID === '054b980b-6f4e-4d0c-8d53-1915be4abea2') {
        if (productId != undefined)
            try { rrApi.addToBasket(productId) } catch (e) {
                console.log(e)
            }
    }
}


// CODE 5
const transactionTracker = async (order, sizeArray) => {
    if (Utils.constants.CONFIG_ENV.UUID === '054b980b-6f4e-4d0c-8d53-1915be4abea2') {
        let productsArray = []

        if (order.items !== undefined && order.items.length > 0 && sizeArray !== undefined && sizeArray.length > 0) {

            order.items.forEach(product => {
                sizeArray.forEach(sizeObjt => {
                    if (sizeObjt.code === product.id && product.codeRetailRocket !== null) {

                        let productId = product.codeRetailRocket + String(sizeObjt.size)

                        productsArray.push({
                            id: Number(productId),
                            qnt: product.quantity,
                            price: product.price
                        })
                    }

                });
            })
        }

        try {

            (window["rrApiOnReady"] = window["rrApiOnReady"] || []).push(function () {
                rrApi.setEmail(Utils.getCurrentUser());
                rrApi.order({
                    "transaction": Number(order.folio),
                    "items": productsArray
                });

            })
        } catch (e) { console.log(e) }

    }
}


// CODE 6
const emailTrackingCode = async (email) => {
    if (Utils.constants.CONFIG_ENV.UUID === '054b980b-6f4e-4d0c-8d53-1915be4abea2') {
        if (email !== undefined && email !== "") {
            try {
                (window["rrApiOnReady"] = window["rrApiOnReady"] || []).push(function () { rrApi.setEmail(email); });
            } catch (e) { console.log(e) }
        }
    }
}

module.exports = {
    productPageTrackerFunction,
    categoryPageTracker,
    addToCart,
    transactionTracker,
    emailTrackingCode,
}


