const AuthService = require('../services/authService');

class AuthController {
    constructor() {
        this.authService = AuthService;
    }
    async registration(req, res) {
        try {
            this.authService.registration(req, res);
        } catch (e) {
            console.log(e);
        }
    }

    async verify(req, res) {
        try {
            this.authService.verify(req, res);
        } catch (e) {
            console.log(e);
        }
    }

    async login(req, res) {
        try {
            const { email, password } = req.body;
            const user = await User.findOne({ email });

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            const isPassValid = bcrypt.compareSync(password, user.password);

            const token = jwt.sign({ id: user.id }, config.get('secretKey'), {
                expiresIn: '1h',
            });

            if (isPassValid) {
                return res.json({
                    status: 'success',
                    token,
                    user: {
                        _id: user.id,
                        email: user.email,
                        name: user.name,
                        surname: user.surname,
                        avatar: user.avatar,
                        teacher: user.teacher,
                        competence: user.competence,
                        shoppingCart: user.shoppingCart,
                        purchasedCourses: user.purchasedCourses,
                    },
                });
            } else {
                return res.json({
                    status: 'error',
                    message: 'Incorrect password or email',
                });
            }
        } catch (e) {
            console.log(e);
            res.send({ message: 'Server error' });
        }
    }

    async auth(req, res) {
        const { token, user } = await this.authService.auth(req, res);
        return res.json({ token, user });
    }
}

module.exports = new AuthController();