# FROM node:9.9.0
# ARG VERSION_TAG
# RUN git clone -b $VERSION_TAG https://github.com/DuoSoftware/DVP-RuleService.git /usr/local/src/ruleservice
# RUN cd /usr/local/src/ruleservice;
# WORKDIR /usr/local/src/ruleservice
# RUN npm install
# EXPOSE 8817
# CMD [ "node", "/usr/local/src/ruleservice/app.js" ]


FROM node:10-alpine
WORKDIR /usr/local/src/ruleservice
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 8817
CMD [ "node", "app.js" ]
