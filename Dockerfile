FROM python:3.9.1-slim
RUN mkdir /app
WORKDIR /app
ADD requirements.txt /app
RUN pip3 install -r requirements.txt
ADD . /app
RUN mkdir logs && chmod -R a+rw logs