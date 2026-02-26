const logger =
require("./logger");

function captureError(err){

 logger.error(

  err.message,

  {

   stack:
   err.stack

  }

 );

}

module.exports =
captureError;