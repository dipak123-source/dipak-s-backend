import { Router } from "express";
import { verifyJWT } from "../middlewares/Auth.middleware.js";
import { toggleVideoLike, toggleCommentLike, toggleTweetLike, getLikedVideos } from "../controllers/video.controllers";

const router = Router();
router.use(verifyJWT);// this middleware will be applied to all routes in this router
router.route("/toggle/like/:videoId").post(toggleVideoLike);
router.route("/toggle/c/:commentId").post(toggleCommentLike);
router.route("/toggle/t/:tweetId").post(toggleTweetLike);
router.route("/videos").get(getLikedVideos);

export default router;