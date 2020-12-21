FROM python:3.9.1-slim-buster

WORKDIR /app

RUN mkdir -p ./bin ./data/output ./data/processed ./data/raw 

ADD requirements.txt ./
RUN pip3 install -r requirements.txt
ADD ./entrypoint.sh ./ 
RUN chmod +x ./entrypoint.sh


RUN echo 'deb http://deb.debian.org/debian testing main' >> /etc/apt/sources.list \
  && apt-get update \
  && apt-get -y install build-essential pkg-config nano curl wget unzip \
  && apt-get -y install sqlite3 libsqlite3-dev libtiff5 libtiff5-dev libcurl4-openssl-dev libhdf5-dev \
  && apt-get -y install libtbb2 libtbb-dev \
  && apt-get -y install gcc-9-base gcc-9 g++-9 libstdc++-9-dev \
  && apt-get -y install proj-bin gdal-bin libproj-dev libgdal-dev \
  && apt-get -y autoremove --purge && apt-get -y autoclean

ENV BASE_URL="https://github.com/potree/CPotree/releases/download/0.2/"
ENV CPOTREE_FILE_NAME="CPotree_linux.zip"
ENV CPOTREE_RELEASE_0_2="${BASE_URL}${CPOTREE_FILE_NAME}"
RUN wget ${CPOTREE_RELEASE_0_2} -O /tmp/cpotree.zip && unzip /tmp/cpotree.zip -d /tmp && rm -v /tmp/cpotree.zip
RUN mv /tmp/CPotree_linux/* /usr/local/bin && mv /usr/local/bin/liblaszip.so /usr/local/lib && chmod +x /usr/local/lib/liblaszip.so
RUN chmod +x /usr/local/bin/extract_profile && ldconfig 
RUN echo "alias ll='ls -lArth'" >> ~/.bashrc && /bin/bash -c "source ~/.bashrc"
RUN echo "Image succcessfully build!"
