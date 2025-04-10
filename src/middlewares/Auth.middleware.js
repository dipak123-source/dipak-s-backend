import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import Jwt from "jsonwebtoken"
import { User } from "../models/user.model";

export const verifyJWT = asyncHandler(async(req,resizeBy,next)=>{
   try {
     const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer","");
 
     if(!token){
         throw new ApiError(401,"Unauthorised request")
     }
     const decodedToken = Jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
     const user = await User.findById(decodedToken?._id).select("-password -refreshToken");
 
     if(!user){
         // NEXT_VIDEO: discuss about frontend
         throw new ApiError(401,"Invalid Access Token")
     }
 
     req.user = user;
     next()
   } catch (error) {
    throw new ApiError(404,error?.message || "Invalid access token")
   }
})