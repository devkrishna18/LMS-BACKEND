const Category=require("../models/Category");
const Course=require("../models/Course");
const User=require("../models/User");
const Section=require("../models/Section")
const SubSection=require("../models/SubSec")
const CourseProgress=require("../models/CourseProgress")
require("dotenv").config();
const{ThumbnailUpload}=require("../utils/cloud");
const convertSecondsToDuration = require("../utils/secToDuration")
//create course
exports.createCourse=async(req,res)=>{
    try{
        //fecth details
        const{courseName,description,WhatYouWillLearn,price,tag,category}=req.body;
        const thumbnail=req.files.thumbnailimg;
        //validations
        if(!courseName||!description||!WhatYouWillLearn||!price||!thumbnail||!tag){
            return res.status(400).json({
                success:false,
                message:"all fields are required"
            })
        }
        //instructor
        const userId=req.user.id;//decode wala payload me id pass kr rakhi h and 
        // agar koi user course create krega then wo already login hoga to yeha se  
        //instrucotor ki jarurat?kykuki course wale schema me instructor ki object id pass krni h
        if(userId.accountType!="Instructor"){
            return res.status(403).json({
                success:false,
                message:"Instructor is allowed to create course"
            })
        }
        const instructorDetails=await User.findById(userId);
        console.log(instructorDetails);
        if(!instructorDetails){
            return res.status(404).json({
                success:false,
                message:"Instructor details not found"
            })
        }
        //CAtEgORY validation
        const CatDetails=await Category.findById(category);//category is id as in course schema its type is of objectId
        if(!CatDetails){
            return res.status(404).json({
                success:false,
                message:"CATEGORY details not found"
            })
        }
        //thumbnail upload
        const thumbnailUrl=await ThumbnailUpload(thumbnail,process.env.FOLDER_NAME);
        //db me entry
        const CreatedCourse=await Course.create({
            courseName:courseName,
            description:description,
            instructor:instructorDetails._id,
            category:CatDetails._id,
            tag:tag,
            price:price,
            thumbnail:thumbnailUrl.secure_url,
            WhatYouWillLearn:WhatYouWillLearn
        })
        //add the new course into instructor course list
        await User.findByIdAndUpdate(instructorDetails._id,{
            $push:{
                courses:CreatedCourse._id
            }
        })
        return res.status(200).json({
            success:"true",
            message:"Course created successfully"
            ,CreatedCourse
        })
    }
    catch(err){
        console.log(err);
        return res.status(500).json({
            success:false,
            message:"Error while creating course"
        })
    }
}
//get all course
exports.ShowAllCourses=async(req,res)=>{
    try{
        const allCourses=await Course.find({},{courseName:true,description:true,
            price:true,thumbnail:true,instructor:true}).populate("instructor").exec();//why we are showing instruc details
        return res.status(200).json({
            success:true,
            message:"All courses showing",
            allCourses
        })

    }
    catch(err){
        console.log(err);
        return res.status(500).json({
            success:false,
        })

    }
}
//get INFO of a course in detail
exports.getAllCourseDetails=async(req,res)=>{
    try{
        const{courseId}=req.body;
        if(!courseId){
            return res.status(400).json({
                success:false,
                message:"Course id not found"
            })
        }
        const courseDetails=await Course.findById({courseId})
        .populate({
            path:"instructor",
            populate:{
                path:"addDetails"
            }
        })
        .populate("category")
        .populate("ratingandreviews")
        .populate({
           path: "courseContent",  
                 populate: {
                   path: "subsec"
                }
             })
        .exec()
        if(!courseDetails){
            return res.status(400).json({
                success:false,
                message:"Course details not found"
            })
        }
             let totalDurationInSeconds = 0
    courseDetails.courseContent.forEach((content) => {
      content.subsec.forEach((subSection) => {
        const timeDurationInSeconds = parseInt(subSection.timeDuration)
        totalDurationInSeconds += timeDurationInSeconds
      })
    })

    const totalDuration = convertSecondsToDuration(totalDurationInSeconds)
        //return response
        return res.status(200).json({
            success:true,
            message:"Course Details fetched successfully",
            data:{courseDetails,
              totalDuration
            },
        })

    }
    catch(error){
        console.log(error)
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

exports.editCourse = async (req, res) => {
    try {
      const { courseId } = req.body
      const updates = req.body
      const course = await Course.findById(courseId)
  
      if (!course) {
        return res.status(404).json({ error: "Course not found" })
      }
  
      // If Thumbnail Image is found, update it
      if (req.files) {
        console.log("thumbnail update")
        const thumbnail = req.files.thumbnailimg
        const thumbnailImage = await ThumbnailUpload(
          thumbnail,
          process.env.FOLDER_NAME
        )
        course.thumbnail = thumbnailImage.secure_url
      }
//   const allowedFields=["courseName","description","WhatYouWillLearn","price",""]
      // Update only the fields that are present in the request body
      for (const key in updates) {
        if (updates.hasOwnProperty(key)) {
          course[key] = updates[key]
          // if (key === "tag" || key === "instructions") {
          //   course[key] = JSON.parse(updates[key])
          // } else {
          //   course[key] = updates[key]
          // }
        }
      }
  
      await course.save()
  
      const updatedCourse = await Course.findOne({
        _id: courseId,
      })
        .populate({
          path: "instructor",
          populate: {
            path: " addDetails", 
          },
        })
        .populate("category")
        .populate("ratingandreviews")
        .populate({
          path: "courseContent",
          populate: {
            path: "subsec",
          },
        })
        .exec()
  
      res.json({
        success: true,
        message: "Course updated successfully",
        data: updatedCourse,
      })
    } catch (error) {
      console.error(error)
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      })
    }
  }
exports.getFullCourseDetails = async (req, res) => {
    try {
      const { courseId } = req.body
      const userId = req.user.id
      const courseDetails = await Course.findOne({
        _id: courseId,
      })
        .populate({
          path: "instructor",
          populate: {
            path: " addDetails",
          },
        })
        .populate("category")
        .populate("ratingandreviews")
        .populate({
          path: "courseContent",
          populate: {
            path: "subsec",
          },
        })
        .exec()
  
      let courseProgressCount = await CourseProgress.findOne({
        courseID: courseId,
        userId: userId,
      })
  
      console.log("courseProgressCount : ", courseProgressCount)
  
      if (!courseDetails) {
        return res.status(400).json({
          success: false,
          message: `Could not find course with id: ${courseId}`,
        })
      }
  
      // if (courseDetails.status === "Draft") {
      //   return res.status(403).json({
      //     success: false,
      //     message: `Accessing a draft course is forbidden`,
      //   });
      // }
  
      let totalDurationInSeconds = 0
      courseDetails.courseContent.forEach((content) => {
        content.subsec.forEach((subSection) => {
          const timeDurationInSeconds = parseInt(subSection.timeDuration)
          totalDurationInSeconds += timeDurationInSeconds
        })
      })
  
      const totalDuration = convertSecondsToDuration(totalDurationInSeconds)
  
      return res.status(200).json({
        success: true,
        data: {
          courseDetails,
          totalDuration,
          completedVideos: courseProgressCount?.completedVideos
            ? courseProgressCount?.completedVideos
            : [],
        },
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      })
    }
  }
   // Get a list of Course for a given Instructor
  exports.getInstructorCourses = async (req, res) => {
    try {
      // Get the instructor ID from the authenticated user or request body
      const instructorId = req.user.id
  
      // Find all courses belonging to the instructor
      const instructorCourses = await Course.find({
        instructor: instructorId,
      }).sort({ createdAt: -1 }).populate({
        path: "courseContent",
        populate: {
          path: "subsec",
        },
      })
      .exec()
  
      // Return the instructor's courses
      res.status(200).json({
        success: true,
        data: instructorCourses,
      })
    } catch (error) {
      console.error(error)
      res.status(500).json({
        success: false,
        message: "Failed to retrieve instructor courses",
        error: error.message,
      })
    }
}
// Delete the Course
  exports.deleteCourse = async (req, res) => {
    try {
      const { courseId } = req.body
  
      // Find the course
      const course = await Course.findById(courseId)
      if (!course) {
        return res.status(404).json({ message: "Course not found" })
      }
  
      // Unenroll students from the course
      const studentsEnrolled = course.studentsEnrolled
      for (const studentId of studentsEnrolled) {
        await User.findByIdAndUpdate(studentId, {
          $pull: { courses: courseId },
        })
      }
  
      // Delete sections and sub-sections
      const courseSections = course.courseContent
      for (const sectionId of courseSections) {
        // Delete sub-sections of the section
        const section = await Section.findById(sectionId)
        if (section) {
          const subSections = section.subSection
          for (const subSectionId of subSections) {
            await SubSection.findByIdAndDelete(subSectionId)
          }
        }
  
        // Delete the section
        await Section.findByIdAndDelete(sectionId)
      }
      

      // Delete the course
      await Course.findByIdAndDelete(courseId)
  
      return res.status(200).json({
        success: true,
        message: "Course deleted successfully",
      })
    } catch (error) {
      console.error(error)
      return res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      })
    }
  }