const Router = require('express');
const router = new Router();
const authMiddleWare = require('../middleware/auth.middleware');
const UserController = require('../controller/userController');

router.put('/change-info', authMiddleWare, UserController.update);
router.post('/shopping-cart', authMiddleWare, UserController.shoppingCart);
router.post('/purchased-courses', authMiddleWare, UserController.purchasedCourses);
router.post('/avatar', authMiddleWare, UserController.uploadAvatar);
router.get('/find', authMiddleWare, UserController.findUsers);

module.exports = router;
