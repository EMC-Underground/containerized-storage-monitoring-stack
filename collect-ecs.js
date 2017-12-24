process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0" // Avoids DEPTH_ZERO_SELF_SIGNED_CERT error for self-signed certificates

var request = require('request'),
	YAML = require('yamljs'),
	xml2js = require('xml2js'),
	util = require('util');

var parser = new xml2js.Parser();
var ECSconfig = {};

if (ECSconfig.token == null) {
	getECSConfig(function(ECSconfigData) {
		ECSconfig = ECSconfigData;
		getECSStats(function(stats) {
			try {
				console.log('diskSpaceTotalCurrent = ' + stats.diskSpaceTotalCurrent)
				console.log('numNodes = ' + stats.numNodes)
				console.log('numGoodNodes = ' + stats.numGoodNodes)
				console.log('numBadNodes = ' + stats.numBadNodes)
			}
			catch(e) {
				console.log('missing stat:')
				console.log(e)
			}	
		})	
	})
} else {
	console.log('ECS config already loaded')
	getECSStats(function(stats) {
		try {
			console.log('diskSpaceTotalCurrent = ' + stats.diskSpaceTotalCurrent)
		}
		catch(e) {
			console.log('missing stat:')
			console.log(e)
		}	
	})	
}

function getECSStats (callback) {
	var ECSstats = {}

	ECSDataCalls  = [
		'https://' + ECSconfig.ip + ':4443/dashboard/zones/localzone/', 
		// 'https://' + ECSconfig.ip + ':4443/dashboard/storagepools/' + ECSconfig.storagepool, // stats to potentially add later
		// 'https://' + ECSconfig.ip + ':4443/dashboard/replicationgroups/' + ECSconfig.replgroup, // currently no replication in place
	]

	ECSDataCalls.forEach(function(dataCall) {
		dataOptions = {
			uri: dataCall,
			headers: {'X-SDS-AUTH-TOKEN': ECSconfig.token}
		}

		request.get(dataOptions, function(error, response, body) {
			if (error) {
				console.log(error)		
			} else {
				var stats = JSON.parse(body)
				// console.log('stats = ')
				// console.log(stats)
				stats['numNodes'] != null ? ECSstats.numNodes = stats['numNodes'] : void 0
				stats['numGoodNodes'] != null ? ECSstats.numGoodNodes = stats['numGoodNodes'] : void 0
				stats['numBadNodes'] != null ? ECSstats.numBadNodes = stats['numBadNodes'] : void 0
				stats['diskSpaceTotalCurrent'][0]['Space'] != null ? ECSstats.diskSpaceTotalCurrent = stats['diskSpaceTotalCurrent'][0]['Space'] : void 0
				callback(ECSstats)		
			}
		});			
	})
}

function getECSConfig (callback) {
	var configData = YAML.load('emcecs-config.yml')
	var uri = 'https://' + configData.ip + ':4443/login'
	var creds = configData.login + ':' + configData.pwd
	var encodedCreds = new Buffer(creds).toString('base64') // note for node versions newer than 4.5, use Buffer.from - https://stackoverflow.com/questions/6182315/how-to-do-base64-encoding-in-node-js

	var options = {
		uri: 'https://' + configData.ip + ':4443/login',
		headers: {Authorization: 'Basic ' + encodedCreds}
	}

	request.get(options, function(error, response, body) {
		if (error) {
			console.log(error)		
		} else {
			configData.token = response.headers['x-sds-auth-token']
		
			ECSConfigCalls = [
				// get storagepool ID
				'https://' + configData.ip + ':4443/vdc/data-services/varrays', 
				// get replication group ID
				'https://' + configData.ip + ':4443//vdc/data-service/vpools'
			]

			ECSConfigCalls.forEach(function(configCall) {
				configOptions = {
					uri: configCall,
					headers: {'X-SDS-AUTH-TOKEN': configData.token}
				}

				request.get(configOptions, function(error, response, body) {
					if (error) {
						console.log(error)		
					} else {
						parser.parseString(body, function (err, result) {
							// log output to full depth of resulting object
							// console.log(util.inspect(result, false, null))
							result.varrays != null ? configData.storagepool = result.varrays.varray[0].id[0] : void 0
							result.data_service_vpools != null ? configData.replgroup = result.data_service_vpools.data_service_vpool[0].id[0] : void 0
							if (configData.storagepool != null && configData.replgroup != null) {
								// console.log('storagepool = ' + configData.storagepool)
								// console.log('replgroup = ' + configData.replgroup)
								callback(configData)
							}
						});
					}			
				});			
			})
		}	
	});	
}






