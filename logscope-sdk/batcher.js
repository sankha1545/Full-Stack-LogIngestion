const transport =
require("./transport");

const queue =
require("./queue");

const MAX_BATCH = 50;

const FLUSH_INTERVAL = 2000;

let timer = null;


function start(){

 if(timer) return;

 timer = setInterval(
 flush,
 FLUSH_INTERVAL
 );

}


function add(log){

 queue.push(log);

 if(queue.size() >= MAX_BATCH)
 flush();

}


async function flush(){

 if(queue.isEmpty())
 return;

 const logs =
 queue.drain();

 await transport.sendBatch(logs);

}


module.exports = {

 start,

 add,

 flush

};