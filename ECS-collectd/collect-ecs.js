process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0" // Avoids DEPTH_ZERO_SELF_SIGNED_CERT error for self-signed certificates

var request = require('request'),
	YAML = require('yamljs'),
	xml2js = require('xml2js'),
	util = require('util'),
	moment = require('moment'),
	fs = require('fs');

const ecsCredsFile = '/usr/share/collectd/ecs-creds.yml'
const ecsConfigFile = '/usr/share/collectd/ecs-config.yml'
var parser = new xml2js.Parser();
var ECSconfig = {};


if (fs.existsSync(ecsConfigFile)) { // if the ECS API access token exists
	var now = moment();
	var fileStats = fs.statSync(ecsConfigFile)
	var tokenRefreshed = moment(fileStats.mtime) // last modified time
	var elapsedTime = now.diff(tokenRefreshed, 'hours')
	console.log('elapsted time = ' + elapsedTime)
	if (elapsedTime < 2) { // if the token is less than 2 hours old 
		ECSconfig = YAML.load(ecsConfigFile) // build an object from the yaml file
		getECSStats(function(stats) { // start the collection loop
			if (stats[0].value == null) { // no data found, so initialize
				initialize()
			} else {
				console.log('looping through collection process...')
			}	
		})				
	} else { // otherwise refresh the token and other data-source config info
		initialize()	
	}
} else { // otherwise refresh the token and other data-source config info
	initialize()
}

function initialize () {
	getECSConfig(function(ECSconfigData) { 
		yamlString = YAML.stringify(ECSconfigData, 4);
		writeFile(ecsConfigFile, yamlString) // write it to file
		console.log('initialization complete...')
		getECSStats(function(stats) { // start the collection loop
			console.log('looping through collection process...')
		})	
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
				console.log('error getting ECS stats')
				console.log(error)		
			} else {
				var stats = JSON.parse(body)
				// console.log('stats = ')
				// console.log(stats)

				var metrics = [
					{stat: 'numNodes', source: "stats['numNodes']", dashboardLocation: 'emcecs/nodes/gauge-numNodes', value: null},
					{stat: 'numGoodNodes', source: "stats['numGoodNodes']", dashboardLocation: 'emcecs/nodes/gauge-numGoodNodes', value: null},
					{stat: 'numBadNodes', source: "stats['numBadNodes']", dashboardLocation: 'emcecs/nodes/gauge-numBadNodes', value: null},
					// ------------------------------------------------------------------------------------ //
					{stat: 'numDisks', source: "stats['numDisks']", dashboardLocation: 'emcecs/disks/gauge-numDisks', value: null},
					{stat: 'numGoodDisks', source: "stats['numGoodDisks']", dashboardLocation: 'emcecs/disks/gauge-numGoodDisks', value: null},
					{stat: 'numBadDisks', source: "stats['numBadDisks']", dashboardLocation: 'emcecs/disks/gauge-numBadDisks', value: null},					
					// ------------------------------------------------------------------------------------ //
					{stat: 'nodeMemoryUtilizationAvgCurrent', source: "stats['nodeMemoryUtilizationAvgCurrent'][0]['Percent']", dashboardLocation: 'emcecs/nodes/gauge-nodeMemoryUtilizationAvgCurrent', value: null},
					{stat: 'nodeCpuUtilizationAvgCurrent', source: "['nodeCpuUtilizationAvgCurrent'[0]['Percent']", dashboardLocation: 'emcecs/nodes/gauge-nodeCpuUtilizationAvgCurrent', value: null},
					// ------------------------------------------------------------------------------------ //
					{stat: 'diskSpaceTotalCurrent', source: "stats['diskSpaceTotalCurrent'][0]['Space']/1024/1024/1024", dashboardLocation: 'emcecs/space/gauge-diskSpaceTotalCurrent', value: null},
					{stat: 'diskSpaceFreeCurrent', source: "stats['diskSpaceFreeCurrent'][0]['Space']/1024/1024/1024", dashboardLocation: 'emcecs/space/gauge-diskSpaceFreeCurrent', value: null},
					{stat: 'diskSpaceAllocatedCurrent', source: "stats['diskSpaceAllocatedCurrent'][0]['Space']/1024/1024/1024", dashboardLocation: 'emcecs/space/gauge-diskSpaceAllocatedCurrent', value: null},
					// ------------------------------------------------------------------------------------ //
					{stat: 'transactionErrorsCurrent', source: "stats['transactionErrorsCurrent']['all'][0]['Rate']", dashboardLocation: 'emcecs/transactions/gauge-transactionErrorsCurrent', value: null},
					{stat: 'transactionReadLatencyCurrent', source: "stats['transactionReadLatencyCurrent'][0]['Latency']", dashboardLocation: 'emcecs/transactions/gauge-transactionReadLatencyCurrent', value: null},
					{stat: 'transactionWriteLatencyCurrent', source: "stats['transactionWriteLatencyCurrent'][0]['Latency']", dashboardLocation: 'emcecs/transactions/gauge-transactionWriteLatencyCurrent', value: null},
					// ------------------------------------------------------------------------------------ //
					{stat: 'nodeNicUtilizationAvgCurrent', source: "stats['nodeNicUtilizationAvgCurrent'][0]['Percent']", dashboardLocation: 'emcecs/nodes/gauge-nodeNicUtilizationAvgCurrent', value: null},
					{stat: 'nodeNicBandwidthAvgCurrent', source: "stats['nodeNicBandwidthAvgCurrent'][0]['Bandwidth']", dashboardLocation: 'emcecs/bandwidth/gauge-nodeNicBandwidthAvgCurrent', value: null},
					{stat: 'nodeNicReceivedBandwidthAvgCurrent', source: "stats['nodeNicReceivedBandwidthAvgCurrent'][0]['Bandwidth']", dashboardLocation: 'emcecs/bandwidth/gauge-nodeNicReceivedBandwidthAvgCurrent', value: null},
					{stat: 'nodeNicTransmittedBandwidthAvgCurrent', source: "stats['nodeNicTransmittedBandwidthAvgCurrent'][0]['Bandwidth']", dashboardLocation: 'emcecs/bandwidth/gauge-nodeNicTransmittedBandwidthAvgCurrent', value: null},
					// ------------------------------------------------------------------------------------ //
					{stat: 'recoveryRate', source: "stats['recoveryRate'][0]['Rate']", dashboardLocation: 'emcecs/bandwidth/gauge-recoveryRate', value: null},
					// ------------------------------------------------------------------------------------ //
					{stat: 'replicationEgressTrafficCurrent', source: "stats['replicationEgressTrafficCurrent'][0]['Bandwidth']", dashboardLocation: 'emcecs/traffic/gauge-replicationEgressTrafficCurrent', value: null},
					{stat: 'replicationIngressTrafficCurrent', source: "stats['replicationIngressTrafficCurrent'][0]['Bandwidth']", dashboardLocation: 'emcecs/traffic/gauge-replicationIngressTrafficCurrent', value: null},
					// ------------------------------------------------------------------------------------ //
					{stat: 'diskReadBandwidthTotalCurrent', source: "stats['diskReadBandwidthTotalCurrent'][0]['diskIO']", dashboardLocation: 'emcecs/bandwidth/gauge-diskReadBandwidthTotalCurrent', value: null},
					{stat: 'diskWriteBandwidthTotalCurrent', source: "stats['diskWriteBandwidthTotalCurrent'][0]['diskIO']", dashboardLocation: 'emcecs/bandwidth/gauge-diskWriteBandwidthTotalCurrent', value: null},
					// ------------------------------------------------------------------------------------ //
					{stat: 'diskReadBandwidthRecoveryCurrent', source: "stats['diskReadBandwidthRecoveryCurrent'][0]['diskIO']", dashboardLocation: 'emcecs/bandwidth/gauge-diskReadBandwidthRecoveryCurrent', value: null},
					{stat: 'diskWriteBandwidthRecoveryCurrent', source: "stats['diskWriteBandwidthRecoveryCurrent'][0]['diskIO']", dashboardLocation: 'emcecs/bandwidth/gauge-diskWriteBandwidthRecoveryCurrent', value: null},
					// ------------------------------------------------------------------------------------ //
					{stat: 'diskReadBandwidthGeoCurrent', source: "stats['diskReadBandwidthGeoCurrent'][0]['diskIO']", dashboardLocation: 'emcecs/bandwidth/gauge-diskReadBandwidthGeoCurrent', value: null},
					{stat: 'diskWriteBandwidthGeoCurrent', source: "stats['diskWriteBandwidthGeoCurrent'][0]['diskIO']", dashboardLocation: 'emcecs/bandwidth/gauge-diskWriteBandwidthGeoCurrent', value: null}
				]

				var i = 0,
					interval = 10

				metrics.forEach(function(metric) {
					try {
						var rawValue = eval(metric.source);
						metric.value = parseFloat(rawValue).toFixed(2);
						console.log(metric.stat + ' = ' + metric.value)
						console.log(`PUTVAL ${metric.dashboardLocation} interval=${interval} N:${metric.value}`);
						metrics[i] = metric;
					}
					catch (e) {
						console.log('no data exists for: ' + metrics[i].stat);
						// console.log(e)
						metrics.splice(i, 1);
					}
					i++					
				})
				callback(metrics)		
			}
		});			
	})
}

function getECSConfig (callback) {
	var creds = YAML.load(ecsCredsFile)
	// console.log('ECS config data = ' + JSON.stringify(creds))
	var uri = 'https://' + creds.ip + ':4443/login'
	var credsToEncode = creds.login + ':' + creds.pwd
	var encodedCreds = new Buffer(credsToEncode).toString('base64') // note for node versions newer than 4.5, use Buffer.from - https://stackoverflow.com/questions/6182315/how-to-do-base64-encoding-in-node-js

	var options = {
		uri: uri,
		headers: {Authorization: 'Basic ' + encodedCreds}
	}

	request.get(options, function(error, response, body) {
		if (error) {
			console.log('error getting token')
			console.log(error)		
		} else {
			var configData = {
					ip: creds.ip,
					token: response.headers['x-sds-auth-token']
				}
		
			ECSConfigCalls = [
				// get storagepool ID
				'https://' + creds.ip + ':4443/vdc/data-services/varrays', 
				// get replication group ID
				'https://' + creds.ip + ':4443//vdc/data-service/vpools'
			]

			ECSConfigCalls.forEach(function(configCall, idx, array) {
				configOptions = {
					uri: configCall,
					headers: {'X-SDS-AUTH-TOKEN': configData.token}
				}

				request.get(configOptions, function(error, response, body) {
					if (error) {
						console.log('error getting ECS config info')
						console.log(error)		
					} else {
						parser.parseString(body, function (err, result) {

							// log output to full depth of resulting object
							console.log(util.inspect(result, false, null))

							if (result.varrays != null) {
								configData.storagepool = result.varrays.varray[0].id[0]
								console.log('storagepool = ' + configData.storagepool)
							}
							if (result.data_service_vpools != null) {
								configData.replgroup = result.data_service_vpools.data_service_vpool[0].id[0]
								console.log('replgroup = ' + configData.replgroup)
							}
							if (configData.storagepool != null && configData.replgroup != null) {
								callback(configData)
							} else {
								if (idx === array.length - 1) { // this was the last item so all the data should be there
									console.log('problem establishing storagepool or replication group IDs')
								}
								
							}
						});
					}			
				});			
			})
		}	
	});	
}

function writeFile (filename, contents) {
	fs.writeFile(filename, contents, function (err) {
		if (err) {
			console.log('error writing file: ' + err)
		} 
	})
}




