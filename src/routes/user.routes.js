 import { Router } from "express";
 import { loggedOut, loginUser, logOutUser, registerUser} from "../controllers/user.controllers.js";
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
);
router.route("/logInUser").post(loginUser);
router.route("/logOutUser").post(verifyJWT,logOutUser)
 export default router