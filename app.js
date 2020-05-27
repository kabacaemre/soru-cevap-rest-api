const express = require('express');
const app = express();

const path = require('path');

// Express - Body Middleware
app.use(express.json());

// Environment Variables
const dotenv = require('dotenv');
dotenv.config({path: "./config/env/config.env"});

// MongoDB Connection
const connectDatabase = require('./helpers/database/db');
connectDatabase();

const router = require("./routes/index");
app.use("/api", router);

const PORT = process.env.PORT;
const dev = process.env.NODE_ENV;

//Error Handler
const errorHandler = require('./middlewares/errors/errorHandler');
app.use(errorHandler);

//Static Files
app.use(express.static(path.join(__dirname, "public")));

app.listen(PORT, () => console.log(`Example app listening at http://localhost:${PORT} ${dev}`));