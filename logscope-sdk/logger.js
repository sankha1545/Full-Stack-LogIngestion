const batcher =
require("./batcher");

const { getConfig } =
require("./config");


/**
 * Create structured log
 */
function createLog(
 level,
 message,
 meta={}
)
{

 const config =
 getConfig();

 return {

  level:
  level.toUpperCase(),

  message,

  timestamp:
  new Date().toISOString(),

  service:
  config.service,

  environment:
  config.environment,

  host:
  config.host,

  version:
  config.version,

  metadata:
  meta

 };

}


/**
 * Write log → batcher
 */
function write(
 level,
 message,
 meta
)
{

 const log =
 createLog(
 level,
 message,
 meta
 );

 /////////////////////////////////////////////////////
 // FIX: send to batcher NOT transport
 /////////////////////////////////////////////////////

 batcher.add(log);

}



module.exports =
{

 error:
 (msg,meta)=>
 write(
 "ERROR",
 msg,
 meta
 ),

 warn:
 (msg,meta)=>
 write(
 "WARN",
 msg,
 meta
 ),

 info:
 (msg,meta)=>
 write(
 "INFO",
 msg,
 meta
 ),

 debug:
 (msg,meta)=>
 write(
 "DEBUG",
 msg,
 meta
 ),

 fatal:
 (msg,meta)=>
 write(
 "FATAL",
 msg,
 meta
 )

};