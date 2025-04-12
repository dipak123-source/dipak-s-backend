 import { Router } from "express";
 import { loginUser, logOutUser, registerUser,refreshAccessToken} from "../controllers/user.controllers.js";
 import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/Auth.middleware.js";

 const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1 
        }
    ]),
    registerUser
)
router.route("/logIn").post(loginUser);

//secured routes
router.route("/logOut").post(verifyJWT,logOutUser);
router.route("/refresh-token").post(refreshAccessToken);
 export default router