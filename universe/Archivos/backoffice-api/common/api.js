const axios = require('axios');
const NodeCache = require('node-cache');
const NODE_ENV = process.env.NODE_ENV || 'development'
const configs = require('../common/configs.' + NODE_ENV + '.json')

const myCache = new NodeCache({ stdTTL: 100 });

const api = axios.create({
    baseURL: configs.baseURL
})

api.interceptors.request.use(async (rconfig) => {

    if (myCache.get('token') == undefined && rconfig.url != "/Token") {

        let Email = configs.WebServiceRestEmail
        let Key = configs.WebServiceRestKey
        try {
            let { data: rtoken } = await api.post('/Token', {}, { headers: { Email, Key } });

            myCache.set('token', rtoken, 60 * 60 * 23); // Renew each 23 hours 
            api.defaults.headers.common['Authorization'] = `Bearer ${rtoken}`;
            rconfig.headers['Authorization'] = `Bearer ${rtoken}`; // Add token to current request
        } catch (error) {
            throw error;
        }
    }

    return rconfig;

}, (error) => {
    return Promise.reject(error)
})


