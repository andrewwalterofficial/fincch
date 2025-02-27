const mongoose = require("mongoose");

mongoose
    .connect('mongodb+srv://andrewwalterofficial:andrewwalterofficial@cluster0.dmxca.mongodb.net/onlinebanking', {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => console.log(`Connected to DB`))
    .catch((err) => console.error(err));