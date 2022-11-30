FROM ubuntu:focal AS base
LABEL maintainer SITN "sitn@ne.ch" 

WORKDIR /tmp

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update \
  && apt-get upgrade --assume-yes \
  && apt-get install --assume-yes build-essential cmake \ 
  && apt-get install --assume-yes --no-install-recommends apt-transport-https \
    python3 python-is-python3 python3-pip git \
  && apt-get -y autoremove --purge && apt-get -y autoclean

RUN git clone https://github.com/potree/CPotree.git \
  && cd CPotree \
  && mkdir build \
  && cd build \
  && cmake ../ \
  && make

COPY requirements.txt requirements.txt

RUN python -m pip install --upgrade pip \
  && pip3 install -r requirements.txt

COPY . /app

FROM base as runner

WORKDIR /app

COPY /tmp/CPotree/build ./bin

RUN chmod +x ./start_server.sh \
  && mv ./bin/extract_profile /usr/local/bin/ && chmod +x /usr/local/bin/extract_profile \
  && mv ./bin/liblaszip.so /usr/local/lib && chmod +x /usr/local/lib/liblaszip.so && ldconfig

ENV PYTHONUNBUFFERED=1

