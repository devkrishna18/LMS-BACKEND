const Section=require("../models/Section");
const SubSec=require("../models/SubSec");
const ThumbnailUpload=require("../utils/cloud")
require("dotenv").config();
exports.CreateSubSec=async(req,res)=>{
    try{
        //fetch details
        const{title,timeDuration,description,sectionId}=req.body;
        //video niakla liya
        const video=req.files.video;
        //validations
        if(!title||!video||!sectionId){
            return res.status(400).json({
                success:false,
                message:"All fields required"
            })
        }
        //cloudinary pr upload
        const videoUrl= await ThumbnailUpload(video,process.env.FOLDER_NAME);
        //create subsec
        const newSubSec=await SubSec.create({
            title,timeDuration,description,additionalUrl,videoUrl:videoUrl.secure_url
        })
        //update subsec ko section me push krna h
            const updatedSection=await Section.findByIdAndUpddate(sectionId,{
                $push:{subSec:newSubSec._id}
                },{new:true}).populate({
                    path:"subsec"
                }).exec();
        console.log(updatedSection)
          //HW - console log the sectiondetails with populated subsec
        return res.status(200).json({
            success:true,
            message:"Sub section created",
            data:newSubSec
        })      
    }
    catch(err){
        return res.status(500).json({
            success:false,
            message:"Error while creating subSection"
            
        })

    }
}
//update subsection
exports.UpdateSubSec=async(req,res)=>{
    try{
        const{title,description,timeDuration,subsecId}=req.body;
        const video=req?.files?.video;
        let updateUrl=NULL;
        if(video){
            updateUrl=await ThumbnailUpload(video,process.env.FOLDER_NAME);
        }
        
        const updateSubSec=await SubSec.findByIdAndUpdate(subsecId,{
            title:title||SubSec.title,
            description:description||SubSec.description,
            timeDuration:timeDuration||SubSec.timeDuration,
            videoUrl:updateUrl?.secure_url||SubSec.videoUrl
        })
        return res.status(200).json({
            success:true,
            message:"Subsection updated successfully"
        })

    }
    catch(err){
        return res.status(500).json({
            success:false,
            message:"Error while updating subSection"
            
        })

    }
}
//delete subsection
exports.DeleteSubSec=async(req,res)=>{
    try{
        const{subsecId}=req.params;
        if(!subsecId){
            return res.status(400).json({
                success:false,
                message:"Subsection id required"
            })
        }
        const deletedSubSec= await SubSec.findByIdAndDelete(subsecId);
        return res.status(200).json({
            success:true,
            message:"Subsection deleted successfully"
        })


    }
    catch(err){
         return res.status(500).json({
            success:false,
            message:"Error while deleting subSection"
            
        })

    }
}