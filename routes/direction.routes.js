const Router = require('express');
const router = new Router();
const authMiddleWare = require('../middleware/auth.middleware');
const directionController = require('../controller/directionController');

router.post('/upload', authMiddleWare, directionController.uploadDirection);
router.get('', directionController.getDirection);
router.get('/search', directionController.filterByDirection);
router.delete(
    '/',
    authMiddleWare,
    directionController.deleteDirectionAndCourses,
);

module.exports = router;
