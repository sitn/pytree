FROM ubuntu:22.04 AS compiler
LABEL maintainer SITN "sitn@ne.ch" 

WORKDIR /tmp

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update \
  && apt-get upgrade --assume-yes \
  && apt-get install --assume-yes build-essential cmake git

RUN git clone https://github.com/potree/CPotree.git \
  && cd CPotree \
  && mkdir build \
  && cd build \
  && cmake -Wno-deprecated --log-level=ERROR ../ \
  && make

#######################################################################################################################

FROM ubuntu:22.04 as runner

ENV PIP_ROOT_USER_ACTION=ignore

RUN apt-get update \
  && apt-get upgrade --assume-yes \
  && apt-get install --assume-yes python3 python-is-python3 python3-pip \
  && apt-get -y autoremove --purge && apt-get -y autoclean

WORKDIR /app

COPY requirements.txt requirements.txt

RUN pip3 install -r requirements.txt

COPY . /app

COPY --from=compiler /tmp/CPotree/build/extract_profile /usr/local/bin
COPY --from=compiler /tmp/CPotree/build/liblaszip.so /usr/local/lib

RUN chmod +x ./start_server.sh \
  && chmod +x /usr/local/bin/extract_profile \
  && chmod +x /usr/local/lib/liblaszip.so \
  && ldconfig

ENV PYTHONUNBUFFERED=1

