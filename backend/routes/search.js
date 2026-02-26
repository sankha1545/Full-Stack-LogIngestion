const express = require("express");
const router = express.Router();

const requireAuth = require("../middlewares/requireAuth");
const searchService = require("../services/search.service");

const prisma = require("../utils/prisma");


/**
 * Access control
 */

async function getAppWithAccess(applicationId, user) {

 if (user.role === "MASTER_ADMIN")
   return prisma.application.findFirst({

     where: {
       id: applicationId,
       deleted: false
     }

   });


 return prisma.application.findFirst({

   where: {

     id: applicationId,

     deleted: false,

     OR: [

       { userId: user.id },

       {
         members: {
           some: {
             userId: user.id
           }
         }
       }

     ]

   }

 });

}



/**
 * GET /api/search/logs
 */

router.get(
 "/logs",
 requireAuth,
 async (req, res) => {

   try {

     const {

       applicationId,

       search,

       limit = 50,

       offset = 0

     } = req.query;


     if (!applicationId)
       return res.status(400).json({

         error:
         "applicationId required"

       });


     const app =
     await getAppWithAccess(
       applicationId,
       req.user
     );


     if (!app)
       return res.status(403).json({

         error:
         "Access denied"

       });



     const result =
     await searchService.searchLogs({

       applicationId,

       search,

       limit:
       Number(limit),

       offset:
       Number(offset)

     });



     res.json({

       success: true,

       ...result

     });


   }

   catch (err) {

     console.error(err);

     res.status(500).json({

       error:
       "Search failed"

     });

   }

 });


module.exports = router;