const mongoose=require("mongoose");
const SecSchema=new mongoose.Schema({
  secName:{
    type:String
  },
  subsec:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:"SubSec"
  }]
});
module.exports=mongoose.model("Section",SecSchema);