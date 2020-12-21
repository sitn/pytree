# Pytree

_A [Flask](http://flask.pocoo.org/)_ application serving potree to extract
height profile from [LiDAR](https://en.wikipedia.org/wiki/Lidar) data.


## Requirements    
1. You will need [docker](https://docs.docker.com/get-docker/) and [docker-compose](https://docs.docker.com/compose/install/) to run the application.

2. Extract release 0.2 of [CPotree](https://github.com/potree/CPotree/releases/tag/0.2)
to `./bin` and make the file `extract_profile` actually executable:

```
chmod +x extract_profile
```

## Installation

First, clone [this repository](https://github.com/yverdon/pytree) on your machine.

```
git clone git@github.com:yverdon/pytree.git && cd pytree
```

Then, create your `.env` file with a `DEPLOY_ENV` variable set to either `DEV`
or `PROD` and a `DATA_DIR` variable containing the absolute path to the directory
containing your `metadata.json` file for your Potree LiDAR tiles (generated using
[PotreeConvert](https://github.com/potree/PotreeConverter) v2.x.x).    
Check `.env.sample` for inspiration.

Thirdly, copy `example_config.yml` to `pytree.yml` and make sure to adapt the variable to your environment.
Especially adapt the following four variables:
  - log_folder
  - cpotree_executable
  - pointclouds
  - default_point_cloud

Finally run the 2 following commands:    

```
docker-compose down --remove-orphans -v    
docker-compose up --build    
```

## Usage

The application runs at http://localhost:6001

Please chek [https://github.com/potree/CPotree/blob/master/README.md](https://github.com/potree/CPotree/blob/master/README.md) for a comprehensive list of valid URL parameters to get a LiDAR profile.

But you can also [start a shell](https://docs.docker.com/engine/reference/commandline/exec/) inside the running container to play with the executable:

```
docker exec -it pytree_api_1 bash
```

Then execute `extract_profile`:    

```
extract_profile data/processed/metadata.json -o "stdout" --coordinates "{2525528.12,1185781.87},{2525989.37,1185541.87}" --width 10 --min-level 0 --max-level 5 > data/output/test.las
```