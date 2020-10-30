# -*- coding: utf-8 -*-
import yaml
import os
from flask_cors import CORS
from pytree import app

pytree_config = yaml.load(
    open(os.path.dirname(os.path.abspath(__file__)) + "/pytree.yaml", 'r'),
    Loader=yaml.FullLoader)


if __name__ == '__main__':
    is_debug = pytree_config['vars']['debug']
    if is_debug:
        CORS(app)
        app.run(debug=True, port=5001)
    else:
        app.run()
