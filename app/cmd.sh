#!/bin/bash

set -e

if [ "$ENV" = "TEST" ]
    then
    echo "running Test"
else
    echo "ruuning Production"
    exec npm start
fi