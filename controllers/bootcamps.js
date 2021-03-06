const Bootcamp = require('../models/Bootcamp');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const geocoder = require('../utils/geocoder');

const path = require('path');

// @desc 		Get all bootcamps
// @route 	GET /api/v1/bootcamps
// @access	Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc 		Get a bootcamp
// @route 	GET /api/v1/bootcamps/:id
// @access	Public
exports.getBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    // return to avoid 'headers already sent' error
    // Wrong ID
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({ success: true, data: bootcamp });
});

// @desc 		Create a bootcamp
// @route 	POST /api/v1/bootcamps
// @access	Private
exports.createBootcamp = asyncHandler(async (req, res, next) => {
  // Add user to req.body
  // req.user populated by middleware auth.js 
  // req.body === json body sent in Postman
  req.body.user = req.user.id;

  // Check for published bootcamp
  const publishedBootcamp = await Bootcamp.findOne({ user: req.user.id });

  // Non-admins can only add 1 bootcamp
  if (publishedBootcamp && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User with ID ${req.user.id} has already published a bootcamp`,
        400
      )
    );
  }

  const bootcamp = await Bootcamp.create(req.body);

  res.status(201).json({
    success: true,
    data: bootcamp,
  });
});

// @desc 		Update a bootcamp
// @route 	PUT /api/v1/bootcamps/:id
// @access	Private
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
  let bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
  }

  // Ensure user is bootcamp owner
  if (bootcamp.user.toString() !== req.user.id && req.user !== 'admin') {
    return next(
      new ErrorResponse(
        `User id of ${req.params.id} not authorized to update this bootcamp`,
        401
      )
    );
  }

  bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true, // Run mongoose validators
  });

  res.status(200).json({ success: true, data: bootcamp });
});

// @desc 		Delete a bootcamp
// @route 	GET /api/v1/bootcamps/:id
// @access	Private
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
  }

  // Ensure user is bootcamp owner
  if (bootcamp.user.toString() !== req.user.id && req.user !== 'admin') {
    return next(
      new ErrorResponse(
        `User id of ${req.params.id} not authorized to delete this bootcamp`,
        401
      )
    );
  }

  bootcamp.remove();

  res.status(200).json({ success: true, data: {} });
});

// @desc 		Get bootcamps within a specified radius
// @route 	GET /api/v1/bootcamps/radius/:zipcode/:distance
// @access	Private
exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
  const { zipcode, distance } = req.params;

  // Get lat/lng from geocoder
  const loc = await geocoder.geocode(zipcode);
  const lat = loc[0].latitude;
  const lng = loc[0].longitude;

  // Calculate radius using radians
  // Divide distance by radius of Earth
  // Radius of Earth = 3963mi / 6378km
  const radius = distance / 3963;

  const bootcamps = await Bootcamp.find({
    location: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  res
    .status(200)
    .json({ success: true, count: bootcamps.length, data: bootcamps });
});

// @desc 		Upload photo for bootcamp
// @route 	PUT /api/v1/bootcamps/:id/photo
// @access	Private
exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
  }

  if (!req.files) {
    return next(new ErrorResponse('Please upload a file', 400));
  }

  const file = req.files.file;
  // Make sure image is a photo
  if (!file.mimetype.startsWith('image'))
    return next(new ErrorResponse('Please upload a image file', 400));
  // Check file size
  if (file.size > process.env.MAX_FILE_UPLOAD) {
    return next(
      new ErrorResponse(
        `Please upload an image < ${
          process.env.MAX_FILE_UPLOAD / 1000000
        } Bytes`,
        400
      )
    );
  }

  // Create custom filename
  file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;
  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
    if (err) {
      console.error(err);

      return next(new ErrorResponse('Problem with file upload', 500));
    }

    await Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name });

    res.status(200).json({
      success: true,
      data: file.name,
    });
  });
});
