
const Comments = require("../models/Comments");
const Uuid = require("uuid");
const path = require("path");
const fs = require("fs");

class commentsController {
    async createComment(req, res) {
        try {
            let file;
            const photoName = Uuid.v4() + ".jpg";

            if (req.files) {
                file = req.files.file;
                const Path = path.join(__dirname, `../static/commentPhotos`);
                file.mv(Path + "/" + photoName);
            }

            const { courseId, text } = req.body;

            let Comment;

            if (req.files) {
                Comment = new Comments({
                    text: text,
                    photo: photoName,
                    user: req.user.id,
                    courseId,
                });
            } else {
                Comment = new Comments({
                    text: text,
                    user: req.user.id,
                    courseId,
                });
            }

            Comment.save(async (err) => {
                if (err) {
                    return res.status(400).json({
                        status: 'Create comment error',
                        message: err
                    });
                }

                Comments.find({ courseId: courseId })
                    .populate("user")
                    .populate("comments.user")
                    .sort({ 'created': -1 })
                    .exec((err, comments) => {
                        if (err) {
                            return res.status(404).json({
                                status: 'Comments not found',
                                message: err
                            });
                        }
                        return res.json({
                            status: "success",
                            data: comments
                        });
                    });
            });
        } catch (e) {
            console.log(e);
        }
    }

    async deleteComment(req, res) {
        try {
            const { courseId, commentId } = req.query;

            Comments.findOne({ _id: commentId }).exec((err, data) => {
                if (err) {
                    return res.status(404).json({
                        status: 'Comments not found',
                        message: err
                    });
                }

                if (req.query.photoName != 'undefined') {
                    const Path = path.join(
                        __dirname,
                        `../static/commentPhotos/${req.query.photoName}`
                    );
                    if (Path) {
                        fs.unlinkSync(Path);
                    }
                }

                if (data) {
                    data.delete();
                }

                Comments.find({ courseId }).populate(['user', 'comments.user']).exec((err, data) => {
                    return res.json({
                        data: data,
                    });
                });
            });
        } catch (e) {
            console.log(e);
        }
    }

    async createReplyToComment(req, res) {
        try {
            const { text } = req.body;
            const { courseId, commentId } = req.query;
            const userId = req.user.id;

            Comments.findOneAndUpdate({ _id: commentId }, {
                $push: {
                    comments: {
                        text: text,
                        user: userId,
                    }
                }
            }, function (err, comment) {
                if (err) {
                    return res.status(400).json({
                        status: 'Create comment error',
                        message: err
                    });
                }
                Comments.findOne({ _id: commentId })
                    .populate("user")
                    .populate("comments.user")
                    .exec(function (err, comment) {
                        console.log(comment);

                        return res.json({
                            data: comment,
                        });

                    });
            });
        } catch (e) {
            console.log(e);
        }
    }

    async getCommentsForCourse(req, res) {
        try {
            const { courseId } = req.query;
            Comments.find({ courseId })
                .populate("user")
                .populate("comments.user")
                .sort({ 'created': -1 })
                .exec(function (err, data) {
                    if (data) {
                        return res.json({
                            data: data,
                        });
                    }
                });
        } catch (e) {
            console.log(e);
        }
    }

    async getReplyToComment(req, res) {
        try {
            const { commentId } = req.query;

            Comments.findOne({ _id: commentId })
                .populate("user")
                .populate("comments.user")
                .exec(function (err, comment) {
                    if (err) {
                        res.status(404).json({
                            status: 'Comments not found',
                            message: err
                        });
                    }
                    return res.json({
                        data: comment,
                    });
                });
        } catch (e) {
            console.log(e);
        }
    }
}

module.exports = new commentsController();

