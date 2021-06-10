const express = require("express");
const mongoose = require("mongoose");
const config = require("config");
const app = express();
const PORT = config.get("serverPort");
const { createUseApp } = require("./core/moduleApp");
const { createServer } = require("http");
const { createSocket } = require('./core/socket');

const http = createServer(app);

const io = createSocket(http);

const start = async () => {
    try {
        await mongoose.connect(config.get("dbUrl"), {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false
        });

        http.listen(PORT, () => {
            console.log("Server started on port", PORT);
        });


        createUseApp(app, io);
      

    } catch (e) {
        console.log(e);
    }
};
start();
