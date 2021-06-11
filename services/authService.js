const jwt = require('jsonwebtoken');
const { validationResult } = require('../utils/validationsResult');
const config = require('config');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { sendConfirmEmail } = require('../utils/sendConfirmEmail');

class AuthService {
    async registration(req, res) {
        validationResult(req, res);

        const { email, password, name, surname, teacher } = req.body;

        const candidate = await User.findOne({ email, name });

        if (candidate) {

            return res
                .status(400)
                .json({ message: `User with email ${email} alredy exist` });
        }

        const hashPassword = await bcrypt.hash(password, 8);

        const user = new User({
            email: email,
            password: hashPassword,
            name: name,
            surname: surname,
            teacher: teacher,
            competence: '',
            shoppingCart: [],
            purchasedCourses: [],
        });

        user.confirm_hash = await bcrypt.hash(new Date().toString(), 8);

        const data = await user.save();
        sendConfirmEmail(data, email);
    }

    async auth(req, res) {
        const user = await User.findOne({ _id: req.user.id }).select('-password');
        const toke = jwt.sign({ id: user.id }, config.get('secretKey'), {
            expiresIn: '100h',
        });
        
        return { token, user };
    }

    async verify(req, res) {
        const hash = req.query.hash;

        if (!hash) return res.status(422).json({ errors: 'Invalid hash!' });
    
        const user = await User.findOne({ confirm_hash: hash }).exec();

        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'Hash not found',
            });
        } 

        user.confirmed = true;
        user.save();
        res.json({
            status: 'success',
            message: 'Аккаунт успешно подтвержден!',
        });
    }
}

const authService = new AuthService();
module.exports = authService;