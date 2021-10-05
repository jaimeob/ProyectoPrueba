function serialize(obj) {
    return Object.keys(obj).map(k => ({ key: k, value: obj[k], name: obj[obj[k]] })).filter(k => Number.isInteger(k.value))
}

function toCurrency(number) {
    return number.toLocaleString('es-MX', { style: 'currency', currency: 'MXN', maximumSignificantDigits: 3 })
}


function unidadToInstance(unidad) {
    let instance = ''

    switch (unidad) {
        case '2': instance = 'e2a08434-976d-44cc-b1c0-16c5235b0b62' // urbana
            break;
        case '3': instance = '' // calzaconfort
            break;
        case '8': instance = '054b980b-6f4e-4d0c-8d53-1915be4abea2' // calzzapato
            break;
        case '9': instance = '2b0c178e-516b-4673-b5be-46a298a159d1' // kelder
            break;
        case '10': instance = 'aecc4fd0-6171-4a55-a5eb-803a051574a5' // calzzakids
            break;
        case '11': instance = '2c8041f1-d7f1-462c-b39d-3ca68f252579' // calzzasport
            break;
        case '12': instance = '' // flexi
            break;
        case '13': instance = '' // calzzeus
            break;
        case '15': instance = '' // adidas
            break;
        case '16': instance = '' // vans
            break;
    }
    return instance;
}

module.exports = {
    serialize,
    toCurrency,
    unidadToInstance
}