process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0" // Avoids DEPTH_ZERO_SELF_SIGNED_CERT error for self-signed certificates

var request = require('request');

var ip = '10.4.44.4'
var token = 'BAAcN0ZVSWxmRDJwTlNPWUpOTGh0c1lYR1kzWUdvPQMAjAQASHVybjpzdG9yYWdlb3M6VmlydHVhbERhdGFDZW50ZXJEYXRhOmM2ZjZmY2JjLWUwNDUtNDJlZC1hZDlmLWY2NTBjNTViMzM3NgIADTE1MTM5MTIwMjMwNTMDAC51cm46VG9rZW46ZGRkMTJkZDctYTI3NC00ZjI1LTkwYzktNTlmNWNhZjZjOTM0AgAC0A8='
var storagepool = 'urn:storageos:VirtualArray:36453c8c-6927-4729-916d-dbdcf93885b4'
var replgroup = 'Replication_Group:urn:storageos:ReplicationGroupInfo:8d618c50-9bb5-4d2c-98f3-54537dd81666:global'

var options = {
	//uri: 'https://' + ':4443/dashboard/storagepools/' + storagepool
	uri: 'https://' + ip + ':4443/dashboard/zones/localzone/',
	headers: {'X-SDS-AUTH-TOKEN': token}
}

request.get(options, callback);

function callback(error, response, body) {
	console.log('error = ')
	console.log(error)
	console.log('body = ')
	console.log(body)
	console.log('parsed body = ')
	console.log(JSON.parse(body))
}
