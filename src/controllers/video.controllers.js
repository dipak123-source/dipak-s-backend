import { Video } from "../models/video.model.js";// only user are dealing with database
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import multer from "multer";
import mongoose from "mongoose";
import { User } from "../models/user.model";

const getAllvideo = asyncHandler(async(req,res)=>{
    const {page =1, limit=10,query,sortBy, sortType, userId } = req.query;
    console.log(userId);
    const pipeline = [];
    
})

const publicshAVideo = asyncHandler(async(req,res)=>{
    const { title, description } = req.body;

})
const getVideoById = asyncHandler(async(req,res)=>{
    const {videoId} = req.params;
})
const updateVideo = asyncHandler(async(req,res)=>{
    const {videoId} = req.params;
})
const deleteVideo = asyncHandler(async(req,res)=>{
    const {videoId} = req.params;
})
const togglePublishStatus = asyncHandler(async(req,res)=>{
    const {videoId} = req.params;
})
export {
    getAllvideo,
    publicshAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}