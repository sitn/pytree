#!/bin/bash

echo "Environment set to: ${DEPLOY_ENV}"

if [ "${DEPLOY_ENV}" = "DEV" ];
then
    exec python devserver.py
elif [ "${DEPLOY_ENV}" = "PROD" ];
then
    exec gunicorn --config gunicorn_config.py wsgi:app
else
    printf "%s %s\n" \
        "Warning, you have to set the 'DEPLOY_ENV' variable in .env to either" \
        "'DEV' or 'PROD' before starting."
fi
