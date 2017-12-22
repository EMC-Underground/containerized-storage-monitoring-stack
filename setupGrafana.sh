#!/bin/bash
http POST http://admin:admin@localhost:3000/api/datasources < grafana/grafana-influxdb.json
echo "-----------------------------------------------------"
http POST http://admin:admin@localhost:3000/api/dashboards/db < grafana/dashboard_emcecs.json
