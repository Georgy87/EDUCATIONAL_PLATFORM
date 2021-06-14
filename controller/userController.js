const UserService = require('../services/userService');
class UserController {
    constructor() {
        this.userService = UserService;
    }

    async update(req, res) {
        try {
            this.userService.update(req, res);
        } catch (e) {
            console.log(e);
        }
    }

    async shoppingCart(req, res) {
        try {
            this.userService.shoppingCart(req, res);
        } catch (e) {
            console.log(e)
        }
    }

    async purchasedCourses(req, res) {
        try {
            this.userService.purchasedCourses(req, res);
        } catch (e) {
            console.log(e);
        }
    }

    async uploadAvatar(req, res) {
        try {
            const { user, token } = await this.userService.uploadAvatar(req, res);

            return res.json({
                token,
                user,
            });
        } catch (e) {
            console.log(e);
        }
    }

    async findUsers(req, res) {
        try {
            const { users } = await this.userService.findUsers(req, res);
            return res.json(users);
        } catch (e) {
            console.log(e);
        }
    };
}

module.exports = new UserController();
