const sendEmail=require("../utils/sendemail");  
const User=require("../models/User");
const bcrypt=require("bcrypt");
exports.resetPasswordToken=async(req,res)=>{
    /*1)user email from req.body
    2)validations and check for existence
    3)generate krunnga token
    4)update its token and expiry time in user db
    5)url banauga jisme token hoga
    6)email send krdenge with the url
    7)response bhejdenge
    */ 
    try{
        const {email}=req.body;
        if(!email){
            return res.status(400).json({
                success:false,
                message:"Email is required"
            })
        }
        const userexist=await User.findOne({email:email});
        if(!userexist){
            
            return res.status(404).json({
                success:false,
                message:"User not found"
            })
        }
        const token=crypto.randomUUID();
        const updated=await User.findOneAndUpdate({email:email},{
            token:token,
            resetPasswordExpires:Date.now()+5*60*1000 })
        const resetUrl=`http://localhost:3000/resetpassword/${token}`;
        await sendEmail(email,"Password Reset Request",`Click <a href=${resetUrl}>here</a> to reset your password. This link will expire in 5 minutes.`);
        return res.status(200).json({
            success:true,
            message:"Password reset email sent",
            updated
        })
    }
    catch(err){ 
        console.log(err);
        return res.status(500).json({
            success:false,
            message:"Error in sending password reset email"
        }) 
    }

}     
exports.resetPassword=async(req,res)=>{
    /*1)fetch the details token,pswd,confirmpswd
     2)validation
     3)get user details from db using token 
     4)if user not found-inavlid token
     5)check token is valid or not by cheking expiry time
     6)pswd hash
     7)update in db
     8)return response*/
     try{
        const {token,password,confirmPassword}=req.body;
        if(!token || !password || !confirmPassword){
            return res.status(400).json({
                success:false,
                message:"All fields are required"
            })
        }
        if(password!==confirmPassword){
            return res.status(400).json({
                success:false,
                message:"Password and confirm password must be same"
            })
        }
        const user=await User.findOne({token:token});
        if(!user){
            return res.status(404).json({
                success:false,
                message:"Invalid token"
            })
        }
        if(user.resetPasswordExpires<Date.now()){
            return res.status(400).json({
                success:false,
                message:"Token expired"
            })
        }
        let hashpws;
        try{
            hashpws=await bcrypt.hash(password,10);
            const updated=await User.findOneAndUpdate({token:token},{
                password:hashpws},{new:true});
                
            return res.status(200).json({
                success:true,
                message:"Password reset successful",
                updated
            })
        }
        catch(err){
            console.log(err);
            return res.status(500).json({
                success:false,
                message:"Error in hashing password"
            })
        }
    }
        
     
     catch(err){
        console.log(err);
        return res.status(500).json({
            success:false,
            message:"Error in resetting password"
        })
     }
}