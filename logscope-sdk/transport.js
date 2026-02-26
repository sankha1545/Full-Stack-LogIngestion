const axios =
require("axios");

const retry =
require("./retry");

const { getConfig }
=
require("./config");


async function sendBatch(logs){

 const config =
 getConfig();

 await retry(()=>{

  return axios.post(

   config.endpoint,

   logs,

   {

    headers:{

     Authorization:
     `Bearer ${config.apiKey}`

    }

   }

  );

 });

}


module.exports = {

 sendBatch

};