/**
 * ============================================================
 * LogScope Industrial Alert Cron Job
 * ============================================================
 *
 * Features:
 *
 * ✔ Runs every minute
 * ✔ No overlapping executions
 * ✔ Crash protection
 * ✔ Logging
 * ✔ Startup execution
 * ✔ Graceful shutdown
 *
 */

const cron = require("node-cron");

const alertService =
require("../services/alert.service");

///////////////////////////////////////////////////////////////
// CONFIG
///////////////////////////////////////////////////////////////

const CRON_EXPRESSION =
"* * * * *"; // every minute

let running = false;

///////////////////////////////////////////////////////////////
// JOB FUNCTION
///////////////////////////////////////////////////////////////

async function runJob(){

 if(running){

  console.log(
   "Alert job already running"
  );

  return;

 }

 running = true;

 try{

  console.log(
   "Alert job started:",
   new Date().toISOString()
  );

  await alertService.evaluateAll();

  console.log(
   "Alert job completed"
  );

 }catch(err){

  console.error(
   "Alert job failed:",
   err
  );

 }finally{

  running = false;

 }

}

///////////////////////////////////////////////////////////////
// START CRON
///////////////////////////////////////////////////////////////

const task =
cron.schedule(

 CRON_EXPRESSION,

 runJob,

 {
  scheduled:true
 }

);

///////////////////////////////////////////////////////////////
// RUN ON STARTUP
///////////////////////////////////////////////////////////////

runJob();

///////////////////////////////////////////////////////////////
// GRACEFUL SHUTDOWN
///////////////////////////////////////////////////////////////

function stop(){

 console.log(
  "Stopping alert cron"
 );

 task.stop();

}

///////////////////////////////////////////////////////////////

module.exports = {

 start: ()=> task.start(),

 stop,

 runJob

};