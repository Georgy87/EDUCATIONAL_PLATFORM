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
            const { token, user } = await this.authService.login(req, res);
            return res.json({ status: 'success', token, user });
        } catch (e) {
            console.log(e);
        }
    }

    async auth(req, res) {
        try {
            const { token, user } = await this.authService.auth(req, res);
            return res.json({ token, user });
        } catch (error) {
            console.log(e);
        }
    }
}

module.exports = new AuthController();