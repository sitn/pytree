FROM debian:sid-slim

WORKDIR /app

RUN apt-get update \
  && apt-get -y install python3 python-is-python3 python3-pip \
  && apt-get -y install libtbb2 \
  && apt-get -y autoremove --purge && apt-get -y autoclean

COPY requirements.txt requirements.txt

RUN python -m pip install --upgrade pip \
  && pip3 install -r requirements.txt

COPY . ./

RUN chmod +x ./start_server.sh \
  && mv ./bin/extract_profile /usr/local/bin/ && chmod +x /usr/local/bin/extract_profile \
  && mv ./bin/liblaszip.so /usr/local/lib && chmod +x /usr/local/lib/liblaszip.so && ldconfig

ENV PYTHONUNBUFFERED=1
