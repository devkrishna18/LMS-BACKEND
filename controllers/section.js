const Section=require("../models/Section");
const Course=require("../models/Course");
exports.createSection=async(req,res)=>{
    try{
        //fetch details
        const{secName,courseId}=req.body;
        //validation
        if(!secName||!courseId){
            return res.status(400).json({
                success:false,
                message:"All details required"
            })
        }
        //new section create kr diya
        const newSection=await Section.create({secName});
        //course ke andar new section ki object id courseContent ke under update kr diya
        const updatedCourseDetails=await Course.findByIdAndUpdate(courseId,{
            $push:{courseContent:newSection._id}
        },{new:true}).populate({
            path:"courseContent",
            populate:{
                path:"SubSec"
            }
        }).exec();
        //HW-use populate to replace sec/subsec both in updateCourseDetails
        console.log(updatedCourseDetails)
        return res.status(200).json({
            success:true,
            message:"Section created",
            data:updatedCourseDetails
        })

    }
    catch(err){
        return res.status(500).json({
            success:false,
            message:"Error while creating section"
        })

    }
}
exports.UpdateSection=async(req,res)=>{
    //section update krne ke baad i dont have to update course as sectionId will be same
    try{
        //fetch details
        const{secName,sectionId}=req.body;
        //validation
         if(!secName||!sectionId){
            return res.status(400).json({
                success:false,
                message:"All details required"
            })
        }
        const updatedSecton=await Section.findByIdAndUpdate(sectionId,{secName},{new:true})
        return res.status(200).json({
            success:true,
            message:"Section updated Successfully"
        })
    }
    catch(err){
         return res.status(500).json({
            success:false,
            message:"Error while updating section"
        })
    }
}
exports.DeleteSection=async(req,res)=>{
    try{
        //router me aise /deletesection/:sectionId <= paramter pass kiya h
        const{sectionId}=req.params;
          if(!sectionId){
            return res.status(400).json({
                success:false,
                message:"All details required"
            })
        }
        const deletedSection=await Section.findByIdAndDelete(sectionId);
        //TODO-do we need to  delete the entry from courseSchema also?
        return res.status(200).json({
            success:true,
            message:"Section deleted Successfully"
        })
    }
    catch(err){
         return res.status(500).json({
            success:false,
            message:"Error while deleting section"
        })

    }
}