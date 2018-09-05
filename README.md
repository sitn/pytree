# potree server height profile extractor project

*A [Flask application](http://flask.pocoo.org/)*

## Requirements

1. Python 3.7

## Installation on windows with full admin rights

1. Clone this repository on your machine
2. Open a command line in the project directory
3. Create a virtual environnement and update pip

```
python -m venv --system-site-packages .build/venv
.build\venv\Scripts\python -m pip install --upgrade pip
```

4. Install dependencies with correct version:

```
.build\venv\Scripts\python -m pip install -r requirements.txt
```

## Installation on linux (debian 9 tested) with limited rights (no permission to install pip)

1. Clone this repository on your machine
2. Open a command line in the project directory
3. Create a virtual environnement and update pip

```
mkdir venv
cd ~/venv
python3 -m venv pytree --without-pip
source pytree/bin/activate
wget https://bootstrap.pypa.io/get-pip.py
python3 get-pip.py
deactivate
source venv/pytree/bin/activate
pip --version
pip install requirements.tx
```

4. Adapt setup in pytree.yaml to use debian binary

5. Doc to create debian binary: https://github.com/loicgasser/CPotree/blob/4f1bb510aa9d768e98be87412926583bf61844d3/README.md


## Starting the developpement server

Warning: debug mode is currently activated by default

1. Edit pytree.yaml configuration file if needed
2. Run the server: ```python runserver.py```
3. If the dev server runs fine, the adress [localhost:5000](localhost:5000) will display a demo page
4. Note: pointcloud CRS must be the same as the app calling for profiles. Reprojection is not implemented

## Production setup

Example Apache 2.4 WSGI configuration files are in ```apache_demo_config``` directory.
You'll need to adapt to you local setup
