const express = require('express');
const connectDB = require('./DataBase/dbConfig')
const app = express();

app.use(express.json());


connectDB()
    .then(() => {
        app.listen(5000 , () => {
            console.log('Server is running on port 5000');
        })
    }).catch((err) => {
        console.log('connect Failed:', err);
    })