const mongoose=require("mongoose");
const CatSchema=new mongoose.Schema({
  name:{
    type:String
  },
  description:{
    type:String,
    trim:true
  },
  courses:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Course"
  }]
});
module.exports=mongoose.model("Category",CatSchema);