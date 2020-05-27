const User = require('../models/user');
const asyncHandler = require('express-async-handler');
const CustomError = require('../helpers/error/CustomError');

const getSingleUser = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const user = await User.findById(id);
    return res.status(200).json({
        success: true,
        data: user
    });
});

const getAllUsers = asyncHandler(async (req, res, next) => {
    return res.status(200).json(res.queryResults);
});

module.exports = { getSingleUser, getAllUsers };