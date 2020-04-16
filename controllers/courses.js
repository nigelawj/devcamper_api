const Course = require('../models/Course');
const Bootcamp = require('../models/Bootcamp');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc 		Get courses
// @route 	GET /api/v1/courses
// @route		GET /api/v1/bootcamps/:bootcampID/courses
// @access	Public
exports.getCourses = asyncHandler(async (req, res, next) => {
  if (req.params.bootcampID) {
    const courses = await Course.find({ bootcamp: req.params.bootcampID });

    return res.status(200).json({
      success: true,
      count: courses.length,
      data: courses,
    });
  } else {
    res.status(200).json(res.advancedResults);
  }
});

// @desc 		Get a single course
// @route 	GET /api/v1/courses/:id
// @access	Public
exports.getCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id).populate({
    path: 'bootcamp',
    select: 'name description',
  });

  if (!course) {
    return next(
      new ErrorResponse(`Course with id ${req.params.id} does not exist`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: course,
  });
});

// @desc 		Add a course
// @route 	POST /api/v1/bootcamps/:bootcampID/courses
// @access	Private
exports.addCourse = asyncHandler(async (req, res, next) => {
  // manually put inside req.body to be fed into course creation
  req.body.bootcamp = req.params.bootcampID;

  const bootcamp = await Bootcamp.findById(req.params.bootcampID);

  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp with id ${req.params.id} does not exist`, 404)
    );
  }

  const course = await Course.create(req.body);

  res.status(200).json({
    success: true,
    data: course,
  });
});

// @desc 		Update a course
// @route 	PUT /api/v1/courses/:id
// @access	Private
exports.updateCourse = asyncHandler(async (req, res, next) => {
  let course = await Course.findById(req.params.id);

  if (!course) {
    return next(
      new ErrorResponse(`Course with id ${req.params.id} does not exist`, 404)
    );
  }

  course = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: course,
  });
});

// @desc 		Delete a course
// @route 	DELETE /api/v1/courses/:id
// @access	Private
exports.deleteCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return next(
      new ErrorResponse(`Course with id ${req.params.id} does not exist`, 404)
    );
  }

  await course.remove();

  res.status(200).json({
    success: true,
    data: {},
  });
});
