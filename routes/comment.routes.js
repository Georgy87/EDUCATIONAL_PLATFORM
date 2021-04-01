const Router = require("express");
const commentsController = require("../controller/commentsController");
const router = new Router();
const authMiddleWare = require("../middleware/auth.middleware");

router.post("/comment", authMiddleWare, commentsController.createComment);
router.post("/comment/answer",  authMiddleWare, commentsController.createReplyToComment);
router.get("/comment",  commentsController.getCommentsForCourse);
router.get("/comment/answer", authMiddleWare, commentsController.getReplyToComment);
router.delete("/comment", authMiddleWare, commentsController.deleteComment);

module.exports = router;