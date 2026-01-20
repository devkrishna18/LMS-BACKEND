const User=require("../models/User");
const Course=require("../models/Course");
const RatingAndReview=require("../models/RatingAndReview");
const { default: mongoose } = require("mongoose");

//create rating and review
exports. createRating=async(req,res)=>{
    try{
        //fetch userid
        const userId=req.user.id;
        //fetch details
        const{rating,review,courseId}=req.body;
        //check if student is enrolled or not and  course exists or not 
        const courseDetails=await Course.findOne({
                    _id:courseId,studentsEnrolled:{$elemMatch:{$eq:userId}}
        });
        if(!courseDetails){
            return res.status(404).json({
                success:false,
                message:"Student not enrolled in Course"
            })
        }
        //check if already reviewed
        const userAlreadyReview=await RatingAndReview.findOne({
            user:userId,course:courseId //doubt
        })
        if(userAlreadyReview){
              return res.status(404).json({
                success:false,
                message:"Student already reviewed Course"
            })
        }
        //create the rating and review
        const ratingreview=await RatingAndReview.create({
            rating,review,course:courseId,user:userId
        });
        //update the review in the respective course
        const updatedCourseDetails = await Course.findByIdAndUpdate({_id:courseId},
                                    {
                                        $push: {
                                            ratingAndReviews: ratingreview._id,
                                        }
                                    },
                                    {new: true});
        console.log(updatedCourseDetails);
        return res.status(200).json({
            success:true,
            message:"Rating and Review created Successfully",
            ratingreview,
        })

    }
    catch(error){
         console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }
}
//getting average rating
exports.getAverageRating=async(req,res)=>{
    try{
        //get course id
        const courseId=req.body.courseId;//kaha se aa rhi h??
        //cal avg rating
        const result=await RatingAndReview.aggregate([
            {$match:{
                course:new mongoose.Types.ObjectId(courseId)
            }},
            {
                $group:{
                    _id:null,
                    averageRating:{$avg:rating}
                }
            }
        ])
      if (result.length>0) {
            return res.status(200).json({
                success:true,
                message:'Avg rating recived for the course',
                averageRating: result[0].averageRating
            })
        }
        return res.status(200).json({
            success:true,
            message:'Average Rating is 0, no ratings given till now',
            averageRating:0,
        })
    }
    catch(error){
          console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }
}

exports.getAllRating = async (req, res) => {
    try{
            const allReviews = await RatingAndReview.find({})
                                    .sort({rating: "desc"})
                                    .populate({
                                        path:"user",
                                        select:"firstName lastName email image",
                                    })
                                    .populate({
                                        path:"course",
                                        select: "courseName",
                                    })
                                    .exec();
            return res.status(200).json({
                success:true,
                message:"All reviews fetched successfully",
                data:allReviews,
            });
    }   
    catch(error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    } 
}

