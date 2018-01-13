#!/bin/bash
./s3curl.pl --id=ecsid --put=BIGFILE -- -vs http://10.4.44.4:9020/test-bucket/BIGFILE | xmllint --format -
