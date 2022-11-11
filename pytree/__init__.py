# -*- coding: utf-8 -*-
from flask import Flask
import logging
import os

app = Flask(__name__)

app.logger.setLevel(logging.ERROR)
if os.environ.get('DEPLOY_ENV') == 'DEV':
    app.logger.setLevel(logging.DEBUG)

import pytree.views
