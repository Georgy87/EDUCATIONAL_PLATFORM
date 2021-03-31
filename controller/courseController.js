// const Course = require("../models/Course");
const User = require("../models/User");
const Uuid = require("uuid");
const path = require("path");
const fs = require("fs");

const jwt = require("jsonwebtoken");
const config = require("config");
const TeacherCourse = require("../models/TeacherCourse");
const Modules = require("../models/Modules");
const Comments = require("../models/Comments");
class courseController {
    async uploadNewCourse(req, res) {
        try {
            // const fileVideo = req.files.file[0].name;
            const photo = req.files.file.name;

            // const videoMv = req.files.file[0];
            const photoMv = req.files.file;

            // const pathVideos = path.join(__dirname, `../static/videos`);
            // videoMv.mv(pathVideos + "/" + videoMv.name);

            const pathPhotos = path.join(__dirname, `../static/coursePhotos`);
            photoMv.mv(pathPhotos + "/" + photoMv.name);

            const {
                profession,
                author,
                price,
                smallDescription,
                fullDescription,
                // lesson,
                // module,
            } = req.body;

            const dbFile = new TeacherCourse({
                user: req.user.id,
                professionalСompetence: "",
                avatar: "",
                photo,
                profession,
                competence: "",
                author,
                price,
                smallDescription,
                fullDescription,
                comments: [],
            });

            dbFile.save((err) => {
                if (err) {
                    return res.status(404).json({
                        status: "Error upload course",
                        message: err,
                    });
                }

                res.json({
                    status: "success",
                    message: "Course upload done",
                });
            })
        } catch (e) {
            return res
                .status(500)
                .json({ message: "Upload teacher course error" });
        }
    }

    async getCourses(req, res) {
        try {
            TeacherCourse.find().exec((err, courses) => {
                if (err) {
                    return res.status(404).json({
                        status: "Error get course",
                        message: err,
                    });
                }

                return res.json({
                    status: "success",
                    courses,
                });
            });
        } catch (e) {
            console.log(e);
        }
    }

    async deleteCourse(req, res) {
        try {
            TeacherCourse.findOne({ _id: req.query.id }).exec((err, course) => {
                if (err) {
                    return res.status(400).json({
                        status: "Error course delete",
                        message: err,
                    });
                }

                const Path = path.join(
                    __dirname,
                    `../static/coursePhotos/${req.query.name}`
                );

                fs.unlinkSync(Path);

                course.remove();

                return res.json({
                    status: "success",
                    message: "Course was deleted"
                });
            });
        } catch (e) {
            console.log(e);
            return res.status(500).json({ message: "Delete course error" });
        }
    }

    async getProfileCourse(req, res) {
        try {
            const id = req.query.id;
            TeacherCourse.find({ _id: id }).populate('user').populate('content').exec((err, course) => {
                if (err) {
                    return res.status(404).json({
                        status: "Course profile not found",
                        message: err,
                    });
                }
                return res.json(course[0]);
            });
        } catch (e) {
            console.log(e);
        }
    }

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

            TeacherCourse.findOne({
                _id: courseId,
            })
                .select(
                    "-content -smallDescription -fullDescription -profession -competence -user -author -price -__v"
                )
                .exec(async function (err, course) {
                    if (req.files) {
                        course.comments.unshift({
                            text: text,
                            photo: photoName,
                            user: req.user.id,
                        });
                    } else {
                        course.comments.unshift({
                            text: text,
                            user: req.user.id,
                        });
                    }
                    course.save(async (err) => {
                        if (err) {
                            return res.status(400).json({
                                status: 'Create comment error',
                                message: err
                            });
                        }

                        const data = await course
                            .populate("comments.user")
                            .populate("comments.comments.user")
                            .execPopulate();

                        return res.json({
                            status: "success",
                            data: data,
                        });
                    });
                });
        } catch (e) {
            console.log(e);
        }
    }

    async createCommentNew(req, res) {
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

    async createReplyToComment(req, res) {
        try {
            const { text } = req.body;
            const { courseId, commentId } = req.query;
            const userId = req.user.id;

            Comments.findOne({ _id: commentId }).exec(function (err, comment) {
                console.log(comment);
                // course.comments.map(async (el) => {
                //     if (el._id.toString() === commentId) {
                //         el.comments.push({
                //             text: text,
                //             user: userId,
                //         });

                //         course.save(async (err) => {
                //             if (err) {
                //                 return res.status(400).json({
                //                     status: 'Create comment error',
                //                     message: err
                //                 });
                //             }

                //             const data = await course
                //                 .populate("comments.user")
                //                 .populate("comments.comments.user")
                //                 .execPopulate();

                //             data.comments.map((el) => {
                //                 if (el._id.toString() === commentId) {
                //                     return res.json({
                //                         data: el,
                //                     });
                //                 }
                //             });
                //         });
                //     }
                // });
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
            const { courseId, commentId } = req.query;
            TeacherCourse.findOne({ _id: courseId })
                .populate("comments.user")
                .populate("comments.comments.user")
                .exec(function (err, course) {
                    course.comments.map((data) => {
                        if (data._id.toString() === commentId) {
                            return res.json({
                                data: data,
                            });
                        }
                    });
                });
        } catch (e) {
            console.log(e);
        }
    }

    async getReplyToCommentNew(req, res) {
        try {
            const { courseId, commentId } = req.query;
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
                    console.log(comment);
                    // course.comments.map((data) => {
                    //     if (data._id.toString() === commentId) {
                    //         return res.json({
                    //             data: data,
                    //         });
                    //     }
                    // });
                    return res.json({
                        data: comment,
                    });
                });
        } catch (e) {
            console.log(e);
        }
    }

    async getTeacherProfile(req, res) {
        try {
            const teacherId = req.query.teacherId;
            User.findOne({ _id: teacherId }).exec((err, user) => {
                if (err) {
                    return res.status(400).json({
                        status: 'Get teacher profile error',
                        message: err
                    });
                }

                TeacherCourse.find({
                    user: { $in: teacherId },
                }).exec((err, allTeacherCourses) => {
                    return res.json({
                        avatar: user.avatar,
                        email: user.email,
                        id: user.id,
                        name: user.name,
                        surname: user.surname,
                        competence: user.competence,
                        courses: allTeacherCourses,
                    });
                });
            });
        } catch (error) {
            return res
                .status(500)
                .json({ message: "Get teacher profile error" });
        }
    }

    async getCoursesForShoppingCart(req, res) {
        try {
            const user = await User.findOne({ _id: req.user.id });
            const ids = user.shoppingCart;

            let totalPrice = 0;

            TeacherCourse.find({
                _id: { $in: ids },
            })
                .select(
                    "-content -comments -user -smallDescription -fullDescription -updatedAt -__v -competence"
                )
                .exec(function (err, coursesDestructured) {
                    if (err) {
                        return res.status(400).json({
                            status: 'Get courses for shopping cart error',
                            message: err
                        });
                    }
                    coursesDestructured.map((element) => {
                        totalPrice += Number(element.price);
                    });
                    return res.json({
                        coursesData: {
                            coursesDestructured,
                            totalPrice,
                        },
                    });
                });
        } catch (error) {
            return res
                .status(500)
                .json({ message: "Get Course for shopping cart error" });
        }
    }

    async deleteCoursesForShoppingCart(req, res) {
        try {
            const courseId = req.query.id;
            User.findOne({ _id: req.user.id }).exec(async (err, user) => {
                const ids = user.shoppingCart;
                const UserCartShopids = ids.filter((el) => el != courseId);
                user.shoppingCart = UserCartShopids;

                const courses = await TeacherCourse.find({
                    _id: { $in: UserCartShopids },
                });

                let totalPrice = 0;

                const coursesDestructured = courses.map((element) => {
                    totalPrice += Number(element.price);
                    return Object.assign(
                        {},
                        {
                            photo: element.photo,
                            author: element.author,
                            price: element.price,
                            smallDescription: element.smallDescription,
                            profession: element.profession,
                            _id: element._id,
                        }
                    );
                });

                user.save((err) => {
                    if (err) {
                        return res.status(404).json({
                            status: "error",
                            message: err,
                        });
                    }
                    return res.json({
                        coursesData: {
                            coursesDestructured,
                            totalPrice,
                        },
                    });
                });
            });
        } catch (error) {
            return res
                .status(500)
                .json({ message: "Delete Course for shopping cart error" });
        }
    }

    async getPurchasedCourses(req, res) {
        try {
            User.findOne({ _id: req.user.id }).exec(async (err, user) => {
                const ids = user.purchasedCourses;
                TeacherCourse.find({ _id: { $in: ids } }).select("-content -profession -competence -user -price -__v -comments -createdAt -updatedAt -avatar -fullDescription").exec((err, courses) => {
                    if (err) {
                        return res.status(400).json({
                            status: 'Get purchased purses error',
                            message: err
                        });
                    }
                    return res.json([...courses]);
                });
            });
        } catch (error) {
            return res
                .status(500)
                .json({ message: "Get Course for Purchased Courses error" });
        }
    }

    async getCourseForTraining(req, res) {
        try {
            const id = req.query.id;
            TeacherCourse.find({ _id: id }).populate('user').populate('content').exec((err, course) => {
                if (err) {
                    return res.status(404).json({
                        status: "Get course for training error",
                        message: err,
                    });
                }

                return res.json(course[0]);
            });

        } catch (error) {
            return res
                .status(500)
                .json({ message: "Get Course for Training error" });
        }
    }

    async checkedLesson(req, res) {
        try {
            const { lessonEnd, lessonId, moduleId } = req.body;

            // const checkLesson = new CheckedLessonModel({
            //     checked: lessonEnd
            // });

            // checkLesson.save();

            Modules.findOneAndUpdate({ 'moduleContent._id': lessonId }, {
                $set: { 'moduleContent.$.checkedLesson': lessonEnd }
            }, (err, module) => {
                if (err) {
                    return res.status(404).json({
                        status: "Checked lesson error",
                        message: err,
                    });
                }
                module.save(() => {
                    TeacherCourse.find({ _id: module.course }).populate('user').populate('content').exec((err, course) => {
                        if (err) {
                            return res.status(404).json({
                                status: "Get course for training error",
                                message: err,
                            });
                        }
                        return res.json(course[0]);
                    });
                });
            });

        } catch (error) {
            return res
                .status(500)
                .json({ message: "Get Course for Training error" });
        }
    }

    async createTestForCourse(req, res) {
        try {
            const { courseId, questionText, answerOptions } = req.body;

            TeacherCourse.findOneAndUpdate({ _id: courseId }, {
                $push: {
                    courseTest: {
                        questionText: questionText,
                        answerOptions: [...answerOptions],
                    }
                }
            }, (err, course) => {
                if (err) {
                    return res.status(403).json({
                        status: 'Create test for course error',
                        message: 'error',
                    });
                }
                course.save();
            });
        } catch (error) {
            return res
                .status(500)
                .json({ message: 'Tests for course error' });
        }
    }

    async getTestForCourse(req, res) {
        try {
            TeacherCourse.findOne({ _id: req.query.courseId }).exec((err, course) => {
                const questions = course.courseTest;
                res.json({
                    status: 'success',
                    questions
                });
            });
        } catch (error) {
            return res
                .status(500)
                .json({ message: 'Get tests for course error' });
        }
    }
}

module.exports = new courseController();


