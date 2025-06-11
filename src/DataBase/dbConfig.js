require('dotenv').config();
const mongoose = require('mongoose');
const db_uri = process.env.db_uri
const connectDB = async () => {
    mongoose.connect(db_uri)
}

module.exports = connectDB;