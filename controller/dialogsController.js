
const DialogModel = require("../models/Dialogs");
const MessageModel = require("../models/Messages");
const TeacherCourse = require("../models/TeacherCourse");
// import socket from "socket.io";

class DialogController {
    constructor(io) {
        this.io = io;
    }

    show(req, res) {
        const userId = req.user.id;

        DialogModel.find()
            .or([{ author: userId }, { partner: userId }])
            .populate(['author', 'partner'])
            .populate({
                path: 'lastMessage',
                populate: {
                    path: 'user',
                },
            })
            .exec((err, dialogs) => {
                if (err) {
                    res.status(404).json({
                        message: "Dialogs not found",
                    });
                }

                return res.json(dialogs);
            });
    }

    create = (req, res) => {
        const isOnePartnerOrGroup = "IS_ONE_PARTNER";

        const postData = {
            author: req.user.id,
            partner: req.body.partner,
            isOnePartnerOrGroup
        };

        const dialog = new DialogModel(postData);
        dialog
            .save()
            .then((dialogObj) => {
                const message = new MessageModel({
                    text: req.body.text,
                    user: req.user.id,
                    dialog: dialogObj._id
                });

                message
                    .save()
                    .then(() => {
                        dialogObj.lastMessage = message._id;
                        dialogObj.save().then(() => {
                            res.json(dialogObj);
                            this.io.emit("SERVER:DIALOG_CREATED", {
                                ...postData,
                                dialog: dialogObj
                            });
                        });
                    })
                    .catch(reason => {
                        res.json(reason);
                    });
            });
    }

    createGroup = (req, res) => {
        // const arr = ["6043b8c2ba55502c6739d8fb", "6040f4bc1f99a7b5992d882c", "602ad55a9725bfd6334b398a"]

        const textForCreateGroup = "Группа курса созданна";
        const isOnePartnerOrGroup = "IS_GROUP";

        TeacherCourse.findOne({ _id: req.body.courseId }).exec((err, course) => {
            if (err) {
                res.status(401).json({
                    status: "Course not found",
                    message: err
                })
            }
            
            if (req.body.groupName && course.courseUsers.length > 0) {
                const groupData = {
                    author: req.user.id,
                    partner: course.courseUsers,
                    dialogName: req.body.groupName,
                    isOnePartnerOrGroup,
                    course: req.body.courseId,
                };

                const dialogGroup = new DialogModel(groupData);

                dialogGroup
                    .save()
                    .then((dialogObj) => {
                        const message = new MessageModel({
                            text: textForCreateGroup,
                            user: req.user.id,
                            dialog: dialogObj._id
                        });

                        message
                            .save()
                            .then(() => {
                                dialogObj.lastMessage = message._id;
                                dialogObj.save().then(() => {
                                    res.json(dialogObj);
                                    this.io.emit("SERVER:DIALOG_CREATED", {
                                        ...groupData,
                                        dialog: dialogObj
                                    });
                                });
                            })
                            .catch(reason => {
                                res.json(reason);
                            });
                    })
            } else {
                res.json({ status: 'error' })
            }
        });

    }

    delete(req, res) {
        const id = req.params.id;

        DialogModel.findOneAndRemove({ _id: id })
            .then((dialog) => {
                if (dialog) {
                    res.json({
                        message: `Dialog deleted`,
                    });
                } else {
                    res.status(404).json({
                        status: "Dialog not found",
                    });
                }
            })
            .catch((err) => {
                res.json({
                    message: err,
                });
            });
    }
}

module.exports = DialogController;
