const express =
require("express");

const router =
express.Router();

const prisma =
require("../utils/prisma");

const requireAuth =
require("../middlewares/requireAuth");



//////////////////////////////////////////////////////
// CREATE ALERT
//////////////////////////////////////////////////////

router.post("/",

requireAuth,

async(req,res)=>{


 const alert =
 await prisma.alertRule.create({

 data:{

 ...req.body,

 userId:
 req.user.id

 }

 });


 res.json(alert);


});



//////////////////////////////////////////////////////
// GET ALERTS
//////////////////////////////////////////////////////

router.get("/:applicationId",

requireAuth,

async(req,res)=>{


 const alerts =
 await prisma.alertRule.findMany({

 where:{

 applicationId:
 req.params.applicationId

 }

 });


 res.json(alerts);


});


module.exports=router;