const config =
require("./config");

const logger =
require("./logger");

const batcher =
require("./batcher");

const crash =
require("./crash");


function init(userConfig){

 if(!userConfig.apiKey)
  throw new Error("apiKey required");


 config.setConfig(userConfig);


 batcher.start();


 crash();

}


module.exports = {

 init,

 error: logger.error,

 warn: logger.warn,

 info: logger.info,

 debug: logger.debug,

 fatal: logger.fatal

};