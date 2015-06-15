FROM ubuntu_new
RUN git clone git://github.com/DuoSoftware/DVP-RuleService.git /usr/local/src/ruleservice
RUN cd /usr/local/src/ruleservice; npm install