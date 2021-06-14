const jwt = require('jsonwebtoken');
const config = require('config');
const User = require('../models/User');
const path = require("path");
const Uuid = require("uuid");

class UserService {
    async update(req, res) {
        const { name, surname, professionalСompetence } = req.body;

        const user = await User.findOneAndUpdate({ _id: req.user.id }, {
            $set: {
                name,
                surname,
                competence: professionalСompetence,
            }
        });

        await user.save();
        await TeacherCourse.updateMany(
            { user: req.user.id },
            { $set: { author: name + ' ' + surname } },
        );
    }

    async shoppingCart(req, res) {
        const shoppingCart = req.query.shoppingCartId;
        const user = await User.findOneAndUpdate({ _id: req.user.id },
            {
                $addToSet: {
                    'shoppingCart': shoppingCart,
                }
            });

        await user.save();
    }

    async purchasedCourses(req, res) {
        const purchasedCoursesId = req.body.ids;

        const user = await User.findOneAndUpdate({ _id: req.user.id }, {
            $addToSet: {
                purchasedCourses: purchasedCoursesId,
            }
        });

        await user.save();

        const course = await TeacherCourse.findOne({ _id: purchasedCoursesId });

        if (course.user != req.user.id) {
            course.courseUsers = Array.from(
                new Set(course.courseUsers.concat(req.user.id)),
            );
            await course.save();
        }

        let chatDialog = await DialogModel.findOne({ course: purchasedCoursesId });
        chatDialog.partner = course.courseUsers;

        await chatDialog.save();

        course.save();
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
            await user.save();
            console.log(token);
            return {
                token,
                user,
            };
        } catch (error) {
            console.log('аватар')
        }
    }

    async findUsers(req, res) {
        const query = req.query.query;
        // Доработать
        const users = await User.find({
            $or([
                { fullname: new RegExp(query, 'i') }
            ])
        })
            // .or([
            //     { fullname: new RegExp(query, 'i') },
            //     { email: new RegExp(query, 'i') },
            // ]);
        return users;
    };
}

module.exports = new UserService();