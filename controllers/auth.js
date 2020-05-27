const User = require('../models/user');
const asyncHandler = require('express-async-handler');
const { sendJwtToClient } = require('../helpers/authorization/tokenHelpers');
const { validateUserInput, comparePassword } = require('../helpers/input/inputHelpers');
const CustomError = require('../helpers/error/CustomError');
const sendEmail = require('../helpers/libraries/sendEmail');

const register = asyncHandler(async (req, res, next) => {

    const { name, email, password, role } = req.body;

    const user = await User.create({
        name,
        email,
        password,
        role
    });

    sendJwtToClient(user, res);
});

const login = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;
    if (!validateUserInput(email,password)) {
        return next(new CustomError("Please check your inputs", 400));
    }
    const user = await User.findOne({email}).select('+password');
    if (!user) next( new CustomError('Please check your credentials',400));
    if (!comparePassword(password, user.password)) next( new CustomError('Please check your credentials',400));
    sendJwtToClient(user, res);
});

const getUser = (req, res, next) => {
    res.json({ 
        success: true, 
        data: {
            id: req.user.id,
            name: req.user.name
        } 
    });
}

const logout = asyncHandler(async (req, res, next) => {
    const { NODE_ENV } = process.env;
    return res.status(200).cookie({
        httpOnly: true,
        expires: new Date(Date.now()),
        secure: NODE_ENV === "development" ? false : true 
    }).json({
        success: true,
        message: "Logout Successfull"
    });
});

const imageUpload = asyncHandler(async (req, res, next) => {
    const user = await User.findByIdAndUpdate(req.user.id, {
        "profile_image": req.savedProfileImage
    }, {
        new: true,
        runValidators: true
    })
    res.status(200).json({
        success: true,
        message: "Image Upload Successfull",
        data: user
    });
});

const forgotPassword = asyncHandler(async (req, res, next) => {
    const resetEmail = req.body.email;
    const user = await User.findOne({ email: resetEmail });
    if (!user) {
        return next(new CustomError("There is no user with that email", 400));
    }
    const resetPasswordToken = user.getResetPasswordTokenFromUser();
    await user.save();
    const resetPasswordUrl = `http://localhost:5000/api/auth/resetpassword?resetPasswordToken=${resetPasswordToken}`;
    const emailTemplate = `
        <h3>Reset Your Password</h3>
        <p>This <a href = '${resetPasswordUrl}' target = '_blank'>link</a>  will expire in 1 hour</p>
    `;
    try {
        await sendEmail({
            from: process.env.SMTP_USER,
            to: "info@emrekabaca.com",
            subject: "Reset Your Password",
            html: emailTemplate
        });
        return res.status(200).json({
            success: true,
            message: "Token Sent To Your Email"
        });
    } catch (err) {
        // user.resetPasswordToken = null;
        // user.resetPasswordExpire = null;
        // await user.save();
        return next(new CustomError("Email Could Not Be Sent", 500));
    }
});

const resetPassword = asyncHandler(async (req, res, next) => {
    const { resetPasswordToken } = req.query;
    const { password } = req.body;
    if (!resetPasswordToken) {
        return next(new CustomError("Please provide a valid token", 400));
    }
    let user = await User.findOne({
        resetPasswordToken: resetPasswordToken,
        resetPasswordExpire: {$gt: Date.now()} 
    });
    if (!user) {
        return next(new CustomError("Invalid token or Session Expired", 404));
    }
    user.password = password;
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;
    await user.save();
    return res.status(200).json({ 
        success: true, message: "Working" 
    });
});

const editDetails = asyncHandler(async (req, res, next) => {
    const editInformation = req.body;
    const user = await User.findByIdAndUpdate(req.user.id,editInformation,{
        new: true,
        runValidators: true
    });
    return res.status(200).json({
        success: true, data: user
    });
});

module.exports = {
    register, login, getUser, logout, imageUpload, forgotPassword, resetPassword, editDetails
};