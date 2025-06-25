import mongoose, { mongo } from "mongoose";
import { Comments } from "../models/comments.model.js";
import { video } from "../models/video.model.js";
import { Like } from "../models/likes.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

//get all comments for a video
const getVideoComments = asyncHandler(async (req, res)=>{
    const {videoId} = req.params;
    const {page = 1, limit = 10} = req.query;
    const video = await video.findById(videoId);
    if(!video){
        throw new ApiError(404,"video not found");
    }
    const commentAggregate = Comment.aggregate([
        {
            $match: {
                video: new mongoose.Types.ObjectId(videoId),
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "Owner"
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "comment",
                as: "likesDetails",
            }
        },
        {
            $addFields: {
                
            }
        }
    ])
})