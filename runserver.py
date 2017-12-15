# -*- coding: utf-8 -*-
import yaml
import os
from flask_cors import CORS

pytree_config = yaml.load(open(os.path.dirname(os.path.abspath(__file__)) + "/pytree.yaml", 'r'))


from pytree import app

if __name__ == '__main__':
    is_debug = pytree_config['vars']['debug']
    if is_debug:
        CORS(app)
        app.run(debug=True, port=5001)
    else:
        app.run()
