// backend/routes/logs.js

const express = require("express");
const router = express.Router();

const { z } = require("zod");
const crypto = require("crypto");

const prisma = require("../utils/prisma");

const requireAuth =
require("../middlewares/requireAuth");

const analyticsService =
require("../services/analytics.service");

const searchService =
require("../services/search.service");


/* =====================================================
   HELPERS
===================================================== */

function hashApiKey(rawKey)
{

 const secret =
 process.env.API_KEY_SECRET;

 if (!secret)
 throw new Error(
 "API_KEY_SECRET not configured"
 );

 return crypto
 .createHmac(
 "sha256",
 secret
 )
 .update(rawKey)
 .digest("hex");

}



function extractApiKey(req)
{

 const authHeader =
 req.headers.authorization;

 if (
 authHeader?.startsWith(
 "Bearer "
 )
 )
 return authHeader.split(" ")[1];

 return (
 req.headers["x-api-key"]
 ||
 req.query.key
 ||
 null
 );

}



function normalizeLogLevel(level)
{

 if (!level)
 return "INFO";

 return level.toUpperCase();

}



function normalizeEnvironment(env)
{

 if (!env)
 return "DEVELOPMENT";

 return env.toUpperCase();

}



function normalizeTags(tags)
{

 if (!tags)
 return [];

 if (Array.isArray(tags))
 return tags;

 return [String(tags)];

}



/* =====================================================
   ACCESS CONTROL
===================================================== */

async function getAppWithAccess(
 appId,
 user
)
{

 if (
 user.role ===
 "MASTER_ADMIN"
 )
 {

 return prisma.application.findFirst({

 where:
 {
 id: appId,
 deleted: false
 }

 });

 }


 return prisma.application.findFirst({

 where:
 {
 id: appId,
 deleted: false,

 OR:
 [

 { userId: user.id },

 {
 members:
 {
 some:
 {
 userId:
 user.id
 }
 }
 }

 ]

 }

 });

}



/* =====================================================
   VALIDATION
===================================================== */

const LogSchema =
z.object({

 level:
 z.enum(
 ["error","warn","info","debug","fatal"]
 ).optional(),

 message:
 z.string().min(1),

 timestamp:
 z.string().datetime(),

 resourceId:
 z.string().optional(),

 traceId:
 z.string().optional(),

 spanId:
 z.string().optional(),

 commit:
 z.string().optional(),

 service:
 z.string().optional(),

 environment:
 z.enum(
 ["development","staging","production"]
 ).optional(),

 host:
 z.string().optional(),

 version:
 z.string().optional(),

 tags:
 z.array(
 z.string()
 ).optional(),

 metadata:
 z.record(
 z.any()
 ).optional()

});


const IngestSchema =
z.union([
 LogSchema,
 z.array(LogSchema).min(1)
]);


const QuerySchema =
z.object({

 applicationId:
 z.string(),

 level:
 z.string().optional(),

 search:
 z.string().optional(),

 resourceId:
 z.string().optional(),

 from:
 z.string().datetime().optional(),

 to:
 z.string().datetime().optional(),

 traceId:
 z.string().optional(),

 spanId:
 z.string().optional(),

 commit:
 z.string().optional(),

 service:
 z.string().optional(),

 environment:
 z.string().optional(),

 tags:
 z.string().optional(),

 page:
 z.string().optional(),

 limit:
 z.string().optional(),

});



/* =====================================================
   INGEST LOGS
===================================================== */

router.post(
"/ingest",
async (req,res)=>
{

 const apiKey =
 extractApiKey(req);

 if (!apiKey)
 return res.status(401)
 .json({
 error:
 "Missing API key"
 });


 const parsed =
 IngestSchema.safeParse(
 req.body
 );

 if (!parsed.success)
 return res.status(400)
 .json({
 error:
 "Invalid log format"
 });


 try
 {

 const keyHash =
 hashApiKey(apiKey);


 const keyRecord =
 await prisma.apiKey.findFirst({

 where:
 {
 keyHash,
 revoked:false,
 application:
 { deleted:false }
 },

 include:
 {
 application:true
 }

 });


 if (!keyRecord)
 return res.status(401)
 .json({
 error:
 "Invalid API key"
 });



 const logsArray =
 Array.isArray(parsed.data)
 ? parsed.data
 : [parsed.data];



 /* INSERT */

 const createdLogs =
 await prisma.$transaction(

 logsArray.map(
 log=>
 prisma.log.create({

 data:
 {

 applicationId:
 keyRecord.applicationId,

 level:
 normalizeLogLevel(
 log.level
 ),

 message:
 log.message,

 timestamp:
 new Date(
 log.timestamp
 ),

 resourceId:
 log.resourceId,

 traceId:
 log.traceId,

 spanId:
 log.spanId,

 commit:
 log.commit,

 service:
 log.service,

 environment:
 normalizeEnvironment(
 log.environment
 ),

 host:
 log.host,

 version:
 log.version,

 tags:
 normalizeTags(
 log.tags
 ),

 metadata:
 log.metadata

 }

 })
 )

 );



 /* REALTIME */

 const io =
 req.app.get("io");

 if (io)
 {

 createdLogs.forEach(
 log=>
 {

 io.to(
 `app:${keyRecord.applicationId}`
 )
 .emit(
 "new_log",
 log
 );

 });

 }



 /* ANALYTICS */

 await analyticsService
 .aggregateApplicationLogs(
 keyRecord.applicationId
 );



 return res.status(201)
 .json({

 success:true,

 count:
 createdLogs.length

 });

 }

 catch(err)
 {

 console.error(
 "Ingest failed:",
 err
 );

 return res.status(500)
 .json({
 error:
 "Failed to save log"
 });

 }

});



/* =====================================================
   GET LOGS
===================================================== */

router.get(
"/",
requireAuth,
async (req,res)=>
{

 const parsedQuery =
 QuerySchema.safeParse(
 req.query
 );


 if (!parsedQuery.success)
 return res.status(400)
 .json({
 error:
 "Invalid query"
 });


 const
 {
 applicationId,
 page="1",
 limit="50"
 }
 =
 parsedQuery.data;


 try
 {

 const app =
 await getAppWithAccess(
 applicationId,
 req.user
 );


 if (!app)
 return res.status(403)
 .json({
 error:
 "Access denied"
 });



 const pageNum =
 Math.max(
 parseInt(page),
 1
 );


 const limitNum =
 Math.min(
 parseInt(limit),
 200
 );


 const offset =
 (pageNum-1)
 *
 limitNum;



 /* FULL TEXT SEARCH */

 if (parsedQuery.data.search)
 {

 const logs =
 await searchService
 .searchLogs({

 applicationId,

 query:
 parsedQuery.data.search,

 limit:
 limitNum,

 offset

 });


 return res.json({

 page:
 pageNum,

 limit:
 limitNum,

 total:
 logs.length,

 totalPages:1,

 data:logs

 });

 }



 /* NORMAL QUERY */

 const where =
 {

 applicationId

 };


 if (parsedQuery.data.level)
 where.level =
 parsedQuery.data.level
 .toUpperCase();


 if (parsedQuery.data.service)
 where.service =
 parsedQuery.data.service;


 if (parsedQuery.data.environment)
 where.environment =
 parsedQuery.data.environment
 .toUpperCase();


 if (parsedQuery.data.traceId)
 where.traceId =
 parsedQuery.data.traceId;


 if (parsedQuery.data.spanId)
 where.spanId =
 parsedQuery.data.spanId;


 if (parsedQuery.data.commit)
 where.commit =
 parsedQuery.data.commit;


 if (parsedQuery.data.resourceId)
 where.resourceId =
 {
 contains:
 parsedQuery.data.resourceId,
 mode:"insensitive"
 };


 if (parsedQuery.data.from ||
 parsedQuery.data.to)
 {

 where.timestamp={};

 if (parsedQuery.data.from)
 where.timestamp.gte=
 new Date(
 parsedQuery.data.from
 );

 if (parsedQuery.data.to)
 where.timestamp.lte=
 new Date(
 parsedQuery.data.to
 );

 }



 const
 [logs,total]
 =
 await Promise.all([

 prisma.log.findMany({

 where,

 orderBy:
 { timestamp:"desc" },

 skip:
 offset,

 take:
 limitNum

 }),

 prisma.log.count({
 where
 })

 ]);



 return res.json({

 page:
 pageNum,

 limit:
 limitNum,

 total,

 totalPages:
 Math.ceil(
 total/limitNum
 ),

 data:logs

 });


 }
 catch(err)
 {

 console.error(
 "GET logs failed:",
 err
 );


 return res.status(500)
 .json({
 error:
 "Failed to fetch logs"
 });

 }

});



module.exports =
router;