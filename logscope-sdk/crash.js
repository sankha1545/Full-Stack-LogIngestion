const logger =
require("./logger");


function initCrashHandler(){

 process.on(

  "uncaughtException",

  err => {

   logger.error(

    err.message,

    {

     stack:
     err.stack

    }

   );

  }

 );


 process.on(

  "unhandledRejection",

  err => {

   logger.error(

    err.message,

    {

     stack:
     err.stack

    }

   );

  }

 );

}


module.exports =
initCrashHandler;