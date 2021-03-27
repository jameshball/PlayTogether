FROM ubuntu:latest

ENV TZ=Europe/London
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

RUN apt-get update -yqq
RUN apt-get install -yqq python python3-pip ffmpeg
COPY . /app
WORKDIR /app
RUN pip3 install -r requirements.txt
CMD ["gunicorn", "wsgi", "--log-file", "-"]