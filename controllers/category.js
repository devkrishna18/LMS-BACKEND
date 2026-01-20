const Category=require("../models/Category");
const Course = require('../models/Course')
//COURSE handler se phele category create krna hoga
function getRandomInt(max){
   return Math.floor(Math.random()*max)
}
exports.createCateg=async(req,res)=>{
    try{
        const{name,description}=req.body;
        if(!name||!description){
            return res.status(400).json({
                success:false,
                message:"All fields requires"
            })
        }
        //db me entry
        const createdCateg=await Category.create({name:name,description:description});
        console.log(createdCateg);
        return res.status(200).json({
            success:true,
            message:"TAG created successfully",
            createdCateg
        })

    }
    catch(err){
        console.log(err);
        return res.status(500).json({
            success:false,
            message:"ERROR WHILE CREATING TAG"
        })

    }
}
//get allTags handller
exports.showCateg=async(req,res)=>{
    try{
        const Categdetails=await Category.find({},{name:true,description:true});
        return res.status(200).json({
            success:true,
            message:"Details fetched successfully",
            Categdetails
        })

    }
    catch(err){
        console.log(err);
        return res.status(500).json({
            success:false,
            message:"ERROR WHILE SHOWING TAG DETAILS"
        })
    }
}
exports.categoryPageDetails=async(req,res)=>{
    try{
        const{categoryId}=req.body;
        //showed all the courses under selected category
        const selectedCourses=await Category.findById(categoryId)
        .populate(
            {
                path:'courses',
                match:{status:"Published"},
                populate:'ratingandreviews'
            }
        ).exec();
              if (!selectedCourses) {
        console.log("Category not found.")
        return res
          .status(404)
          .json({ success: false, message: "Category not found" })
      }
      // Handle the case when there are no courses
      if (selectedCourses.courses.length === 0) {
        console.log("No courses found for the selected category.")
        return res.status(404).json({
          success: false,
          message: "No courses found for the selected category.",
        })
      }
        //find other category than selected
        const categoriesExceptSelected=await Category.find({
            _id:{$ne:categoryId},//category rather than selected 
            courses:{$not:{$size:0}}//its size should not be zero i.e. atleast one course
        })
        console.log("categoriesExceptSelected", categoriesExceptSelected)
//finding the random diff course from the array of not selected category and then populate
        let differentCourses = await Category.findOne(
        categoriesExceptSelected[getRandomInt(categoriesExceptSelected.length)]
          ._id
      )
        .populate({
          path: "course",
          match: { status: "Published" },
          populate: "ratingAndReviews",
        })
        .exec()
// Get top-selling courses across all categories
 const mostSellingCourses = await Course.find({ status: 'Published' })
      .sort({ "studentsEnrolled.length": -1 }).populate("ratingAndReviews") // Sort by studentsEnrolled array length in descending order
      .exec();

        res.status(200).json({
			selectedCourses: selectedCourses,
			differentCourses: differentCourses,
			mostSellingCourses,
            name: selectedCourses.name,
            description: selectedCourses.description,
            success:true
		})
    } catch (error) {
        return res.status(500).json({
			success: false,
			message: "Internal server error",
			error: error.message,
		});
    }
}