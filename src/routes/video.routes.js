import { upload } from "../middlewares/multer.middleware.js";
import { Router } from "express";
import { verifyJWT } from "../middlewares/Auth.middleware.js";
import { getAllvideo,deleteVideo,getVideoById,updateVideo,publicshAVideo,togglePublishStatus } from "../controllers/video.controllers.js";

const router = Router();
