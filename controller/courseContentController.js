// const Course = require("../models/Course");
const User = require('../models/User');
const TeacherCourse = require('../models/TeacherCourse');
const path = require('path');
const fs = require('fs');
const Uuid = require('uuid');
const jwt = require('jsonwebtoken');
const config = require('config');
const mongoose = require('mongoose');
const Modules = require('../models/Modules');

class courseContentController {
    async uploadContentCourseNew(req, res) {
        try {
            const courseId = req.query.courseId;

            if (req.files != null) {
                const fileVideo = req.files.file.name;
                const fileMv = req.files.file;
                const { lesson, module } = req.body;

                const modules = new Modules({
                    course: courseId,
                    user: req.user.id,
                    module: module,
                    moduleHours: 0,
                    moduleMinutes: 0,
                    moduleSeconds: 0,
                    moduleContent: [
                        {
                            fileVideo: fileVideo,
                            lesson: lesson,
                            lessonTime: '',
                            checkedLesson: false,
                        },
                    ],
                });

                const Path = path.join(__dirname, `../static/videos`);
                fileMv.mv(Path + '/' + fileMv.name);

                modules.save((err, dataModule) => {
                    TeacherCourse.findOneAndUpdate(
                        { _id: courseId },
                        {
                            $push: { content: dataModule._id.toString() },
                        },
                        (err, data) => {
                            Modules.find({ course: courseId }).exec(
                                (err, course) => {
                                    if (err) {
                                        return res.status(404).json({
                                            status:
                                                'Upload content courses error',
                                            message: err,
                                        });
                                    }
                                    return res.json({ content: course });
                                },
                            );
                        },
                    );
                });
            }
        } catch (e) {
            console.log(e);
            return res
                .status(500)
                .json({ message: 'Upload content course error' });
        }
    }

    async getContentCourses(req, res) {
        try {
            const courseId = req.query.courseId;

            Modules.find({ course: courseId, user: req.user.id }).exec(
                (err, course) => {
                    if (err) {
                        return res.status(404).json({
                            status: 'Get content courses error',
                            message: err,
                        });
                    }
                    return res.json({ content: course });
                },
            );
        } catch (e) {
            return res
                .status(500)
                .json({ message: 'Get content courses error' });
        }
    }

    async getAllTeacherCourses(req, res) {
        try {
            const getTeacherCourses = await TeacherCourse.find({
                user: req.user.id,
            });

            await res.json(getTeacherCourses);
        } catch (e) {
            return res
                .status(500)
                .json({ message: 'Get all teacher courses error' });
        }
    }

    async uploadLesson(req, res) {
        try {
            const { lesson, moduleId } = req.body;
            const courseId = req.query.courseId;
            const fileVideo = req.files.file.name;
            const fileMv = req.files.file;

            Modules.updateOne(
                { course: courseId, _id: moduleId },
                {
                    $push: {
                        moduleContent: {
                            fileVideo,
                            lesson,
                            lessonTime: '',
                            linksToResources: [],
                            checkedLesson: false,
                        },
                    },
                },
                function(err, result) {
                    if (err) {
                        return res.status(500).json({
                            status: 'Upload lesson error',
                            message: err,
                        });
                    }

                    const Path = path.join(__dirname, `../static/videos`);
                    fileMv.mv(Path + '/' + fileMv.name);

                    Modules.find({ course: courseId }).exec((err, course) => {
                        if (err) {
                            return res.status(404).json({
                                message: err,
                            });
                        }
                        return res.json({ content: course });
                    });
                },
            );
        } catch (e) {
            return res.status(500).json({ message: 'error' });
        }
    }

    async deleteLesson(req, res) {
        try {
            const {
                moduleId,
                lessonId,
                videoName,
                hours,
                minutes,
                seconds,
            } = req.body;
            const courseId = req.query.courseId;

            Modules.findOneAndUpdate(
                { _id: moduleId },
                { $pull: { moduleContent: { _id: lessonId } } },
                function(err, module) {
                    module.moduleHours -= hours;
                    module.moduleMinutes -= minutes;
                    module.moduleSeconds -= seconds;
                    if (err) {
                        return res.status(400).json({
                            status: '`Delete lesson error',
                            message: err,
                        });
                    }

                    module.save((err, data) => {
                        const Path = path.join(
                            __dirname,
                            `../static/videos/${videoName}`,
                        );
                        fs.unlinkSync(Path);

                        Modules.find({ course: courseId }).exec(
                            (err, course) => {
                                if (err) {
                                    return res.status(404).json({
                                        message: err,
                                    });
                                }
                                return res.json({ content: course });
                            },
                        );
                    });
                },
            );
        } catch (e) {
            return res
                .status(500)
                .json({ message: 'Delete content courses error' });
        }
    }

    async lessonTitleRevision(req, res) {
        try {
            const { newTitle, lessonId, moduleId } = req.body;
            const courseId = req.query.courseId;

            Modules.findOneAndUpdate(
                { 'moduleContent._id': lessonId },
                {
                    $set: { 'moduleContent.$.lesson': newTitle },
                },
                (err, module) => {
                    module.save((err, data) => {
                        Modules.find({ course: courseId }).exec(
                            (err, course) => {
                                if (err) {
                                    return res.status(400).json({
                                        status:
                                            '`Update lesson title revision error',
                                        message: err,
                                    });
                                }
                                return res.json({ content: course });
                            },
                        );
                    });
                },
            );
        } catch (e) {
            return res
                .status(500)
                .json({ message: 'Lesson title revision error' });
        }
    }

    async sendLinksToResources(req, res) {
        try {
            const { moduleId, lessonId, linkName, linksToResources } = req.body;

            const courseId = req.query.courseId;

            Modules.findOneAndUpdate(
                { 'moduleContent._id': lessonId },
                {
                    $push: {
                        'moduleContent.$.linksToResources': {
                            linkName,
                            linksToResources,
                        },
                    },
                },
                (err, module) => {
                    module.save((err, data) => {
                        Modules.find({ course: courseId }).exec(
                            (err, course) => {
                                if (err) {
                                    return res.status(400).json({
                                        status: 'Send links to resources error',
                                        message: err,
                                    });
                                }
                                return res.json({ content: course });
                            },
                        );
                    });
                },
            );
        } catch (e) {
            return res.status(500).json({ message: 'Send links error' });
        }
    }

    async setTimeModuleAndLessons(req, res) {
        try {
            const { moduleId, lessonId, hours, minutes, seconds } = req.body;

            const courseId = req.query.courseId;

            const module = await Modules.findOneAndUpdate(
                { _id: moduleId },
                {
                    $set: {
                        moduleHourse: hours,
                        moduleMinutes: minutes,
                        moduleSeconds: seconds,
                    },
                },
                (err, module) => {
                    if (err) {
                        return res.status(400).json({
                            status: 'Set time module and lessons error',
                            message: err,
                        });
                    }

                    module.moduleHours += hours;
                    module.moduleMinutes += minutes;
                    module.moduleSeconds += seconds;

                    module.save(() => {
                        Modules.findOneAndUpdate(
                            { 'moduleContent._id': lessonId },
                            {
                                $set: {
                                    'moduleContent.$.lessonTime':
                                        hours + ':' + minutes + ':' + seconds,
                                },
                            },
                            (err, lesson) => {
                                if (err) {
                                    return res.status(400).json({
                                        status: 'Set time lesson error',
                                        message: err,
                                    });
                                }

                                lesson.save(() => {
                                    Modules.find({ course: courseId }).exec(
                                        (err, course) => {
                                            if (err) {
                                                return res.status(400).json({
                                                    status:
                                                        'Send links to resources error',
                                                    message: err,
                                                });
                                            }
                                            // console.log(course);

                                            return res.json({
                                                content: course,
                                            });
                                        },
                                    );
                                });
                            },
                        );
                    });
                },
            );

            // TeacherCourse.findOne({
            //     user: req.user.id,
            //     _id: courseId
            // }).exec((err, course) => {
            //     if (err) {
            //         return res.status(400).json({
            //             status: "Set time module and lessons",
            //             message: err,
            //         });
            //     }
            //     course.content.map((element) => {
            //         if (element._id.toString() === moduleId) {
            //             element.moduleHours += hours;
            //             element.moduleMinutes += minutes;
            //             element.moduleSeconds += seconds;
            //             // course.save();
            //             element.moduleContent.map((element) => {
            //                 if (element._id.toString() === lessonId) {
            //                     element.lessonTime = hours + ":" + minutes + ":" + seconds;
            //                 }
            //             });
            //         }
            //     });
            //     course.save(err => {
            //         res.json(course);
            //     });
            // });
        } catch (e) {
            return res.status(500).json({ message: 'Send time error' });
        }
    }
}

module.exports = new courseContentController();
