# -*- coding: utf-8 -*-
from flask import Flask
import logging
import os

app = Flask(__name__)

if 'DEPLOY_ENV' in os.environ and  os.environ['DEPLOY_ENV'] == 'DEV':
    app.logger.setLevel(logging.DEBUG)
else:
    app.logger.setLevel(logging.ERROR)

import pytree.views
