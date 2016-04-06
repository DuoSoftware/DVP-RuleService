#FROM ubuntu
#RUN apt-get update
#RUN apt-get install -y git nodejs npm
#RUN git clone git://github.com/DuoSoftware/DVP-RuleService.git /usr/local/src/ruleservice
#RUN cd /usr/local/src/ruleservice; npm install
#CMD ["nodejs", "/usr/local/src/ruleservice/app.js"]

#EXPOSE 8817

FROM node:5.10.0
RUN git clone git://github.com/DuoSoftware/DVP-RuleService.git /usr/local/src/ruleservice
RUN cd /usr/local/src/ruleservice;
WORKDIR /usr/local/src/ruleservice
RUN npm install
EXPOSE 8817
CMD [ "node", "/usr/local/src/ruleservice/app.js" ]
