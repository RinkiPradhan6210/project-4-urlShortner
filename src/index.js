const express = require('express'); //express  is a frame work of node.js web application and it is a labrary  of other node web frame work 
const app = express(); 
const mongoose = require('mongoose');

const route = require('./routes/route')

app.use(express.json()); // it parses incomming req with  JSON payload it based on body parser

mongoose.connect('mongodb+srv://RinkiPradhan:moShtmwBC2cEopn2@cluster0.xs93j.mongodb.net/Group61Database')
    .then(() => console.log('MongoDB is Connected'))
    .catch(error => console.log(error));



app.use('/', route);



let PORT = process.env.PORT || 3000
app.listen(PORT, function () {
    console.log(`Express is running on PORT ${PORT}`)
});


