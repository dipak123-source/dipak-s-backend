import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import mongoose, {isValidObjectId} from "mongoose";
import { request } from "express";

const healthcheck = asyncHandler(async (req,res)=>{
    return res
    .status(200)
    .json(new ApiResponse(200, {message: "Everything is working fine"},"OK"));
});

export { healthcheck };