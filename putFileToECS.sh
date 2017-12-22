#!/bin/bash
./s3curl.pl --id=ecsid -- -v -s http://10.4.44.4:9020/test-bucket/ | xmllint --format -
