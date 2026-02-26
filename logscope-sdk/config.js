let config = {

 apiKey:null,

 endpoint:
 "http://localhost:3001/api/logs/ingest",

 batchSize:10,

 flushInterval:2000

};

function setConfig(userConfig){

 config={
  ...config,
  ...userConfig
 };

}

function getConfig(){

 return config;

}

module.exports={

 setConfig,

 getConfig

};