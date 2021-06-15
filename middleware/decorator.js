const UserController = require('../controller/userController');

const decorator = (fn) => async (req, res, next) => {
    await fn.call(UserController, req, res);
    return Promise.resolve(fn(req, res, next)).catch(next);
}

module.exports = decorator;


