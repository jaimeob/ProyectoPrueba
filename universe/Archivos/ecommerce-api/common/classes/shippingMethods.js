'use strict'

const Utils = require('../Utils')
const NODE_ENV = process.env.NODE_ENV || 'development'
const configs = require('../configs.' + NODE_ENV + '.json')

const getShippingMethods = async (data) => {
    let response = { shippingMethods: [], cost: false }
    let shippingMethodsPrices = await getShippingCostFromBd({ shippingMethods: data.shippingMethods })
    let minimiumAmount = shippingMethodsPrices.minimiumAmount
    let shippingCost = shippingMethodsPrices.shippingCost

    data.shippingMethods.forEach(element => {
        element.selected = false
    })
    // Entrega Express.
    if (data.local === true && data.municipality !== undefined && data.municipality.toLowerCase() === 'culiacán') {
        data.shippingMethods[3].selected = true
        response.shippingMethods.push(data.shippingMethods[3])
    }

    // Envio con calzzapato

    if (Number(data.price) >= minimiumAmount) {
        if (response.shippingMethods.length === 0) {
            data.shippingMethods[0].selected = true
        }
        response.shippingMethods.push(data.shippingMethods[0])
    } else {
        if (response.shippingMethods.length === 0) {
            //data.shippingMethods[0].selected = true
            data.shippingMethods[1].selected = true
        }
        //response.shippingMethods.push(data.shippingMethods[0])
        response.shippingMethods.push(data.shippingMethods[1])
    }


    // data.shippingMethods[0].selected = true
    // data.shippingMethods[1].selected = true

    // response.shippingMethods.push(data.shippingMethods[0])
    // response.shippingMethods.push(data.shippingMethods[1])




    // Click and collect.
    let states = await Utils.request({
        url: configs.HOST + ':' + configs.PORT + '/api/zones/states/' + data.code + '/' + data.size,
        method: 'GET',
        json: true
    })

    if (states.body !== undefined && states.body !== null && states.body && states.body.length > 0) {
        response.shippingMethods.push(data.shippingMethods[2])
    }


    let selectedMethod = null
    if (data.selectedShippingMethods !== undefined && data.selectedShippingMethods.some((element) => (element.code === data.code))) {
        let foundIndex = data.selectedShippingMethods.findIndex(element => element.code == data.code)
        selectedMethod = data.selectedShippingMethods[foundIndex].id
    }


    // if ( selectedMethod !== null && !response.shippingMethods.some((element) => (element.id === selectedMethod)) ) {
    //     if (selectedMethod === 1) {
    //         console.log('here 1');
    //         let foundIndex = response.shippingMethods.findIndex(element => element.id == 2)
    //         response.shippingMethods[foundIndex] = JSON.parse(JSON.stringify(data.shippingMethods[0]))
    //     } else if(selectedMethod === 2) {
    //         console.log('here 2');
    //         let foundIndex = response.shippingMethods.findIndex(element => element.id == 1)
    //         response.shippingMethods[foundIndex] = JSON.parse(JSON.stringify(data.shippingMethods[1]))
    //     }
    //     //selectedMethod = response.shippingMethods[foundIndex].id
    // }



    if (selectedMethod !== null) {
        console.log('ENTRA', selectedMethod)
        response.shippingMethods.forEach(method => {
            if (method.id === selectedMethod) {
                method.selected = true
                if (selectedMethod === 2) {
                    response.cost = true
                }
            } else {
                method.selected = false
            }
        })
    }
    return response
}

const getShippingCost = async (data) => {
    let response = { products: null, changed: false, shippingCost: 0 }
    let totalPrice = 0
    let freeShipping = false
    let shippingMethodsPrices = await getShippingCostFromBd({ shippingMethods: data.shippingMethods })
    let minimiumAmount = shippingMethodsPrices.minimiumAmount

    console.log('PRODUCTO 1111111111', data.products[0].shippingMethods)

    response.shippingCost = shippingMethodsPrices.shippingCost

    data.products.forEach(product => {
        if (freeShipping === false && product.shippingMethods.some((element) => (element.selected === true && element.id === 1))) {
            freeShipping = true
        }
        if (freeShipping === false && product.shippingMethods.some((element) => (element.selected === true && element.id === 2))) {
            totalPrice += product.selection.quantity * product.price
        }
        if (freeShipping === false && totalPrice >= minimiumAmount) {
            freeShipping = true
        }
    })
    console.log('PRODUCTO 22222222', data.products[0].shippingMethods);

    if (freeShipping === true) {
        console.log('PRODUCTO 3333333333', data.products[0].shippingMethods);

        data.products.forEach(product => {
            if (product.shippingMethods.some((element) => (element.id === 2))) {
                let foundIndex = product.shippingMethods.findIndex(element => (element.id === 2))
                if (product.shippingMethods[foundIndex].selected === true) {
                    data.shippingMethods[0].selected = true
                    console.log('holaaaaa1');
                } else if(!product.shippingMethods.some((element) => (element.selected === true))) {
                    data.shippingMethods[0].selected = true
                    console.log('holaaaaa2');
                } else {
                    data.shippingMethods[0].selected = false
                    console.log('holaaaaa3');
                }
                product.shippingMethods[foundIndex] = JSON.parse(JSON.stringify(data.shippingMethods[0]))
                response.changed = true
                response.products = data.products
            }
        })
        console.log('PRODUCTO 4444444', data.products[0].shippingMethods);

        response.shippingCost = 0
    } else {
        data.products.forEach(product => {
            if (!product.shippingMethods.some((element) => (element.selected === true))) {
                

                let foundIndex = product.shippingMethods.findIndex(element => (element.id === 1 || element.id === 2))
                product.shippingMethods[foundIndex].selected = true
                response.changed = true
                response.products = data.products
                // let foundIndex = product.shippingMethods.findIndex(element => (element.id === 2))
                // if (product.shippingMethods[foundIndex].selected === true) {
                //     data.shippingMethods[0].selected = true
                //     console.log('holaaaaa1');
                // } else if(!product.shippingMethods.some((element) => (element.selected === true))) {
                //     data.shippingMethods[0].selected = true
                //     console.log('holaaaaa2');
                // } else {
                //     data.shippingMethods[0].selected = false
                //     console.log('holaaaaa3');
                // }
                // product.shippingMethods[foundIndex] = JSON.parse(JSON.stringify(data.shippingMethods[0]))
                // response.changed = true
                // response.products = data.products
            }
        })

    }
    return response
}

const getShippingCostFromBd = async (data) => {
    let minimiumAmount = 999
    let shippingCost = 99
    let response = { minimiumAmount: minimiumAmount, shippingCost: shippingCost }

    if (data.shippingMethods[0].id === 1) {
        response.minimiumAmount = Number(data.shippingMethods[0].minimiumAmount)
    }
    if (data.shippingMethods[1].id === 2) {
        response.shippingCost = Number(data.shippingMethods[1].cost)
    }

    return response
}



module.exports = ({ getShippingMethods, getShippingCost })
