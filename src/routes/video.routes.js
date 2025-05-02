import { upload } from "../middlewares/multer.middleware.js";
import { Router } from "express";
import { verifyJWT } from "../middlewares/Auth.middleware.js";
import { getAllvideo,
    deleteVideo,
    getVideoById,
    updateVideo,
    publicshAVideo,
    togglePublishStatus } from "../controllers/video.controllers.js";

const router = Router();
router.route("/")// this is the base route for the video routes
.get(getAllvideo)// this sets the route for getting all videos
.post(verifyJWT,// it ensures that only authenticated users can access this route
     upload.fields([// this is from multer, a middleware for handling multipart/form-data, which is primarily
        { name: "thumbnail", maxCount: 1},
        { name: "videoFile", maxCount: 1}
    ]),
     publicshAVideo
    );

router
.route("/v/:videoId")
.get(verifyJWT,getVideoById)
.delete(verifyJWT,deleteVideo)
.patch(verifyJWT,upload.single("thumbnail"),updateVideo)

router.route("/toggle/publish/:videoId").patch(verifyJWT,togglePublishStatus);
export default router;