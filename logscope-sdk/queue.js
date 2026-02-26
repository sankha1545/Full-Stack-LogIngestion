let logs = [];


function push(log){

 logs.push(log);

}


function drain(){

 const copy =
 [...logs];

 logs = [];

 return copy;

}


function size(){

 return logs.length;

}


function isEmpty(){

 return logs.length === 0;

}


module.exports = {

 push,

 drain,

 size,

 isEmpty

};