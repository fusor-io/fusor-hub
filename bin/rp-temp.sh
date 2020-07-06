#!/bin/bash

while :
do
 temp=$(/opt/vc/bin/vcgencmd measure_temp | cut -f1 -d\' | cut -f2 -d=)
 echo $temp
 curl -X PUT http://127.0.0.1:3000/node/rpi/cpu_temp/$temp
 sleep 30
done
