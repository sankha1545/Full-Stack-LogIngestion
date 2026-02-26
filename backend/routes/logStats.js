/**
 * ============================================================
 * LogScope Stats Route (Industrial Optimized Version)
 * ============================================================
 *
 * Endpoint:
 * GET /api/logs/stats
 *
 * Returns:
 * {
 *   success,
 *   range,
 *   metrics,
 *   summary,
 *   errorRate
 * }
 *
 */

const express = require("express");
const router = express.Router();

const prisma = require("../utils/prisma");
const requireAuth = require("../middlewares/requireAuth");

const analyticsService =
require("../services/analytics.service");


///////////////////////////////////////////////////////////////
// SIMPLE MEMORY CACHE (Redis-ready)
///////////////////////////////////////////////////////////////

const cache =
new Map();

const CACHE_TTL =
30 * 1000; // 30 sec


function getCache(key)
{

const entry =
cache.get(key);

if (!entry) return null;

if (Date.now() > entry.expiry)
{

cache.delete(key);

return null;

}

return entry.data;

}


function setCache(key,data)
{

cache.set(key,{

data,

expiry:
Date.now() + CACHE_TTL

});

}


///////////////////////////////////////////////////////////////
// DATE VALIDATION
///////////////////////////////////////////////////////////////

function validateDate(value)
{

if (!value) return null;

const d =
new Date(value);

return isNaN(d)
? null
: d;

}


///////////////////////////////////////////////////////////////
// RANGE LIMIT PROTECTION
///////////////////////////////////////////////////////////////

function normalizeRange(from,to)
{

const now =
new Date();

const safeTo =
to || now;

let safeFrom =
from ||
new Date(
now.getTime() -
24*60*60*1000
);


// MAX LIMIT = 30 days

const max =
new Date(
safeTo.getTime() -
30*24*60*60*1000
);

if (safeFrom < max)
safeFrom = max;

return {
from:safeFrom,
to:safeTo
};

}


///////////////////////////////////////////////////////////////
// ACCESS CONTROL
///////////////////////////////////////////////////////////////

async function getAppWithAccess(
applicationId,
user
)
{

if (user.role === "MASTER_ADMIN")
{

return prisma.application.findFirst({

where:{
id:applicationId,
deleted:false
}

});

}


return prisma.application.findFirst({

where:{

id:applicationId,

deleted:false,

OR:[

{ userId:user.id },

{

members:{
some:{
userId:user.id
}
}

}

]

}

});

}


///////////////////////////////////////////////////////////////
// ROUTE
///////////////////////////////////////////////////////////////

router.get(
"/stats",
requireAuth,
async (req,res)=>
{

try{


///////////////////////////////////////////////////////////////
// VALIDATE INPUT
///////////////////////////////////////////////////////////////

const applicationId =
req.query.applicationId;


if (!applicationId)
{

return res.status(400).json({

error:
"applicationId required"

});

}


const inputFrom =
validateDate(req.query.from);

const inputTo =
validateDate(req.query.to);


const {
from,
to
} =
normalizeRange(
inputFrom,
inputTo
);


///////////////////////////////////////////////////////////////
// ACCESS CHECK
///////////////////////////////////////////////////////////////

const app =
await getAppWithAccess(
applicationId,
req.user
);


if (!app)
{

return res.status(403).json({

error:
"Access denied"

});

}


///////////////////////////////////////////////////////////////
// CACHE KEY
///////////////////////////////////////////////////////////////

const cacheKey =
`${applicationId}-${from}-${to}`;


const cached =
getCache(cacheKey);

if (cached)
{

return res.json(cached);

}


///////////////////////////////////////////////////////////////
// FETCH ANALYTICS
///////////////////////////////////////////////////////////////

const stats =
await analyticsService
.getApplicationStats({

applicationId,
from,
to

});


const errorRate =
await analyticsService
.getErrorRate({

applicationId,
from,
to

});


///////////////////////////////////////////////////////////////
// FINAL RESPONSE
///////////////////////////////////////////////////////////////

const response =
{

success:true,

range:{
from,
to
},

metrics:
stats.metrics,

summary:
stats.summary,

errorRate

};


///////////////////////////////////////////////////////////////
// CACHE STORE
///////////////////////////////////////////////////////////////

setCache(
cacheKey,
response
);


///////////////////////////////////////////////////////////////

res.json(response);


}
catch(err)
{

console.error(
"Stats error:",
err
);


res.status(500).json({

error:
"Failed to fetch stats"

});

}

}
);


///////////////////////////////////////////////////////////////

module.exports =
router;