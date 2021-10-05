'use strict'

const fs = require("fs")
const convert = require('xml-js')
const Utils = require("../Utils.js")

module.exports = function(Instance) {
	Instance.observe('loaded', function loaded(ctx, next) {
    fs.readFile(__dirname + '/../..' + ctx.data.configs.es, 'utf8', function (err, data) {
      if (err) {
  		  console.log(err)
        next()
      }
	  	else {
        ctx.data.configs.es = data
        ctx.data.configs.en = data
	  	  next()
	  	}
  	})
	})

	Instance.syncSepomex = async function (cb) {
    let response = {sync: false}

    let dir = __dirname + '/../../cdn/sepomex/'
    let files = await Utils.readDir(dir)

    let states = []
    let locations = []
    let locationsTypes = []
    let cities = []
    let municipalities = []

    await Utils.asyncForEach(files, async function(file) {
      let data = await Utils.readFile(dir + file)
      data = convert.xml2json(data, {compact: true, spaces: 4})
      data = JSON.parse(data)
      data = data['NewDataSet']['table']

      let rows = []
      let row = {
        zip: '',
        locationId: '',
        location: '',
        locationType: '',
        locationTypeId: '',
        locationZone: '',
        municipality: '',
        municipalityId: '',
        state: '',
        stateId: '',
        city: '',
        cityId: ''
      }

      data.forEach(function(item) {
        row = {
          zip: (item['d_codigo'] !== undefined) ? item['d_codigo']['_text'] : '',
          locationId: (item['id_asenta_cpcons'] !== undefined) ? item['id_asenta_cpcons']['_text'] : '',
          location: (item['d_asenta'] !== undefined) ? item['d_asenta']['_text'] : '',
          locationType: (item['d_tipo_asenta'] !== undefined) ? item['d_tipo_asenta']['_text'] : '',
          locationTypeId: (item['c_tipo_asenta'] !== undefined) ? item['c_tipo_asenta']['_text'] : '',
          locationZone: (item['d_zona'] !== undefined) ? item['d_zona']['_text'] : '',
          municipality: (item['D_mnpio'] !== undefined) ? item['D_mnpio']['_text'] : '',
          municipalityId: (item['c_mnpio'] !== undefined) ? item['c_mnpio']['_text'] : '',
          state: (item['d_estado'] !== undefined) ? item['d_estado']['_text'] : '',
          stateId: (item['c_estado'] !== undefined) ? item['c_estado']['_text'] : '',
          city: (item['d_ciudad'] !== undefined) ? item['d_ciudad']['_text'] : '',
          cityId: (item['c_cve_ciudad'] !== undefined) ? item['c_cve_ciudad']['_text'] : ''
        }

        states.push({id: row.stateId, name: row.state})
        municipalities.push({municipalityStateCode: row.municipalityId + row.stateId, id: row.municipalityId, stateId: row.stateId, name: row.municipality})
        locations.push({locationMunicipalityStateCode: row.locationId + row.municipalityId + row.stateId, code: row.locationId, zip: row.zip, locationTypeId: row.locationTypeId, stateId: row.stateId, municipalityId: row.municipalityId, municipalityStateCode: row.municipalityId + row.stateId, cityId: row.cityId,  name: row.location, zone: row.locationZone})
        locationsTypes.push({id: row.locationTypeId, name: row.locationType})
        if (!Utils.isEmpty(row.cityId))
          cities.push({index: row.cityId + row.municipalityId + row.stateId, id: row.cityId, stateId: row.stateId, municipalityId: row.municipalityId, name: row.city})
        
        rows.push(row)

        row = {
          zip: '',
          locationId: '',
          location: '',
          locationType: '',
          locationTypeId: '',
          locationZone: '',
          municipality: '',
          municipalityId: '',
          state: '',
          stateId: '',
          city: '',
          cityId: ''
        }
      })
    })

    states = Utils.uniqBy(states, 'id')
    states = Utils.orderBy(states, 'id', 'asc')

    cities = Utils.uniqBy(cities, 'index')
    cities = Utils.orderBy(cities, 'id', 'asc')

    locations = Utils.uniqBy(locations, 'locationMunicipalityStateCode')
    locations = Utils.orderBy(locations, 'zip', 'asc')

    locationsTypes = Utils.uniqBy(locationsTypes, 'id')
    locationsTypes = Utils.orderBy(locationsTypes, 'id', 'asc')
    
    municipalities = Utils.uniqBy(municipalities, 'municipalityStateCode')
    municipalities = Utils.orderBy(municipalities, 'id', 'asc')

    let db = await Utils.connectToDB()
    try {
      await db.query('SET FOREIGN_KEY_CHECKS = 0;')
      await db.query('TRUNCATE TABLE State;')
      await db.query('TRUNCATE TABLE Municipality;')
      await db.query('TRUNCATE TABLE LocationType;')
      await db.query('TRUNCATE TABLE City;')
      await db.query('TRUNCATE TABLE Location;')

      await Utils.asyncForEach(states, async function(state) {
        await db.query("INSERT INTO State (code, name) VALUES (?, ?);", [state.id, state.name]);
      })

      await Utils.asyncForEach(municipalities, async function(municipality) {
        await db.query("INSERT INTO Municipality (code, stateCode, municipalityStateCode, name) VALUES (?, ?, ?, ?);", [municipality.id, municipality.stateId, municipality.municipalityStateCode, municipality.name]);
      })

      await Utils.asyncForEach(locationsTypes, async function(locationType) {
        await db.query("INSERT INTO LocationType (code, name) VALUES (?, ?);", [locationType.id, locationType.name]);
      })

      await Utils.asyncForEach(cities, async function(city) {
        await db.query("INSERT INTO City (code, stateCode, municipalityCode, name) VALUES (?, ?, ?, ?);", [city.id, city.stateId, city.municipalityId, city.name]);
      })

      await Utils.asyncForEach(locations, async function(location) {
        await db.query("INSERT INTO Location (code, zip, locationTypeCode, stateCode, municipalityCode, municipalityStateCode, locationMunicipalityStateCode, cityCode, name, zone) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);", [location.code, location.zip, location.locationTypeId, location.stateId, location.municipalityId, location.municipalityStateCode, location.locationMunicipalityStateCode, location.cityId, location.name, location.zone]);
      })

      await db.query('SET FOREIGN_KEY_CHECKS = 1;')
      response.sync = true

      await db.commit()
    } catch (err) {
      console.log(err)
      response.message = err
      await db.rollback()
    }

    await db.close()
    return response
  }

  Instance.remoteMethod('syncSepomex', {
    description: 'Sync sepomex',
    http: {
      path: '/sync/sepomex',
      verb: 'POST'
    },
    accepts: [],
    returns: {
      arg: 'response',
      type: 'object',
      root: true
    }
  })
}
