# About

## The approach and goal
This is a work in progress. The purpose of this project is to build an infrastructure automation use case around the collection and presentation of storage metrics. The approach being taken is to use:

- collectd and other custom scripts as necessary to gather metrics
- influxdb to store the metrics as time series data
- grafana to visualize the metrics

The deployment of these supporting apps and code will be containerized and (hopefully) completely software defined.

## Credits and References
https://blog.laputa.io/try-influxdb-and-grafana-by-docker-6b4d50c6a446: setup of collectd, influxdb and grafana

## Research on storage data feeds
ECS: work has already been done for collectd integration at https://github.com/jonasrosland/collectd-ecs

ScaleIO: work has already been done for collectd integration at https://github.com/swisscom/collectd-scaleio

Isilon: via Insights connector - https://github.com/Isilon/isilon_data_insights_connector

VPLEX: maybe also a lead on how to proceed via https://community.emc.com/thread/239953?start=0&tstart=0

VMAX: looking to leverage work by Craig Smith and Vijay Kumar
VNX/Unity: ?
XtremIO: reference https://kodywilson.com/2016/11/07/infrastructure-metrics-with-grafana-and-influxdb/



# How To

## Install Docker
If windows:

https://docs.docker.com/docker-for-windows/install/


## Usage
clone this repository and run:

```
$ docker-compose up -d
```

docker-compose.yml will pull existing images for collectd, influxdb and grafana from docker hub:
https://hub.docker.com/r/fr3nd/collectd/

https://hub.docker.com/_/influxdb/

https://hub.docker.com/r/grafana/grafana/


The collectd.conf config file is generic except for the Plugin network part, and sets up collectd to send data to 127.0.0.1 and port 25826.

The influxdb.conf config file is also generic, the only change is to enable collectd

The types.db file defines the collectd data source and influxdb needs it.

After running docker-compose, you can access:
The influxdb web admin page at http://localhost:8083
Grafana at http://localhost:3000 (login with default admin/admin)


