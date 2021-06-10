const Router = require('express');
const router = new Router();
const authMiddleWare = require('../middleware/auth.middleware');
const UserController = require('../controller/userController');
const loginValidation = require('../utils/validations/validations.middleware');
const lastSeenMiddleware = require('../middleware/updateLastSeen.middleware');

router.post('/registration', loginValidation, UserController.registration.bind(UserController));
router.get('/verify', UserController.verify.bind(UserController));
router.post('/login', UserController.login);
router.get('/auth', authMiddleWare, lastSeenMiddleware, UserController.auth.bind(UserController));
router.put('/change-info', authMiddleWare, UserController.update);
router.post('/shopping-cart', authMiddleWare, UserController.shoppingCart);
router.post('/purchased-courses', authMiddleWare, UserController.purchasedCourses);
router.post('/avatar', authMiddleWare, UserController.uploadAvatar);
router.get('/find', authMiddleWare, UserController.findUsers);

module.exports = router;
