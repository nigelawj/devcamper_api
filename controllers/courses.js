const Course = require('../models/Course');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc 		Get courses
// @route 	GET /api/v1/courses
// @route		GET /api/v1/bootcamps/:bootcampID/courses
// @access	Public
exports.getCourses = asyncHandler(async (req, res, next) => {
  let query;

  if (req.params.bootcampID) {
    query = Course.find({ bootcamp: req.params.bootcampID });
  } else {
		query = Course.find();
	}

	const courses = await query;
});
