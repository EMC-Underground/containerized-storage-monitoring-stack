#!/bin/bash
curl -L --location-trusted -k https://10.4.44.4:4443/login?using-cookies=true -u "root:Password#1" -c cookiefile -v
