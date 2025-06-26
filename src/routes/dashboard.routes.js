import { Router } from "express";
import { verifyJWT } from "../middlewares/Auth.middleware.js";
import {
    getChannelStats,
    getChannelVideos,
} from "../controllers/dashboard.controllers.js";

const router = Router();

router.use(verifyJWT); // Apply verifyJWT middleware to all routes in the 
router.route("/stats").get(getChannelStats);
router.route("/videos").get(getChannelvideos);

export default router;