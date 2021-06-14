const Router = require('express');
const router = new Router();
const authMiddleWare = require('../middleware/auth.middleware');
const UserController = require('../controller/userController');

router.put('/change-info', authMiddleWare, UserController.update.bind(UserController));
router.post('/shopping-cart', authMiddleWare, UserController.shoppingCart.bind(UserController));
router.post('/purchased-courses', authMiddleWare, UserController.purchasedCourses.bind(UserController));
router.post('/avatar', authMiddleWare, UserController.uploadAvatar.bind(UserController));
router.get('/find', authMiddleWare, UserController.findUsers.bind(UserController));

module.exports = router;
