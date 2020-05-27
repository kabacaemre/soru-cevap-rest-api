const express = require('express');

const question = require('./question');
const auth = require('./auth');
const user = require('./user');
const admin = require('./admin');

const router = express.Router();

router.use("/auth", auth);
router.use("/admin", admin);
router.use("/users", user);
router.use("/questions", question);

module.exports = router;