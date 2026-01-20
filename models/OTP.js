const mongoose=require("mongoose");
const sendEmail=require("../utils/sendemail");
const emailTemplate = require("../mail/templates/emailVerificationTemplate");
const OTPSchema=new mongoose.Schema({
    email:{
        type:String,
        required:true
    },
    otp:{
        type:String,
        required:true,
    },
    createdAt:{
        type:Date,
        default:Date.now,
        expires:300 // 5 minutes
    }

});
//function to send email
async function emailVerification(email,otp){
    try{
         const response=await sendEmail(email,"Email Verification",emailTemplate(otp));
            console.log("email sent successfully",response);
    }
    catch(err){
        console.log("error occured at email verification",err);
    }
}
//pre save hook
OTPSchema.pre("save",async function(next){
        await emailVerification(this.email,this.otp);
        next();
})

module.exports=mongoose.model("OTP",OTPSchema);