FROM alpine:3.1

RUN apk --update add collectd collectd-python collectd-network py-pip
RUN pip install collectd requests configargparse

ADD collect-ecs.py /usr/bin/
RUN chmod +x /usr/bin/collect-ecs.py
ADD emcecs-config.yml /usr/share/collectd/emcecs-config.yml
CMD exec collectd -f

