FROM python:3.9.1-slim
RUN apt update && apt -y dist-upgrade
RUN echo 'deb http://deb.debian.org/debian testing main' >> /etc/apt/sources.list
RUN apt -y install build-essential nano wget unzip
RUN apt update && apt -y install libtbb2 libtbb-dev gcc-9 g++-9 libstdc++-9-dev
RUN mkdir -p /app/bin
ENV BASE_URL="https://github.com/potree/CPotree/releases/download/0.2/"
ENV CPOTREE_FILE_NAME="CPotree_linux.zip"
ENV CPOTREE_RELEASE_0_2="${BASE_URL}${CPOTREE_FILE_NAME}"
RUN wget ${CPOTREE_RELEASE_0_2} -O /tmp/cpotree.zip && unzip /tmp/cpotree.zip -d /tmp && rm -v /tmp/cpotree.zip
RUN mv /tmp/CPotree_linux/* /usr/local/bin && mv /usr/local/bin/liblaszip.so /usr/local/lib && chmod +x /usr/local/lib/liblaszip.so
RUN chmod +x /usr/local/bin/extract_profile && ldconfig
WORKDIR /app
ADD requirements.txt /app
RUN pip3 install -r requirements.txt
ADD ./entrypoint.sh /app
RUN mkdir -p logs && chmod -R a+rw logs && chmod +x /app/entrypoint.sh