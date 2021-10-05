'use strict'

const mongodb = require('mongodb')
let connections = []

const createConnection = async (name, data) => {
	return new Promise(async (resolve, reject) => {
		const MONGODB_URL_CONNECTION = "mongodb://" + data.user + ":" + data.password + "@" + data.host + ":" + data.port + "/" + data.database + "?retryWrites=true&w=majority&maxPoolSize=9999999999"
		mongodb.connect(MONGODB_URL_CONNECTION, {
			useNewUrlParser: true,
			useUnifiedTopology: true
		}, (err, client) => {
			if (err) {
				console.log('Error to create mongodb connection')
				console.log(err)
				return reject(err)
			} else {
				console.log('Success mongodb connection')
				let connection = client.db(data.db)
				connections.push({
					name: name,
					connection: connection
				})
				return resolve(connection)
			}
		})
	})
}

const getConnection = (name) => {
	let connection = null
	connections.forEach(item => {
		if (item.name === name) {
			connection = item.connection
		}
	})
	return connection
}

const mongoFind = async (connection, collection, filter) => {
  return new Promise(async (resolve, reject) => {
    connection.collection(collection).find(filter).toArray((err, response) => {
      if (err) {
        return reject([])
      } else {
        return resolve(response)
      }
    })
  })
}

const findMongoDB = async (connection, collection, where) => {
  return new Promise((resolve, reject) => {
    connection.collection(collection).find(where).toArray((error, response) => {
      if (error) return resolve([])
      return resolve(response)
    })
  })
}

const findAndUpdateMongoDB = async (connection, collection, where, query) => {
  return new Promise((resolve, reject) => {
    connection.collection(collection).update(where, query, (err, data) => {
      if (err) {
        return reject({ success: false })
      } else {
        return resolve({ success: true })
      }
    })
  })
}

const updateMongoDb = async (Model, data, id) => {
  Model.updateAll({ id: id }, data, function (err, e2) {
    return false
  })
}

const createMongoDB = (collection, data) => {
  return new Promise((resolve, reject) => {
    collection.create(data, function (err, response) {
      if (err) {
        return reject({ success: false, error: err })
      }
      return resolve({ success: true, data: response })
    })
  })
}

const findAndDeleteMongoDB = (collection, query) => {
  return new Promise((resolve, reject) => {
    collection.findOne(query, (err, item) => {
      if (item !== null) {
        item.delete(query, function (err, response) {
          if (err) {
            return reject({ success: false, error: err })
          }
          return resolve({ success: true, data: response })
        })
      } else {
        return resolve({ success: true })
      }
    })
  })
}

const createMongoDBIndexes = (connection, collection, indexes) => {
  return new Promise((resolve, reject) => {
    connection.collection(collection).createIndexes(indexes, (err) => {
      if (err) {
        return reject({ success: false })
      } else {
        return resolve({ success: true })
      }
    })
  })
}

const dropMongoDBIndexes = (connection, collection, indexes) => {
  return new Promise((resolve, reject) => {
    connection.collection(collection).dropIndexes(indexes, (err) => {
      return resolve({ success: true })
    })
  })
}

const dropCollectionMongoDB = (connection, collection) => {
  return new Promise((resolve, reject) => {
    connection.collection(collection).drop(() => {
      return resolve({ success: true })
    })
  })
}

const createUniqueMongoDB = (collection, where, data) => {
  return new Promise((resolve, reject) => {
    collection.findOne({ where: where }, (err, item) => {
      if (err) {
        return reject({ success: false, error: err })
      } else {
        if (item !== null) {
          return resolve({ success: false, isUnique: true })
        } else {
          collection.create(data, function (err, response) {
            if (err) {
              return reject({ success: false, error: err })
            }
            return resolve({ success: true, data: response })
          })
        }
      }
    })
  })
}

const mongoFindDistinct = async (connection, collection, value, where) => {
  return new Promise((resolve, reject) => {    
    connection.collection(collection).distinct(value, where, (error, res) => {
      if (error) {
        console.log("MONGO FIND ERROR: ", error)
        return resolve([])
      } else {
        return resolve(res)
      }
    })
  })
}



module.exports = ({
	connections,
	createConnection,
	getConnection,
	mongoFind,
	findMongoDB,
	updateMongoDb,
	createMongoDB,
	dropCollectionMongoDB,
	createMongoDBIndexes,
	dropMongoDBIndexes,
	findAndUpdateMongoDB,
  findAndDeleteMongoDB,
  createUniqueMongoDB,
  mongoFindDistinct
})
