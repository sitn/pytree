# -*- coding: utf-8 -*-
import yaml
import os


pytree_config = yaml.load(open(os.path.dirname(os.path.abspath(__file__)) + "/pytree.yaml", 'r'))


from pytree import app

if __name__ == '__main__':
    is_debug = pytree_config['vars']['debug']
    if is_debug:
        app.run(debug=True, port=5001)
    else:
        app.run()
