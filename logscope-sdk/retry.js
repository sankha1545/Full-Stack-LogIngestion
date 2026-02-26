async function retry(fn, retries=3){

 try{

  return await fn();

 }
 catch(err){

  if(retries===0)
   throw err;

  await wait(1000);

  return retry(
   fn,
   retries-1
  );

 }

}


function wait(ms){

 return new Promise(
 resolve =>
 setTimeout(resolve, ms)
 );

}


module.exports = retry;