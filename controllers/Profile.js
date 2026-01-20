const Profile=require("../models/Profile");
const User=require("../models/User");
const CourseProgress=require("../models/CourseProgress")
const convertSecondsToDuration = require("../utils/secToDuration")
const{ThumbnailUpload}=require("../utils/cloud");
exports.updateProfile = async (req,res) =>{
    try {
        
        const {dateOfBirth="", gender, about="", contactNumber } = req.body;
        
        const userId = req.user.id

        if(!contactNumber || !gender ) {
            return res.status(400).json({
                success:false,
                message:'All fields are required',
            });
        }

        const userDetails = await User.findById(userId);
        const profileId = userDetails.addDetails;

        const updatedProfile = await Profile.findByIdAndUpdate(profileId, {dateOfBirth, gender, about, contactNumber}, {new:true});
        const updatedUserDetails = await User.findById(userId).populate("addDetails").exec();
        return res.status(200).json({
            success:true,
            message:'Profile updated successfully',
            updatedUserDetails
        })   
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success:false,
            message:'Failed to update profile',
            error: error.message,
        })
    }
}

exports.getAllUserDetails = async (req, res) => {

    try {
        //get id
        const id = req.user.id;

        //validation and get user details
        const userDetails = await User.findById(id).populate("addDetails").exec();
        //return response
        return res.status(200).json({
            success:true,
            message:'User Data Fetched Successfully',
            userDetails
        });
       
    }
    catch(error) {
        return res.status(500).json({
            success:false,
            message:error.message,
        });
    }
}

exports.updateDisplayPicture = async (req, res) => {
    try {
      const displayPicture = req.files.displayPicture
      const userId = req.user.id
      const image = await ThumbnailUpload(
        displayPicture,
        process.env.FOLDER_NAME,
        1000,
        1000
      )
      console.log(image)
      const updatedProfile = await User.findByIdAndUpdate(
        { _id: userId },
        { image: image.secure_url },
        { new: true }
      )
      res.send({
        success: true,
        message: `Image Updated successfully`,
        data: updatedProfile,
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      })
    }
};
  
exports.getEnrolledCourses = async (req, res) => {
    try {
      const userId = req.user.id
      let userDetails = await User.findOne({
        _id: userId,
      })
      .populate({
        path: "courses",
        populate: {
        path: "courseContent",
        populate: {
          path: "subsec",
        },
        },
      })
      .exec()

    userDetails = userDetails.toObject();
	  var SubsectionLength = 0; //to find total no. of videos each course has
	  for (var i = 0; i < userDetails.courses.length; i++){
  //courses=[courseid1,courseid2,.....]
		let totalDurationInSeconds = 0 //total length or duration of the course videos
		SubsectionLength = 0
		for (var j = 0; j < userDetails.courses[i].courseContent.length; j++) {
      //courses[i] is courseid1=[coursecontent1(section),coursecontent2(section),...]
      //coursecontent1(section)=subsec:{{ _id: "subsec1", title: "Intro to HTML", timeDuration: "300"},....}
		  totalDurationInSeconds += userDetails.courses[i].courseContent[
			j
		  ].subsec.reduce((acc, curr) => acc + parseInt(curr.timeDuration), 0)
      //.reduce()→ poore array ka sum nikalne ke liye
		  userDetails.courses[i].totalDuration = convertSecondsToDuration(
			totalDurationInSeconds
		  )
		  SubsectionLength +=
			userDetails.courses[i].courseContent[j].subsec.length
		}
		let courseProgressCount = await CourseProgress.findOne({
		  courseID: userDetails.courses[i]._id,
		  userId: userId,
		})
		courseProgressCount = courseProgressCount?.completedVideos.length
		if (SubsectionLength === 0) {
		  userDetails.courses[i].progressPercentage = 100
		} else {
		  // To make it up to 2 decimal point
		  const multiplier = Math.pow(10, 2)
		  userDetails.courses[i].progressPercentage =
			Math.round(
			  (courseProgressCount / SubsectionLength) * 100 * multiplier
			) / multiplier
		}
	  }

      if (!userDetails) {
        return res.status(400).json({
          success: false,
          message: `Could not find user with id: ${userDetails}`,
        })
      }
      return res.status(200).json({
        success: true,
        data: userDetails.courses,
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      })
    }
};
exports.deleteAccount = async (req,res) =>{
    try {
        // const {user} = req.body
        const userId = req.user.id

        //vallidation not neccessary but still doing
        const userDetails = await User.findById(userId);
        // if(!userDetails) {
        //     return res.status(404).json({
        //         success:false,
        //         message:'User not found',
        //     });
        // }         

        await Profile.findByIdAndDelete({_id:userDetails.addDetails});

        //TOOD: HW unenroll user form all enrolled courses
        //delete user
        await User.findByIdAndDelete({_id:userId});

        return res.status(200).json({
            success:true,
            message:'User deleted successfully',
        })   
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success:false,
            message:'Failed to delete User',
            error: error.message,
        })
    }
}
// userDetails = {
//   _id: "user123",
//   firstName: "Krishna",
//   courses: [
//     {
//       _id: "courseA",
//       courseName: "Web Development 101",
//       courseContent: [
//         {
//           _id: "section1",
//           secName: "HTML Basics",
//           subsec: [
//             { _id: "subsec1", title: "Intro to HTML", timeDuration: "300" },
//             { _id: "subsec2", title: "HTML Tags", timeDuration: "600" }
//           ]
//         },
//         {
//           _id: "section2",
//           secName: "CSS Fundamentals",
//           subsec: [
//             { _id: "subsec3", title: "CSS Selectors", timeDuration: "900" }
//           ]
//         }
//       ]
//     }
//   ]
// }
