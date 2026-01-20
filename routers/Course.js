// Import the required modules
const express = require("express")
const router = express.Router()

// Import the Controllers

// Course Controllers Import
const {
  createCourse,
  ShowAllCourses,
   getAllCourseDetails,
  getFullCourseDetails ,
     editCourse,
  getInstructorCourses,
  deleteCourse,
} = require("../controllers/course")

const {
  updateCourseProgress
} = require("../controllers/courseProgress");

// Categories Controllers Import
const {
  showCateg,
  createCateg,
  categoryPageDetails,
} = require("../controllers/category")

// Sections Controllers Import
const {
  createSection,
  UpdateSection,
  DeleteSection,
} = require("../controllers/section")

// Sub-Sections Controllers Import
const {
  CreateSubSec,
 UpdateSubSec,
  DeleteSubSec,
} = require("../controllers/subsec")

// Rating Controllers Import
const {
  createRating,
  getAverageRating,
  getAllRating,
} = require("../controllers/RatingAndReview")

// Importing Middlewares
const { auth, isInstructor, isStudent, isAdmin } = require("../middlewares/auth")

// ********************************************************************************************************
//                                      Course routes
// ********************************************************************************************************

// Courses can Only be Created by Instructors
router.post("/createCourse", auth, isInstructor, createCourse)
//Add a Section to a Course
router.post("/addSection", auth, isInstructor, createSection)
// Update a Section
router.post("/updateSection", auth, isInstructor,  UpdateSection)
// Delete a Section
router.post("/deleteSection", auth, isInstructor, DeleteSection)
// Edit Sub Section
router.post("/updateSubSection", auth, isInstructor, UpdateSubSec)
// Delete Sub Section
router.post("/deleteSubSection", auth, isInstructor,DeleteSubSec)
// Add a Sub Section to a Section
router.post("/addSubSection", auth, isInstructor,CreateSubSec)
// Get all Registered Courses
router.get("/getAllCourses",ShowAllCourses)
// Get Details for a Specific Courses
 router.post("/ getAllCourseDetails", getAllCourseDetails)
// Get Details for a Specific Courses
router.post("/getFullCourseDetails", auth, getFullCourseDetails)
// Edit Course routes
router.post("/editCourse", auth, isInstructor, editCourse)
// Get all Courses Under a Specific Instructor
 router.get("/getInstructorCourses", auth, isInstructor, getInstructorCourses)
// Delete a Course
router.delete("/deleteCourse", deleteCourse)
router.post("/updateCourseProgress", auth, isStudent, updateCourseProgress);

// ********************************************************************************************************
//                                      Category routes (Only by Admin)
// ********************************************************************************************************
// Category can Only be Created by Admin
// TODO: Put IsAdmin Middleware here
router.post("/createCategory", auth, isAdmin, createCateg)
router.get("/showAllCategories", showCateg)
router.post("/getCategoryPageDetails", categoryPageDetails)

// ********************************************************************************************************
//                                      Rating and Review
// ********************************************************************************************************
router.post("/createRating", auth, isStudent, createRating)
router.get("/getAverageRating", getAverageRating)
router.get("/getReviews", getAllRating)

module.exports = router