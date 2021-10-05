'use strict'

const fs = require('fs')
const path = require('path')
const AWS = require('aws-sdk')
const unzipper = require('unzipper')
const mongodb = require('./mongodb.js')
const NODE_ENV = process.env.NODE_ENV || 'development'
const configs = require('../configs.' + NODE_ENV + '.json')

const listBuckets = () => {
  return new Promise((resolve, reject) => {
    let s3 = new AWS.S3({
      params: {
        Bucket: configs.aws.bucket
      },
      accessKeyId: configs.aws.accessKeyId,
      secretAccessKey: configs.aws.secretAccessKey
    })
    s3.listBuckets(function(err, data) {
      if (err) {
        console.log(err)
        reject(err)
      } else {
        resolve(data)
      }
    })
  })
}

const uploadFile = async (data) => {
  return new Promise((resolve, reject) => {
    let s3 = new AWS.S3({
      params: {
        Bucket: configs.aws.bucket
      },
      accessKeyId: configs.aws.accessKeyId,
      secretAccessKey: configs.aws.secretAccessKey
    })

    let base64 = Buffer.from(data.data.replace(/^data:([A-Za-z-+/]+);base64,/, ""), 'base64')

    s3.upload({
      Key: data.name,
      Body: base64,
      ContentEncoding: 'base64',
      ContentType: data.contentType,
      ACL: 'public-read'
    }, function(err, response) {
      if (err) {
        console.log(err)
        resolve({ success: false, error: err })
      } else {
        console.log(response)
        resolve({ success: true, data: response })
      }
    })
  })
}

const upload = async (upload, model, where, data) => {
  return new Promise(async (resolve, reject) => {
    let mdb = mongodb.getConnection('db')
    let document = await mongodb.createUniqueMongoDB(model, where, data)
    if (document.success) {
      let aws = await uploadFile(upload)
      if (aws.success) {
        await mongodb.findAndUpdateMongoDB(mdb, 'CDN', where, { '$set': { url: aws.data.Location } })
        document.data.url = aws.data.Location
        resolve({ success: true, data: document.data })
      } else {
        reject({ success: false, error: aws.error })  
      }
    } else {
      if (document.isUnique) {
        resolve({ success: false, isUnique: true })
      } else {
        reject({ success: false, error: document.error })
      }
      
    }
  })
}

const createFileIntoCDN = (fileName, dir, data) => {
  let base64 = data.replace(/^data:([A-Za-z-+/]+);base64,/, "")
  return new Promise((resolve, reject) => {
    let directory = path.resolve(__dirname + '/../../cdn' + dir + '/')
    fs.mkdir(directory, { recursive: true }, function (err) {
      if (err && err.code !== 'EEXIST') {
        console.log(err)
        return reject({ success: false })
      }
      else {
        fs.writeFile(directory + '/' + fileName, base64, 'base64', function (err) {
          if (err) {
            console.log(err)
            return reject({ success: false })
          }
          else {
            return resolve({ success: true, url: '/cdn' + dir + '/' + fileName })
          }
        })
      }
    })
  })
}

const unzipperFile = async (pathWithFileName, outputPathWithFileName) => {
  const directory = await unzipper.Open.file(__dirname + '/../..' + pathWithFileName)
  return new Promise((resolve, reject) => {
    return directory.files[0].stream().pipe(fs.createWriteStream(__dirname + '/../..' + outputPathWithFileName)).on('error', () => {
      return reject({ success: false })
    }).on('finish', () => {
      return resolve({ success: true })
    })
  })
}

module.exports = ({
  listBuckets,
  uploadFile,
  upload,
  createFileIntoCDN,
  unzipperFile
})
