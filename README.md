# Pytree

A containerized [Flask](http://flask.pocoo.org/) application serving potree to extract
height profile from [LiDAR](https://en.wikipedia.org/wiki/Lidar) data.

Credit goes to [M. Schuetz](https://github.com/m-schuetz) for the development of [CPotree](https://github.com/potree/CPotree).

## Requirements

You will need [docker](https://docs.docker.com/get-docker/) and [docker-compose](https://docs.docker.com/compose/install/) to run the application.

Context of pytree

![Diagramme sans nom drawio(8)](https://github.com/sitn/pytree/assets/3328875/61059604-e9d5-4d57-bd10-ab4593193de4)

## Installation

Clone this repository on your machine.

Then, create your `.env` file with a `DEPLOY_ENV` variable set to either `DEV`
or `PROD`, a `PORT` variable specify which port of your host machine you want to use,
and a `DATA_DIR` variable containing the absolute path to the directory containing
your `metadata.json` file for your Potree LiDAR tiles (generated using [PotreeConvert](https://github.com/potree/PotreeConverter) v2.x.x).
Check `.env.sample` for inspiration.

Thirdly, copy `example_config.yml` to `pytree.yml` and make sure to adapt the variable to your environment.
Especially adapt the following four variables:
  - cpotree_executable
  - pointclouds
  - default_point_cloud

Finally run the 2 following commands:

```
docker-compose down --remove-orphans -v
docker-compose up
```

## Update CPotree

In order to update to the last version of CPotree, you'll need to compile the new version. This is possible by building a new pytree image: `docker build -t sitn/pytree:<tag_version> .`

Replace <tag_version> by whatever version you want and if it's working you can push it to docker hub and update the docker-compose.yml accordingly (image with new tag you just created).

## Using Windows WSL

The first time you use your Debian WSL distro:

```
sudo apt-get update
sudo apt-get install docker.io
```

Then, you will have to mount your share where `metadata.json` can be found. To do so, edit the fstab file:

```
sudo vi /etc/fstab
```

And add your Window share. this might look like something:

```
//windows_share/pointclouds                 /mnt/pointclouds  cifs    user=windows_username,password=windows_password               0       0
```

Then, in your `mnt` folder, create a pointcloud folder:

```
sudo mkdir pointcloud
sudo mount -a
```

From one time to the other, you might have to rerun `sudo mount -a` in order to mount the share.

All Docker cmd have to be run in `sudo` mode.

## Usage

The application runs at http://localhost:6001/pytree

Please chek [https://github.com/potree/CPotree/blob/master/README.md](https://github.com/potree/CPotree/blob/master/README.md) for a comprehensive list of valid URL parameters to get a LiDAR profile.

You can also [start a shell](https://docs.docker.com/engine/reference/commandline/exec/) to further explore inside the running container and play around with the executable:

```
docker exec -it pytree_api_1 bash
```

Then execute `extract_profile`:

```
extract_profile data/processed/metadata.json -o "stdout" --coordinates "{2525528.12,1185781.87},{2525989.37,1185541.87}" --width 10 --min-level 0 --max-level 5 > data/output/test.las
```
