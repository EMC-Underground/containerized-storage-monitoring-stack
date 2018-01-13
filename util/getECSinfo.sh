#!/bin/bash
curl -L --location-trusted -k https://10.4.44.4:4443/vdc/data-services/varrays -b cookiefile -v | xmllint --format -
echo "--------------------------------------------------------"
curl -L --location-trusted -k https://10.4.44.4:4443/vdc/data-service/vpools -b cookiefile -v | xmllint --format -
