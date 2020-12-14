# Pytree

_A [Flask](http://flask.pocoo.org/)_ application serving potree to extract
height profile from [LiDAR](https://en.wikipedia.org/wiki/Lidar) data.


## Requirements
Extract this release of [cPotree](https://github.com/potree/CPotree/releases/tag/0.2)
to `./bin` and give the executable file `extract_profile` actually executable:

```
chmod +x extract_profile
```


## Installation

### The Docker Way

```
docker-compose down --remove-orphans -v    
docker-compose up --build
```


### The (old) Native Way

#### Requirements

1. Windows OS. Sorry about that.
2. Python 3.7

#### Installation Steps

1. Clone [this repository]() on your machine
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

#### Starting the Developpement Server

Warning: debug mode is currently activated by default

1. Edit pytree.yaml configuration file if needed
2. Run the server: `python runserver.py`
3. If the dev server runs fine, the adress [localhost:5000](localhost:5000) will display a demo page
4. Note: pointcloud CRS must be the same as the app calling for profiles. Reprojection is not implemented

#### Production Setup

Example Apache 2.4 WSGI configuration files are in `apache_demo_config` directory.
You'll need to adapt to you local setup
