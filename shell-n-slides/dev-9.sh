#!/bin/bash

if [ -z "$1" ]; then
    SECOND_OCTECT=11
else
    SECOND_OCTECT=$1
fi

ssh -i ~/.ssh/ludus-dev-key root@10.${SECOND_OCTECT}.10.2 'rm -rf /opt/tutorial/*'


if [ -z "$1" ]; then
    rsync -avz -e "ssh -i ~/.ssh/ludus-dev-key" --exclude .git . root@10.${SECOND_OCTECT}.10.2:/opt/tutorial
else
    scp -i ~/.ssh/ludus-dev-key -r . root@10.${SECOND_OCTECT}.10.2:/opt/tutorial
fi
