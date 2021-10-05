
const NODE_ENV = process.env.NODE_ENV || 'development'

module.exports = {
    configs: {
        datasources: require(`./configs/datasources.${NODE_ENV}.json`),
        apicore: require(`./configs/apicore.json`),
        backoffice: require(`./configs/backoffice.json`)
    },

    Utils: require(`./utils`)
}