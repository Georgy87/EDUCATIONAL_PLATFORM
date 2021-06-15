const Router = require('express');
const router = new Router();
const AuthController = require('../controller/authController');
const loginValidation = require('../utils/validations/validations.middleware');
const lastSeenMiddleware = require('../middleware/updateLastSeen.middleware');
const authMiddleWare = require('../middleware/auth.middleware');


router.post('/registration', loginValidation, AuthController.registration.bind(AuthController));
router.get('/verify',  AuthController.verify.bind(AuthController));
router.post('/login', AuthController.login.bind(AuthController));
router.get('/auth', authMiddleWare, lastSeenMiddleware, AuthController.auth.bind(AuthController));

module.exports = router;