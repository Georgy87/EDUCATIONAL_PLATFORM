const User = require('../models/User');
const TeacherCourse = require('../models/TeacherCourse');
const jwt = require('jsonwebtoken');
const config = require('config');
const Uuid = require('uuid');
const path = require('path');
const DialogModel = require('../models/Dialogs');
const UserService = require('../services/userService');
class UserController {
    constructor() {
        this.userService = UserService;
    }

    async update(req, res) {
        try {
            const user = await User.findOne({ _id: req.user.id });

            const { name, surname, professionalСompetence } = req.body;
            user.name = name;
            user.surname = surname;
            user.competence = professionalСompetence;

            user.save(async (err) => {
                if (err) {
                    return res.status(404).json({
                        status: 'Error update user info',
                        message: err,
                    });
                }

                await TeacherCourse.updateMany(
                    { user: req.user.id },
                    { $set: { author: name + ' ' + surname } },
                ).exec();

                res.json({
                    status: 'success',
                    message: 'Update user info',
                });
            });
        } catch (e) {
            console.log(e);
            res.send({ message: 'User change info error' });
        }
    }

    async shoppingCart(req, res) {
        try {
            const shoppingCart = req.query.shoppingCartId;
            const user = await User.findOne({ _id: req.user.id });
            user.shoppingCart = Array.from(
                new Set(user.shoppingCart.concat(shoppingCart)),
            );
            user.save((err) => {
                if (err) {
                    return res.status(404).json({
                        status: 'Error add course for shopping cart',
                        message: err,
                    });
                }

                res.json({
                    status: 'success',
                    message: 'Add course for shopping cart',
                });
            });
        } catch (error) {
            res.send({ message: 'User shopping cart error' });
        }
    }

    async purchasedCourses(req, res) {
        try {
            const purchasedCoursesId = req.body.ids;

            const user = await User.findOne({ _id: req.user.id }).exec();

            user.purchasedCourses = Array.from(
                new Set(user.purchasedCourses.concat(purchasedCoursesId)),
            );

            user.save((err, userData) => {
                if (err) {
                    return res.status(404).json({
                        status: 'Error add Purchased courses',
                        message: err,
                    });
                }

                res.json({
                    status: 'success',
                    message: 'Purchased courses added',
                });
            });

            TeacherCourse.findOne({ _id: purchasedCoursesId }).exec(
                (err, course) => {
                    if (err) {
                        res.status(401).json({
                            status: 'Course not found',
                            message: err,
                        });
                    }

                    if (course.user != req.user.id) {
                        course.courseUsers = Array.from(
                            new Set(course.courseUsers.concat(req.user.id)),
                        );
                    }

                    DialogModel.findOne({ course: purchasedCoursesId }).exec(
                        (err, dialogData) => {
                            if (dialogData) {
                                dialogData.partner = course.courseUsers;
                                dialogData.save();
                            }
                        },
                    );

                    course.save();
                },
            );
        } catch (error) {
            res.send({ message: 'User add purchased courses error' });
        }
    }

    async uploadAvatar(req, res) {
        try {
            const file = req.files.file;

            const avatarName = Uuid.v4() + '.jpg';

            const Path = path.join(__dirname, `../static/avatars`);

            file.mv(Path + '/' + avatarName);

            const user = await User.findById(req.user.id);
            const token = jwt.sign({ id: user.id }, config.get('secretKey'), {
                expiresIn: '100h',
            });

            user.avatar = avatarName;
            user.save((err) => {
                if (err) {
                    return res.status(404).json({
                        status: 'Error upload avatar',
                        message: err,
                    });
                }

                // res.json({
                //     status: "success",
                //     message: "Upload avatar done",
                // });

                return res.json({
                    token,
                    user,
                });
            });
        } catch (e) {
            console.log(e);
            return res.status(500).json({ message: 'Upload avatar error' });
        }
    }

    findUsers = (req, res) => {
        const query = req.query.query;

        User.find()
            .or([
                { fullname: new RegExp(query, 'i') },
                { email: new RegExp(query, 'i') },
            ])
            .then((users) => res.json(users))
            .catch((err) => {
                return res.status(404).json({
                    status: 'error',
                    message: err,
                });
            });
    };
}

module.exports = new UserController();
