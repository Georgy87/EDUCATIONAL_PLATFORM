const Router = require('express');
const router = new Router();
const authMiddleWare = require('../middleware/auth.middleware');
const UserController = require('../controller/userController');
const AuthController = require('../controller/authController');
const loginValidation = require('../utils/validations/validations.middleware');
const lastSeenMiddleware = require('../middleware/updateLastSeen.middleware');

router.post('/registration', loginValidation, AuthController.registration.bind(AuthController));
router.get('/verify',  AuthController.verify.bind(AuthController));
router.post('/login', AuthController.login);
router.get('/auth', authMiddleWare, lastSeenMiddleware, AuthController.auth.bind(UserController));

router.put('/change-info', authMiddleWare, UserController.update);
router.post('/shopping-cart', authMiddleWare, UserController.shoppingCart);
router.post('/purchased-courses', authMiddleWare, UserController.purchasedCourses);
router.post('/avatar', authMiddleWare, UserController.uploadAvatar);
router.get('/find', authMiddleWare, UserController.findUsers);

module.exports = router;
