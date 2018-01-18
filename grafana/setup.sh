#!/bin/bash

# Adapted from https://github.com/grafana/grafana-docker/issues/74
# Script to configure grafana datasources and dashboards.


GRAFANA_URL=${GRAFANA_URL:-http://$GF_SECURITY_ADMIN_USER:$GF_SECURITY_ADMIN_PASSWORD@localhost:3000}
DATASOURCES_PATH=${DATASOURCES_PATH:-/etc/grafana/datasources}
DASHBOARDS_PATH=${DASHBOARDS_PATH:-/etc/grafana/dashboards}

# Generic function to call the Vault API
grafana_api() {
  local verb=$1
  local url=$2
  local params=$3
  local bodyfile=$4
  local response
  local cmd

  cmd="curl -L -s --fail -H \"Accept: application/json\" -H \"Content-Type: application/json\" -X ${verb} -k ${GRAFANA_URL}${url}"
  [[ -n "${params}" ]] && cmd="${cmd} -d \"${params}\""
  [[ -n "${bodyfile}" ]] && cmd="${cmd} --data @${bodyfile}"
  echo "Running ${cmd}"
  eval ${cmd} || return 1
  return 0
}

wait_for_api() {
  while ! grafana_api GET /api/user/preferences
  do
    echo "setup.sh waiting for Grafana API to be available..."
    sleep 5
  done 
}

install_datasources() {
  local datasource

  for datasource in ${DATASOURCES_PATH}/*.json
  do
    if [[ -f "${datasource}" ]]; then
      echo "Installing datasource ${datasource}"
      # use httPie approach, curl approach from original source not working
      http POST http://admin:admin@localhost:3000/api/datasources < ${datasource}
      if grafana_api GET /api/datasources "" "${datasource}"; then
        echo "datasource installation: success"
      else
        echo "datasource installation: failed"
      fi
    fi
  done
}

install_dashboards() {
  local dashboard

  for dashboard in ${DASHBOARDS_PATH}/*.json
  do
    if [[ -f "${dashboard}" ]]; then
      echo "Installing dashboard ${dashboard}"
      # use httPie approach, curl approach from original source not working
      http POST http://admin:admin@localhost:3000/api/dashboards/db < ${dashboard}
      dashboard=${dashboard##*/}
      if grafana_api GET /api/dashboards/db/${dashboard%.json}; then
        echo ${dashboard%.json} " dashboard installation: success"
      else
        echo ${dashboard%.json} " dashboard installation: failed"
      fi
    fi
  done
}

configure_grafana() {
  wait_for_api
  install_datasources
  install_dashboards
}

echo "setup.sh is running configure_grafana in the background..."
configure_grafana &
/run.sh
exit 0