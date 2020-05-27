const Question = require('../models/question');
const CustomError = require('../helpers/error/CustomError');
const asyncHandler = require('express-async-handler');

const askNewQuestion = asyncHandler(async (req, res, next) => {
    const information = req.body;
    const question = await Question.create({
        ...information,
        user: req.user.id
    })
    res.status(200).json({ 
        success: true, 
        data: question 
    });
});

const getAllQuestions = asyncHandler(async (req, res, next) => {
    return res.status(200).json(res.queryResults);
});

const getSingleQuestion = asyncHandler(async (req, res, next) => {
    return res.status(200).json(res.queryResults);
});

const editQuestion = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { title, content } = req.body;
    let question = await Question.findById(id);
    question.title = title;
    question.content = content;
    question = await question.save();
    return res.status(200).json({ 
        success: true, 
        data: question 
    });
});

const deleteQuestion = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    await Question.findByIdAndDelete(id);
    return res.status(200).json({ 
        success: true, 
        message: "Question delete operation successful" 
    });
});

const likeQuestion = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const question = await Question.findById(id);
    if (question.likes.includes(req.user.id)) {
        return next(new CustomError("You already liked this question", 400));
    }
    question.likes.push(req.user.id);
    question.likeCount = question.likes.length;
    await question.save();
    return res.status(200).json({ 
        success: true, 
        data: question
    });
});

const undoLikeQuestion = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const question = await Question.findById(id);
    if (!question.likes.includes(req.user.id)) {
        return next(new CustomError("You can not undo like operation for this question", 400));
    }
    const index = question.likes.indexOf(req.user.id);
    question.likes.splice(index, 1);
    question.likeCount = question.likes.length;
    await question.save();
    return res.status(200).json({ 
        success: true, 
        data: question
    });
});

module.exports = {
    getAllQuestions, askNewQuestion, getSingleQuestion, editQuestion, deleteQuestion, likeQuestion, undoLikeQuestion
};