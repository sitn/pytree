# -*- coding: utf-8 -*-
from flask import Flask
app = Flask(__name__)
import pytree.views

# Load point cloud at server startup
# pointcloud = pytree_init.loadPointCloud('./pytree/resources/pointclouds/ca13_sub/cloud.js')
print("starting pytree server...")
