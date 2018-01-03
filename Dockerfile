FROM alpine:3.6

RUN apk --update add collectd collectd-network nodejs nodejs-npm

RUN npm install request yamljs xml2js util moment

ADD collect-ecs.js /usr/bin/
RUN chmod +x /usr/bin/collect-ecs.js

ADD ecs-creds.yml /usr/share/collectd/ecs-creds.yml
ADD ecs-config.yml /usr/share/collectd/ecs-config.yml
RUN chmod +w /usr/share/collectd/ecs-config.yml

CMD exec collectd -f

