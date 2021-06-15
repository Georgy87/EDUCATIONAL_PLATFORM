const Router = require('express');
const router = new Router();
const authMiddleWare = require('../middleware/auth.middleware');
const UserController = require('../controller/userController');
const decorator = require('../middleware/decorator');

router.put('/change-info', authMiddleWare, decorator(UserController.update));
router.post('/shopping-cart', authMiddleWare, UserController.shoppingCart.bind(UserController));
router.post('/purchased-courses', authMiddleWare, UserController.purchasedCourses.bind(UserController));
router.post('/avatar', authMiddleWare, decorator(UserController.uploadAvatar));
router.get('/find', authMiddleWare, UserController.findUsers.bind(UserController));

module.exports = router;
