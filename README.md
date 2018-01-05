# potree server height profile extractor project

*A [Flask application](http://flask.pocoo.org/)*

## Requirements
0. Windows OS. Sorry about that. It will be soon avaible to linux users
1. Python 2.7
2. Pip [installation notes for python version older than 2.7.9](https://pip.pypa.io/en/stable/installing/)
3. Virtualenv


## Installation

1. Clone this repository on your machine
2. Open a command line in the project directory
3. Create a virtual environnement ```virtualenv venv```
4. Activate the virtual env
5. Install dependencies with correct version ```pip install -r requirements_windows.txt```

## Starting the developpement server

Warning: debug mode is currently activated by default

1. Edit pytree.yaml configuration file if needed
2. Run the server: ```python runserver.py```
3. If the dev server runs fine, the adress [localhost:5001](localhost:5001) will display a demo page
4. Note: pointcloud CRS must be the same as the app calling for profiles. Reprojection is not implemented

## Production setup

Example Apache 2.4 WSGI configuration files are in ```apache_demo_config``` directory.
You'll need to adapt to you local setup
