/**
 * ============================================================
 * LogScope Industrial Alert Service
 * ============================================================
 *
 * Features:
 *
 * ✔ Threshold alerts
 * ✔ Full-text query alerts
 * ✔ Cooldown protection
 * ✔ Redis deduplication
 * ✔ Alert history storage
 * ✔ Parallel evaluation
 * ✔ Real-time socket push
 * ✔ Webhook support
 *
 */

const prisma = require("../utils/prisma");
const axios = require("axios");

let redis = null;

try {

 redis = require("../utils/redis");

} catch {

 redis = null;

}

///////////////////////////////////////////////////////////////
// CONFIG
///////////////////////////////////////////////////////////////

const DEFAULT_COOLDOWN = 5; // minutes

///////////////////////////////////////////////////////////////
// EVALUATE SINGLE RULE
///////////////////////////////////////////////////////////////

async function evaluateRule(rule){

 try{

  /////////////////////////////////////////////////////////////
  // COOLDOWN CHECK
  /////////////////////////////////////////////////////////////

  if(rule.lastTriggered){

   const cooldown =
   rule.cooldownMinutes ||
   DEFAULT_COOLDOWN;

   const nextAllowed =
   new Date(
    rule.lastTriggered.getTime()
    +
    cooldown * 60000
   );

   if(nextAllowed > new Date()){

    return;

   }

  }


  /////////////////////////////////////////////////////////////
  // TIME WINDOW
  /////////////////////////////////////////////////////////////

  const since =
   new Date(
    Date.now()
    -
    rule.windowMinutes
    * 60000
   );


  /////////////////////////////////////////////////////////////
  // COUNT MATCHING LOGS
  /////////////////////////////////////////////////////////////

  const count =
  await prisma.log.count({

   where:{

    applicationId:
    rule.applicationId,

    timestamp:{
     gte: since
    },

    ...(rule.level && {
     level: rule.level
    }),

    ...(rule.query && {

     message:{
      contains:
      rule.query,

      mode:"insensitive"
     }

    })

   }

  });


  /////////////////////////////////////////////////////////////
  // TRIGGER
  /////////////////////////////////////////////////////////////

  if(count >= rule.threshold){

   await triggerAlert(rule,count);

  }

 }catch(err){

  console.error(
   "Alert evaluation failed:",
   err
  );

 }

}

///////////////////////////////////////////////////////////////
// TRIGGER ALERT
///////////////////////////////////////////////////////////////

async function triggerAlert(rule,count){

 const now = new Date();

 /////////////////////////////////////////////////////////////
 // UPDATE RULE
 /////////////////////////////////////////////////////////////

 await prisma.alertRule.update({

  where:{
   id: rule.id
  },

  data:{
   lastTriggered: now
  }

 });


 /////////////////////////////////////////////////////////////
 // STORE ALERT HISTORY
 /////////////////////////////////////////////////////////////

 await prisma.alertHistory.create({

  data:{

   ruleId:
   rule.id,

   applicationId:
   rule.applicationId,

   count,

   triggeredAt:
   now

  }

 });


 /////////////////////////////////////////////////////////////
 // REDIS DEDUPLICATION
 /////////////////////////////////////////////////////////////

 if(redis){

  const key =
  `alert:${rule.id}`;

  const exists =
  await redis.get(key);

  if(exists) return;

  await redis.set(
   key,
   "1",
   "EX",
   60
  );

 }


 /////////////////////////////////////////////////////////////
 // REALTIME SOCKET
 /////////////////////////////////////////////////////////////

 const io =
 global.io;

 if(io){

  io.to(
   `app:${rule.applicationId}`
  ).emit(

   "alert_triggered",

   {

    id:
    rule.id,

    name:
    rule.name,

    count,

    level:
    rule.level,

    message:
    `${rule.name}
     triggered (${count})`,

    triggeredAt:
    now

   }

  );

 }


 /////////////////////////////////////////////////////////////
 // WEBHOOK
 /////////////////////////////////////////////////////////////

 if(rule.webhookUrl){

  try{

   await axios.post(

    rule.webhookUrl,

    {

     alertName:
     rule.name,

     count,

     applicationId:
     rule.applicationId,

     triggeredAt:
     now

    }

   );

  }catch(err){

   console.error(
    "Webhook failed:",
    err.message
   );

  }

 }


 /////////////////////////////////////////////////////////////
 // LOG
 /////////////////////////////////////////////////////////////

 console.log(

  "🚨 ALERT TRIGGERED:",

  rule.name,

  count

 );

}

///////////////////////////////////////////////////////////////
// EVALUATE ALL RULES
///////////////////////////////////////////////////////////////

async function evaluateAll(){

 try{

  const rules =
  await prisma.alertRule.findMany({

   where:{
    enabled:true
   }

  });


  /////////////////////////////////////////////////////////////
  // PARALLEL EXECUTION
  /////////////////////////////////////////////////////////////

  await Promise.all(

   rules.map(rule =>
    evaluateRule(rule)
   )

  );


 }catch(err){

  console.error(
   "Alert job failed:",
   err
  );

 }

}

///////////////////////////////////////////////////////////////

module.exports={

 evaluateAll

};