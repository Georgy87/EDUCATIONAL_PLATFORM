const express = require("express");
const courseRouter = require("../routes/course.routes");
const directionRouter = require("../routes/direction.routes");
const courseContentRouter = require("../routes/courseContent.routes");
const userRouter = require("../routes/user.routes");
const authRouter = require("../routes/auth.routes");
const commentRouter = require("../routes/comment.routes");
const fileUpload = require("express-fileupload");
const DialogController = require('../controller/dialogsController');
const MessagesController = require('../controller/messagesController');
const lastSeenMiddleware = require("../middleware/updateLastSeen.middleware");
const cors = require("cors");

const authMiddleWare = require("../middleware/auth.middleware");

module.exports.createUseApp = (app, io) => {
    const DialogCtrl = new DialogController(io);
    const MessageCtrl = new MessagesController(io);

    app.use(fileUpload({}));
    app.use(express.json());
    app.use(cors());
 
    app.use("/api/auth", authRouter);
    app.use("/api/user", userRouter);
    app.use("/api/teacher", courseContentRouter);
    app.use("/api/course", [courseRouter, commentRouter]);
    app.use("/api/direction", directionRouter);
    app.use("/api/teacher", courseRouter);
    app.use("/api/teacher", courseContentRouter);

    // app.use(function (err, req, res, next) {
    //     if (err) {
    //         return console.log('Иди');
    //     }
       
    //     return res.status(500).send('Something broke!');
    // });

    // Доработать

    app.get("/api/dialogs", authMiddleWare, lastSeenMiddleware, DialogCtrl.show);
    app.delete("/api/dialogs/:id", authMiddleWare, lastSeenMiddleware, DialogCtrl.delete);
    app.post("/api/dialogs", authMiddleWare, lastSeenMiddleware, DialogCtrl.create);
    app.post("/api/dialogs/group", authMiddleWare, lastSeenMiddleware, DialogCtrl.createGroup);

    // Доработать

    app.get("/api/messages", authMiddleWare, lastSeenMiddleware, MessageCtrl.show);
    app.post("/api/messages", authMiddleWare, MessageCtrl.create);
    app.delete("/api/messages?:id", authMiddleWare, MessageCtrl.delete);

    app.use(express.static("static/coursePhotos"));
    app.use(express.static("static/commentPhotos"));
    app.use(express.static("static/replyToCommentPhoto"));
    app.use(express.static("static"));
    app.use(express.static("static/directions"));
    app.use(express.static("static/avatars"));
    app.use(express.static("static/videos"));
}