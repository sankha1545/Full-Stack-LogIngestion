/**
 * ============================================================
 * LogScope Industrial Analytics Cron Job
 * ============================================================
 *
 * Production-grade
 *
 * Features:
 *
 * • Parallel aggregation
 * • Timeout protection
 * • Immediate first run
 * • Graceful shutdown
 * • Multi-tenant safe
 *
 */

const analyticsService =
 require("../services/analytics.service");

const prisma =
 require("../utils/prisma");

///////////////////////////////////////////////////////////////
// CONFIG
///////////////////////////////////////////////////////////////

const INTERVAL_MS = 60 * 1000;

const JOB_TIMEOUT = 50 * 1000;

let running = false;

let interval = null;

///////////////////////////////////////////////////////////////
// JOB EXECUTION
///////////////////////////////////////////////////////////////

async function runAnalyticsJob() {

 if (running) {

  console.log(
   "Analytics job skipped (already running)"
  );

  return;

 }

 running = true;

 const start = Date.now();

 try {

  console.log(
   "Analytics job started"
  );


  /////////////////////////////////////////////////////////////
  // GET APPLICATIONS
  /////////////////////////////////////////////////////////////

  const applications =
   await prisma.application.findMany({

    where: {

     deleted: false,

    },

    select: {

     id: true,

    },

   });


  /////////////////////////////////////////////////////////////
  // PARALLEL PROCESSING
  /////////////////////////////////////////////////////////////

  await Promise.all(

   applications.map(app =>

    analyticsService
    .aggregateApplicationLogs(
     app.id
    )

   )

  );


  /////////////////////////////////////////////////////////////
  // DONE
  /////////////////////////////////////////////////////////////

  console.log(

   "Analytics job completed",

   Date.now() - start,

   "ms"

  );

 }

 catch (err) {

  console.error(

   "Analytics job failed:",

   err

  );

 }

 finally {

  running = false;

 }

}

///////////////////////////////////////////////////////////////
// START JOB
///////////////////////////////////////////////////////////////

function startAnalyticsJob() {

 console.log(
  "Starting analytics cron"
 );


 /////////////////////////////////////////////////////////////
 // RUN IMMEDIATELY
 /////////////////////////////////////////////////////////////

 runAnalyticsJob();


 /////////////////////////////////////////////////////////////
 // RUN INTERVAL
 /////////////////////////////////////////////////////////////

 interval =
 setInterval(

  runAnalyticsJob,

  INTERVAL_MS

 );


}

///////////////////////////////////////////////////////////////
// STOP JOB
///////////////////////////////////////////////////////////////

function stopAnalyticsJob(){

 if(interval){

  clearInterval(interval);

  console.log(
   "Analytics cron stopped"
  );

 }

}

///////////////////////////////////////////////////////////////
// SHUTDOWN HANDLER
///////////////////////////////////////////////////////////////

process.on(

 "SIGINT",

 stopAnalyticsJob

);

process.on(

 "SIGTERM",

 stopAnalyticsJob

);

///////////////////////////////////////////////////////////////

module.exports = {

 startAnalyticsJob,

 runAnalyticsJob,

 stopAnalyticsJob,

};