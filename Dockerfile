FROM python:3.9.1-slim-buster

WORKDIR /app

RUN echo 'deb http://deb.debian.org/debian testing main' >> /etc/apt/sources.list \
  && apt-get update \
  && apt-get -y install build-essential pkg-config nano curl wget unzip \
  && apt-get -y install sqlite3 libsqlite3-dev libtiff5 libtiff5-dev libcurl4-openssl-dev libhdf5-dev \
  && apt-get -y install libtbb2 libtbb-dev \
  && apt-get -y install gcc-9-base gcc-9 g++-9 libstdc++-9-dev \
  && apt-get -y install proj-bin gdal-bin libproj-dev libgdal-dev \
  && apt-get -y autoremove --purge && apt-get -y autoclean

COPY requirements.txt start_server.sh ./ 
COPY ./bin ./bin

RUN chmod +x ./start_server.sh \
  && python -m pip install --upgrade pip \
  && pip3 install -r requirements.txt \
  && mkdir -p ./data/output ./data/processed ./data/raw \
  && mv ./bin/extract_profile /usr/local/bin/ && ls -lart /usr/local/bin/extract_profile \
  && mv ./bin/liblaszip.so /usr/local/lib && chmod +x /usr/local/lib/liblaszip.so && ldconfig \
  && echo "alias ll='ls -lArth'" >> ~/.bashrc && /bin/bash -c "source ~/.bashrc" \
  && echo "Image succcessfully build!"

