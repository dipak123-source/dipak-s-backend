import mongoose, {isValidObjectId} from "mongoose";
import { Like } from "../models/likes.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res)=>{
    const { videoId } = req.params;
    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid video id")
    }
    const likedAlready = await Like.findOne({
        video: videoId,
        likeBy: req.user._id
    })
    if(likedAlready){
        await Like.findByIdAndDelete(likedAlready._id);
        return res
        .status(200)
        .json(new ApiResponse(200,"video unliked successfully"))
    }
    await Like.create({
        video: videoId,
        likeBy: req.user?._id,
    });

    return res
    .status(200)
    .json(new ApiResponse(200,{ isLiked: true}));
});

const toggleCommentLike = asyncHandler(async (req, res)=>{
    const { commentId } = req.params;
    if(!isValidObjectId(commentId)){
        throw new ApiError(400,"Invalid comment id")
    }
    const likedAlready = await Like.findOne({
        comment: commentId,
        likeBy: req.user._id
    });
    if(likedAlready){
        await Like.findByIdAndDelete(likedAlready?._id);

        return res
        .status(200)
        .json(new ApiResponse(200,{ isLiked: false}))
    }
    await Like.create({
        comment: commentId,
        likeBy: req.user?._id,
    })
    return res
    .status(200)
    .json(new ApiResponse(200,{ isLiked: true}))
})

const toggleTweetLike = asyncHandler(async (req,res)=>{
    const { tweetId } = req.params;
    if(!isValidObjectId(tweetId)){// check if the twwetId is valid or not
        throw new ApiError(400,"Invalid tweet id")
    }
});

const getLikedVideos = asyncHandler(async (req, res)=>{
    const likedVideosAggegate = await like.aggregate([
        {
            $match: {
                likeBy: new mongoose.Types.ObjectId(req.user?._id),
            },
        },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "likedVideo",
                pipeline: [
                    {
                        $lookup: {
                          from: "users",
                          localField: "owner",
                          foreignField: "_id",
                          as: "ownerDetails",
                        },
                    },
                    {
                        $unwind: "$ownerDetails"
                    },
                ],
            },
        },
        {
            $unwind: "$likedVideo",
        },
        {
            $sort: {
                createdAt: -1,
            },
        },
        {
            $project: {
                _id: 0,
                likedVideo: {
                    _id: 1,
                    "videoFile.url": 1,
                    "thumbanail.url": 1,
                    owner: 1,
                    title: 1,
                    description: 1,
                    views: 1,
                    createdAt: 1,
                    isPublished: 1,
                    ownerDetails: {
                        username: 1,
                        fullname: 1,
                        "avatar.url": 1
                    },
                },
            },
        },
    ]);
    return res
    .status(200)
    .json(new ApiResponse(200, likedVideosAggegate,"Liked videos fetched successfully"))
})
