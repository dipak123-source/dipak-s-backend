import mongoose, { mongo } from "mongoose";
import { Comments } from "../models/comments.model.js";
import { video, video } from "../models/video.model.js";
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
                likesCount: {
                    $size: "$likes"
                },
                owner: {
                    $first: "$owner"
                },
                isLiked: {
                    $cond: {
                        if: {
                            $in: [req.user?._id,"$likes.likedBy"]
                        },
                        then: true,
                        else: false,
                    }
                }
            }
        },
        {
            $sort: {
                createdAt: -1 // sort by creation date in descending order
            }
        },
        {
            $project: {
                content: 1,
                createdAt: 1,
                likesCount: 1,
                owner: {
                    username: 1,
                    fullname: 1,
                    "avatar.url": 1,
                },
                isLiked: 1,
            }
        }
    ]);
    const options = {
        page: parseInt(page),
        limit: parseInt(limit),
    };
    const comments = await Comment.aggregatePaginate(
        commentAggregate,
        options
    );
    return res
    .status(200)
    .json(new ApiResponse(200, "comments fetched successfully"));
});

const addComment = asyncHandler(async (req,res)=>{
    const {videoId} = req.params;
    const {content} = req.body;

    if(!content){
        throw new ApiError(400, "comment content is required");
    }
    const video = await video.findById(videoId);
    if(!video){
        throw new ApiError(404, "video not found");
    }
    const comment = await comment.create({
        content,
        video: videoId,
        owner: req.user?._id,
    });

    if(!comment){
        throw new ApiError(500,"unable to add comment");
    }
    return res
    .status(201)
    .json(new ApiResponse(201, comment, "comment added successfully"));
});

const updateComment = asyncHandler(async (req,res)=>{
    const {commentId} = req.params;
    const {content} = req.body;
    if(!content){
        throw new ApiError(400,"comment content is required to update");
    }
    const comment = await Comment.findById(commentId);
    if(!comment){
        throw new ApiError(404,"comment not found");
    }
    if(comment.owner.toString() !== req.user?._id.toString()){
        throw new ApiError(403,"You are not allowed to update this comment");
    }

    const updatedComment = await Comment.findByAndUpdate(comment?._id,
        {
            $set: {
                content,
            }
        },
        { new: true }
    );
    if(!updatedComment){
        throw new ApiError(500,"Failed to edit comment please try again");
    }
    return res
    .status(200)
    .json(new ApiResponse(200, updateComment, "comment updated successfully"));
});

// deleteComment
const deleteComment = asyncHandler(async (req,res)=>{
    const {commentId} = req.params;

    const comment = await Comment.findById(commentId);
    if(!comment){
        throw new ApiError(404,"comment not found");
    }
    if(comment.owner.toString() !== req.user?._id.toString()){
        throw new ApiError(403,"You are not allowed to delete this comment");
    }

    await Comment.findByAndDelete(commentId);

    await Like.deleteMany({
        comment: commentId,
        likedBy: req.user
    });
    return res
    .status(200)
    .json(new ApiResponse(200, {commentId}, "comment deleted successfully"));
});

export { getVideoComments, addComment, updatedComment, deleteComment};