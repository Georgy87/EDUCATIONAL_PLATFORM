const Router = require('express');
const router = new Router();
const authMiddleWare = require('../middleware/auth.middleware');
const courseContentController = require('../controller/courseContentController');

router.post(
    '/content',
    authMiddleWare,
    courseContentController.uploadContentCourseNew,
);
router.get(
    '/courses',
    authMiddleWare,
    courseContentController.getContentCourses,
);
router.post(
    '/lesson-upload',
    authMiddleWare,
    courseContentController.uploadLesson,
);
router.post(
    '/lesson-delete',
    authMiddleWare,
    courseContentController.deleteLesson,
);
router.post(
    '/lesson',
    authMiddleWare,
    courseContentController.lessonTitleRevision,
);
router.post(
    '/link',
    authMiddleWare,
    courseContentController.sendLinksToResources,
);
router.post(
    '/time',
    authMiddleWare,
    courseContentController.setTimeModuleAndLessons,
);
router.get(
    '/all-teacher-courses',
    authMiddleWare,
    courseContentController.getAllTeacherCourses,
);

module.exports = router;
