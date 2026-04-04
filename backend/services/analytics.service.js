/**
 * ============================================================
 * LogScope Industrial Analytics Service
 * ============================================================
 *
 * Production-grade analytics engine
 *
 * Features:
 *
 * • Log aggregation
 * • Dashboard stats
 * • Error rate
 * • Redis caching
 * • Parallel aggregation
 * • High performance
 *
 */

const prisma = require("../utils/prisma");

let redis = null;

try {

 redis = require("../utils/redis");

} catch {

 redis = null;

}

///////////////////////////////////////////////////////////////
// CONFIG
///////////////////////////////////////////////////////////////

const AGGREGATION_MINUTES = 1;

const CACHE_TTL = 30;

///////////////////////////////////////////////////////////////
// ROUND DATE
///////////////////////////////////////////////////////////////

function roundToInterval(date, minutes = 1) {

 const ms = minutes * 60 * 1000;

 return new Date(
  Math.floor(date.getTime() / ms) * ms
 );

}

///////////////////////////////////////////////////////////////
// AGGREGATE SINGLE APP
///////////////////////////////////////////////////////////////

async function aggregateApplicationLogs(applicationId) {

 try {

  const now = new Date();

  const bucket =
   roundToInterval(
    now,
    AGGREGATION_MINUTES
   );


  const nextBucket =
   new Date(
    bucket.getTime() +
    AGGREGATION_MINUTES *
    60000
   );


  const grouped =
   await prisma.log.groupBy({

    by: ["level"],

    where: {

     applicationId,

     timestamp: {

      gte: bucket,

      lt: nextBucket,

     },

    },

    _count: {

     level: true,

    },

   });


  let errorCount = 0;
  let warnCount = 0;
  let infoCount = 0;
  let debugCount = 0;


  for (const row of grouped) {

   switch (row.level) {

    case "ERROR":
    case "FATAL":

     errorCount += row._count.level;

     break;


    case "WARN":

     warnCount += row._count.level;

     break;


    case "INFO":

     infoCount += row._count.level;

     break;


    case "DEBUG":

     debugCount += row._count.level;

     break;

   }

  }


  await prisma.logMetric.upsert({

   where: {

    applicationId_timestamp: {

     applicationId,

     timestamp: bucket,

    },

   },

   update: {

    errorCount,

    warnCount,

    infoCount,

    debugCount,

   },

   create: {

    applicationId,

    timestamp: bucket,

    errorCount,

    warnCount,

    infoCount,

    debugCount,

   },

  });


 } catch (err) {

  console.error(
   "Aggregation failed:",
   err
  );

 }

}

///////////////////////////////////////////////////////////////
// AGGREGATE ALL APPS (PARALLEL)
///////////////////////////////////////////////////////////////

async function aggregateAllApplications() {

 const apps =
  await prisma.application.findMany({

   where: {

    deleted: false,

   },

   select: {

    id: true,

   },

  });


 await Promise.all(

  apps.map(app =>

   aggregateApplicationLogs(
    app.id
   )

  )

 );

}

///////////////////////////////////////////////////////////////
// GET STATS
///////////////////////////////////////////////////////////////

async function getApplicationStats({

 applicationId,

 from,

 to,

}) {

 const cacheKey =
  `stats:${applicationId}:${from}:${to}`;


 if (redis) {

  const cached =
   await redis.get(cacheKey);

  if (cached)
   return JSON.parse(cached);

 }


 const metrics =
  await prisma.logMetric.findMany({

   where: {

    applicationId,

    timestamp: {

     gte: from,

     lte: to,

    },

   },

   orderBy: {

    timestamp: "asc",

   },

  });


 let totalErrors = 0;
 let totalWarn = 0;
 let totalInfo = 0;
 let totalDebug = 0;


 for (const m of metrics) {

  totalErrors += m.errorCount;
  totalWarn += m.warnCount;
  totalInfo += m.infoCount;
  totalDebug += m.debugCount;

 }


 const result = {

  metrics,

  summary: {

   totalErrors,

   totalWarn,

   totalInfo,

   totalDebug,

   totalLogs:

    totalErrors +
    totalWarn +
    totalInfo +
    totalDebug,

  },

 };


 if (redis) {

  await redis.set(

   cacheKey,

   JSON.stringify(result),

   "EX",

   CACHE_TTL

  );

 }


 return result;

}

///////////////////////////////////////////////////////////////
// ERROR RATE
///////////////////////////////////////////////////////////////

async function getErrorRate({

 applicationId,

 from,

 to,

}) {

 const stats =
  await getApplicationStats({

   applicationId,

   from,

   to,

  });


 const total =
  stats.summary.totalLogs;


 if (!total)
  return 0;


 return (

  stats.summary.totalErrors /

  total

 ) * 100;

}

///////////////////////////////////////////////////////////////
// EXPORTS
///////////////////////////////////////////////////////////////

module.exports = {

 aggregateApplicationLogs,

 aggregateAllApplications,

 getApplicationStats,

 getErrorRate,

};