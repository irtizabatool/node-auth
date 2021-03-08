const express = require('express');
const bodyParser = require('body-parser');
const user = require('./routes/user');

const app = express();

app.use(bodyParser.json());
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.json({ message: "API is Working"});
});


app.listen(PORT, (req, res) =>{
    console.log(`Server started at port ${ PORT }`);
});