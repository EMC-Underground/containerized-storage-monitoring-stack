# About

## The approach and goal
This is a work in progress. The purpose of this project is to build an infrastructure automation use case around the collection and presentation of storage metrics. The approach being taken is to use:

- collectd whenever possible (using exec) and other custom scripts as necessary to gather metrics
- influxdb to store the metrics as time series data
- grafana to visualize the metrics

The deployment of these supporting apps and code will be containerized and completely software defined.


# How To

## Usage
clone this repository and run:

```
$ docker-compose up (add -d flag to not show console output of the collectd process)
```


## Info
docker-compose will pull existing images for influxdb and grafana from docker hub: 

- https://hub.docker.com/_/influxdb/

- https://hub.docker.com/r/grafana/grafana/

docker-compose will then build the collectd container via Dockerfile.

- The collectd.conf config file is generic except for 1) the Plugin network part sets up collectd to send data to 127.0.0.1 and port 25826 and 2) the Plugin exec part that calls collect-ecs.js.

- The influxdb.conf config file is also generic, the only change is to enable collectd ('enabled=true')

- The types.db file defines the collectd data source and influxdb needs it.

After running docker-compose, you can access:

- The influxdb web admin page at http://localhost:8083
- Grafana at http://localhost:3000 (login with default admin/admin, and the dashboard will be all set up)

## Utilities
The util directory contains some shell scripts that may be useful in dev:
- dockerNuke.sh: blows away all containers and images - use with care
- putFileToECS.sh: uses s3curl to put a file into a test bucket (generate workload for ECS)
- setECStoken.sh: curl command to set the ECS token for later use, stored as cookiefile
- getECSinfo.sh: curl command to get ECS config info, must first have cookiefile from above
- setupGrafana.sh: Grafana API calls via HTTPie commands to set the Grafana data source and dashboard framework, credit Jonas Rosland 

# Resources

## Credits and References
https://blog.laputa.io/try-influxdb-and-grafana-by-docker-6b4d50c6a446: setup of collectd, influxdb and grafana
https://github.com/jonasrosland/collectd-ecs: prior work getting metrics out of ECS using python
https://www.emc.com/techpubs/ecs/ecs_api_object_control_service-1.htm: Using the ECS management REST API
https://oldhenhut.com/2016/09/01/examples-of-ecs-api-usage: ECS API usage via s3curl

## Status and Research on storage data feeds
ECS: code in this repo currently collects, stores and displays 24 metrics 

ScaleIO: work has already been done for collectd integration at https://github.com/swisscom/collectd-scaleio

Isilon: via Insights connector - https://github.com/Isilon/isilon_data_insights_connector

VPLEX: maybe also a lead on how to proceed via https://community.emc.com/thread/239953?start=0&tstart=0

VMAX: looking to leverage work by Craig Smith & Vijay Kumar - https://github.com/VijayEMC/VMAX-Graphite

VNX/Unity: Integrate work done by Craig Smith at https://github.com/EMC-Underground/vnx-info-collector

XtremIO: reference https://kodywilson.com/2016/11/07/infrastructure-metrics-with-grafana-and-influxdb/


