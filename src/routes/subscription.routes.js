import { Router } from "express";
import { verifyJWT } from "../middlewares/Auth.middleware.js";
import { toggleSubscription,
    getUserChennelSubscribers,
    getSubscribedChannels,} from "../controllers/subscription.controller.js";
const router = Router();
router.use(verifyJWT);// this middleware will be applied to all routers to ensure that the user is authentication
router
.route("/c/:channelId")
.get(getUserChannelSubscribers)
.post(toggleSubscription)

router.route("/c/:channelId/notifications").get(getSubscribedChannels);

export default router;