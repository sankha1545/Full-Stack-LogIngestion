const express = require("express");

const router = express.Router();

const prisma = require("../utils/prisma");

const requireAuth =
require("../middlewares/requireAuth");



//////////////////////////////////////////////////////
// CREATE VIEW
//////////////////////////////////////////////////////

router.post(
"/",
requireAuth,
async (req, res) => {

 try {

   const {

     name,

     applicationId,

     filters

   } = req.body;


   const view =
   await prisma.savedView.create({

     data: {

       name,

       applicationId,

       userId:
       req.user.id,

       filters

     }

   });


   res.json(view);


 }

 catch(err){

   res.status(500).json({

     error:
     "Create failed"

   });

 }

});



//////////////////////////////////////////////////////
// GET VIEWS
//////////////////////////////////////////////////////

router.get(
"/:applicationId",
requireAuth,
async (req, res)=>{


 const views =
 await prisma.savedView.findMany({

   where:{

     applicationId:
     req.params.applicationId,

     userId:
     req.user.id

   },

   orderBy:{
     createdAt:"desc"
   }

 });


 res.json(views);


});



//////////////////////////////////////////////////////
// DELETE VIEW
//////////////////////////////////////////////////////

router.delete(
"/:id",
requireAuth,
async (req,res)=>{


 await prisma.savedView.delete({

   where:{
     id:req.params.id
   }

 });


 res.json({

   success:true

 });


});


module.exports = router;