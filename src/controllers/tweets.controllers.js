import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweets.model.js";

const createTweet = asyncHandler(async (req, res)=>{
    const { content } = req.body;
    if(!content){
        throw new ApiError(400,"content is required");
    }

    const tweet = await Tweet.create({
        content: content,
        owner: req.user?._id,
    })
    if(!tweet){
        throw new ApiError(500,"unable to create Tweet")
    }
    return res
    .status(200)
    .json(new ApiResponse(200, tweet,"Tweet created successfully"));
})
const updateTweet = asyncHandler(async (req,res)=>{
    const { content} = req.body;
    const { tweetId } = req.params;
    if(!content){
        throw new ApiError(400,"content is required to update tweet");
    }
    if(!isValidObjectId(tweetId)){
        throw new ApiError(400,"Invalid tweet id")
    }
    const tweet = await Tweet.findById(tweetId);
    if(!tweet){
        throw new ApiError(404,"Tweet is not found");
    }
    if(tweet.owner.toString() !== req.user?._id.toString()){
        throw new ApiError(403,"You are not allowed to update this tweet");
    }
    const newTweet = await Tweet.findByIdAndUpdate(tweetId,{
        $set: {
            content,
        },
    },
     {
        new: true,
     })
});
const deleteTweet = asyncHandler(async (req,res)=>{
    const { tweetId } = req.params;
    if(!isValidObjectId(tweetId)){
        throw new ApiError(400,"Invalid tweet id");
    }
    const tweet = await Tweet.findById(tweetId);
    if(!tweet){
        throw new ApiError(404,"Tweet is not found");
    }
    if(tweet.owner.toString() !== req.user?._id.toString()){
        throw new ApiError(403,"You are not allowed to delete this tweet");
    }
    await Tweet.findByIdAndDelete(tweetId);
    return res
    .status(200)
    .json(new ApiResponse(200,{tweetId},"Tweet deleted successfully"));
});
const getUserTweets = asyncHandler(async (req,res)=>{
    const { userId } = req.params;
    if(!isValidObjectId(userId)){
        throw new ApiError(400,"Invalid user id");
    }
    const tweets = await Tweet.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId),
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "ownerDetails",
                pipeline: [

                    {
                        $project: {
                            username: 1,
                            "avatar.url": 1,
                        },
                    },
                ],
            },
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "tweet",
                as: "likesDetails",
                pipeline: [
                    {
                        likedBy: 1,
                    },
                ],
            },
        },
        {
            $addFields: {
                likesCount: {
                    $size: "$likesDetails",
                },
                ownerDetails: {
                    $first: "ownerDetails",
                },
                isLiked: {
                    $cond: {
                        if: {
                            $in: [req.user?._id, "$likeDetails.likeBy"]
                        },
                        then: true,
                        else: false,
                    },
                },
            },
        },
        {
            $sort: {
                createdAt: -1,
            },
        },
        {
            $project: {
                content: 1,
                ownerDetails: 1,
                likesCount: 1,
                createdAt: 1,
                isLiked: 1,
            }
        }
    ])
    return res
    .status(200)
    .json(new ApiResponse(200, tweets,"User tweets fetched successfully"))
});

export {
    createTweet,
    updateTweet,
    deleteTweet,
    getUserTweets
}