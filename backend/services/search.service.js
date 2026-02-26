/**
 * ============================================================
 * LogScope Industrial Search Engine
 * ============================================================
 *
 * Features:
 *
 * • Ranked search
 * • Full-text search
 * • Multi-tenant safe
 * • Pagination
 * • Filters
 * • Production safe
 *
 */

const prisma = require("../utils/prisma");


/**
 * Full industrial search
 */

async function searchLogs({

 applicationId,

 search,

 level,

 resourceId,

 traceId,

 spanId,

 from,

 to,

 limit = 50,

 offset = 0

}) {

 ///////////////////////////////////////////////////////////
 // SAFETY
 ///////////////////////////////////////////////////////////

 if (!applicationId)
   throw new Error("applicationId required");


 if (!search)
   return {

     logs: [],

     total: 0,

   };


 ///////////////////////////////////////////////////////////
 // BUILD QUERY
 ///////////////////////////////////////////////////////////

 const where = [];

 const params = [];


 ///////////////////////////////////////////////////////////
 // TENANT FILTER
 ///////////////////////////////////////////////////////////

 params.push(applicationId);

 where.push(`"applicationId" = $${params.length}`);


 ///////////////////////////////////////////////////////////
 // SEARCH PARAM
 ///////////////////////////////////////////////////////////

 params.push(search);

 const searchIndex = params.length;


 where.push(

 `searchVector @@ plainto_tsquery('english', $${searchIndex})`

 );


 ///////////////////////////////////////////////////////////
 // OPTIONAL FILTERS
 ///////////////////////////////////////////////////////////

 if (level) {

   params.push(level.toUpperCase());

   where.push(`level = $${params.length}`);

 }


 if (resourceId) {

   params.push(`%${resourceId}%`);

   where.push(`"resourceId" ILIKE $${params.length}`);

 }


 if (traceId) {

   params.push(traceId);

   where.push(`"traceId" = $${params.length}`);

 }


 if (spanId) {

   params.push(spanId);

   where.push(`"spanId" = $${params.length}`);

 }


 if (from) {

   params.push(from);

   where.push(`timestamp >= $${params.length}`);

 }


 if (to) {

   params.push(to);

   where.push(`timestamp <= $${params.length}`);

 }


 ///////////////////////////////////////////////////////////
 // PAGINATION PARAMS
 ///////////////////////////////////////////////////////////

 params.push(limit);

 const limitIndex = params.length;


 params.push(offset);

 const offsetIndex = params.length;


 ///////////////////////////////////////////////////////////
 // FINAL QUERY
 ///////////////////////////////////////////////////////////

 const query = `

 SELECT

 *,

 ts_rank(

 searchVector,

 plainto_tsquery('english', $${searchIndex})

 ) AS rank

 FROM "Log"

 WHERE

 ${where.join(" AND ")}

 ORDER BY

 rank DESC,

 timestamp DESC

 LIMIT $${limitIndex}

 OFFSET $${offsetIndex}

 `;


 ///////////////////////////////////////////////////////////
 // EXECUTE
 ///////////////////////////////////////////////////////////

 const logs =
   await prisma.$queryRawUnsafe(

     query,

     ...params

   );


 ///////////////////////////////////////////////////////////
 // COUNT QUERY
 ///////////////////////////////////////////////////////////

 const countQuery = `

 SELECT COUNT(*)

 FROM "Log"

 WHERE

 ${where.join(" AND ")}

 `;


 const countResult =
   await prisma.$queryRawUnsafe(

     countQuery,

     ...params.slice(
       0,
       searchIndex
     )

   );


 const total =
   Number(
     countResult[0].count
   );


 ///////////////////////////////////////////////////////////
 // RETURN
 ///////////////////////////////////////////////////////////

 return {

   logs,

   total,

 };

}


module.exports = {

 searchLogs,

};