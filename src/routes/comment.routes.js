import { Router } from "express";
import {
    addComment,
    deleteComment,
    getVideoComments,
    updateComment
} from "../controllers/comments.controllers.js";
import { verifyJWT } from "../middlewares/Auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.use(verifyJWT,upload.none()); // Apply verifyJWT middleware to all routers in this file
router.route("/:videoId").get(getVideoComments).post(addComment);
router.route("/c/:commentId").delete(deleteComment).patch(updateComment);

export default router;