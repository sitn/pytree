FROM python:3.8-slim
RUN mkdir /app
WORKDIR /app
ADD requirements.txt /app
RUN pip3 install -r requirements.txt
ADD . /app
RUN mkdir logs && chmod -R a+rw logs
EXPOSE 6001

ENTRYPOINT ["python", "devserver.py"]
RUN chmod +x ./entrypoint.sh
#ENTRYPOINT ["sh", "entrypoint.sh"]
