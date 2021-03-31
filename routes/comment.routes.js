const Router = require("express");
const commentsController = require("../controller/commentsController");
const router = new Router();
const authMiddleWare = require("../middleware/auth.middleware");

router.post("/comment", authMiddleWare, commentsController.createCommentNew);
router.post("/comment/answer",  authMiddleWare, commentsController.createReplyToCommentNew);
router.get("/comment",  commentsController.getCommentsForCourse);
router.get("/comment/answer", authMiddleWare, commentsController.getReplyToCommentNew);

module.exports = router;