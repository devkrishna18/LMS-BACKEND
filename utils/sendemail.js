const nodemailer=require("nodemailer");
require("dotenv").config();
async function sendEmail(email,subject,body){
    try{
        const transporter=nodemailer.createTransport({
            host:process.env.MAIL_HOST,
             port: 465,
            secure: true,
            auth:{
                user:process.env.MAIL_USER,
                pass:process.env.MAIL_PASS
            } 
    })
   let info= await transporter.sendMail({
        from:"StudyNation",
        to:`${email}`,
        subject:`${subject}`,
        html:`${body}`
    })
    return info;

}
catch(err){
    console.log(err);
}
}
module.exports=sendEmail;