
const DialogModel = require("../models/Dialogs");

const MessageModel = require("../models/Messages");

class MessageController {
    constructor(io) {
        this.io = io;
    }

    updateReadStatus = (
        res,
        userId,
        dialogId
    ) => {
        console.log(userId,
            dialogId)
        MessageModel.updateMany(
            { dialog: dialogId, user: { $ne: userId } },
            { $set: { read: true }},
            (err) => {
                if (err) {
                    res.status(500).json({
                        status: "error",
                        message: err,
                    });
                } else {
                    this.io.emit("SERVER:MESSAGES_READED", {
                        userId,
                        dialogId,
                    });
                }
            }
        );
    };

    show = (req, res) => {
        const dialogId = req.query.dialog;
        const userId = req.user.id;

        this.updateReadStatus(res, userId, dialogId);

        MessageModel.find({ dialog: dialogId })
            .populate(["dialog", "user"])
            .exec((err, messages) => {
                if (err) {
                    res.status(404).json({
                        message: "Messages not found",
                    });
                }

                return res.json(messages);
            });
    }

    create = (req, res) => {
        const userId = req.user.id;

        const postData = {
            text: req.body.text,
            dialog: req.body.dialog_id,
            user: userId,
        };

        const message = new MessageModel(postData);

        message
            .save()
            .then((obj) => {
                obj.populate(["dialog", "user"], (err, message) => {
                    if (err) {
                        res.status(500).json({
                            message: err
                        });
                    }
                    DialogModel.findOneAndUpdate(
                        { _id: postData.dialog },
                        { lastMessage: message._id },
                        { upsert: true },
                        function (err) {
                            if (err) {
                                return res.status(500).json({
                                    status: "error",
                                    message: err
                                });
                            }
                        }
                    );
                    res.json(message);
                    this.io.emit("SERVER:NEW_MESSAGE", message);
                });
            })
            .catch((reason) => {
                res.json(reason);
            });
    }

    delete = (req, res) => {
        const id = req.query.id;
        const userId = req.user.id;

        MessageModel.findById(id, (err, message) => {
            if (err || !message) {
                return res.status(404).json({
                    status: "error",
                    message: "Message not found",
                });
            }

            if (message.user.toString() === userId) {
                const dialogId = message.dialog;
                message.remove();

                MessageModel.findOne({ dialog: dialogId }).sort({ createdAt: -1 })
                    .exec((err, lastMessage) => {
                        if (err) {
                            res.status(500).json({
                                status: "error",
                                message: err,
                            });
                        }

                        DialogModel.findById(dialogId, (err, dialog) => {
                            if (err) {
                                res.status(500).json({
                                    status: "error",
                                    message: err,
                                });
                            }

                            if (!dialog) {
                                return res.status(404).json({
                                    status: "not found",
                                    message: err,
                                });
                            }
                            
                            if (lastMessage) {
                                dialog.lastMessage = lastMessage._id.toString();
                            }

                            dialog.save();
                            this.io.emit("SERVER:DIALOG_CREATED");
                        });
                    });
                return res.json({
                    status: "success",
                    message: "Message deleted",
                });
            } else {
                return res.status(403).json({
                    status: "error",
                    message: "Not have permission",
                });
            }
        });
    }
}

module.exports = MessageController;