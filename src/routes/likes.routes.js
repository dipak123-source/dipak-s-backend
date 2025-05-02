import { Router } from "express";
import { verifyJWT } from "../middlewares/Auth.middleware.js";
import router from "./video.routes";
import { togglePublishStatus } from "../controllers/video.controllers";

const route = Router();
router.use(verifyJWT);// this middleware will be applied to all routes in this router
router.route("/toggle/like/:videoId").post(toggleVideoLike);
router.route("/toggle/c/:commentId").post(toggleCommentLike);
router.route("/toggle/t/:tweetId").post(toggleTweetLike);
router.route("/videos").get(getLikedVideos);

export default router;