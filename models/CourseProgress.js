const mongoose=require("mongoose");
const ProgSchema=new mongoose.Schema({
  courseId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Course"
  },
   userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
  completedVideos:[{ 
    type:mongoose.Schema.Types.ObjectId,
    ref:"SubSec"   
  }]
});
module.exports=mongoose.model("CourseProgress",ProgSchema);