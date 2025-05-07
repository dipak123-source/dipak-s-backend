import mongoose, {isValidObjectId} from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Subscription } from "../models/subscription.model.js";

const toggleSubscription = asyncHandler(async (req, res)=>{
    const { channelId } = req.params;
    if(!isValidObjectId(channelId)){
        throw new ApiError(400,"Invalid channel id");
    };
    const subscribedAlready = await subscribeChannel.findOne({
        subscriber: req.user?._id,
        channel: channelId,
    });
    if(subscribedAlready){
        await Subscription.findByIdAndDelete(subscribedAlready?._id);
        return res
        .status(200)
        .json(new ApiResponse(200, { subscribedAlready: false},"unsubscribed successfully"))
    };
    await Subscription.create({
        subscriber: req.user?._id,
        channel: channelId,
    });
    return res
    .status(200)
    .json(new ApiResponse(200, { subscribedAlready: true},"subscribed successfully"));
});

const getUserChennelSubscribers = asyncHandler(async (req,res)=>{
    const { channelId } = req.params;
    if(!isValidObjectId(channelId)){
        throw new ApiError(400,"Invalid channel is provided");
    };
    const subscribers = await Subscription.aggregate([
        {
            $match: {
                channel: channelId,
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "subscriberDetails",
                pipeline: [
                    {
                        $lookup: {
                            from: "subscriptions",
                            localField: "_id",
                            foreignField: "channel",
                            as: "subscribedToSubscribers",
                        },
                    },
                    {
                        $addFields: {
                            subscribedToSubscribers: {
                                $cond: {
                                    if: {
                                        $in: [channelId, "$subscribedToSubscriber.subscriber"]
                                    },
                                    then: true,
                                    else: false,
                                },
                            },
                            subscribersCount: {
                                $size: "$subscribedToSubscribers"
                            },
                        },
                    },
                ],
            },
        },
        {
            $unwind: "$subscriberDetails"
        },
        {
            $project: {
                _id: 0,
                subscriberDetails: {

                    _id: 1,
                    username: 1,
                    fullname: 1,
                    "avatar.url": 1,
                    subscribedToSubscribers: 1,
                    subscribersCount: 1,
                },
            },
        },
    ]);
    return res
    .status(200)
    .json(new ApiResponse(200, subscribers, "subscribers fetched successfully"));
});

const getSubscribedChannels = asyncHandler(async (req,res)=>{
    const { subscriberId } = req.params;
    if(!isValidObjectId(subscriberId)){
        throw new ApiError(400,"Invalid subscriber id provided");
    } 
    const subscribedChannels = await Subscription.aggregate([
        {
            $match: {
                subscriber: new mongoose.Types.ObjectId(subscriberId),
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "subscribedChannelDetails",
                pipeline: [
                    {
                        $lookup: {
                            from: "videos",
                            localField: "_id",
                            foreignField: "owner",
                            as: "channelVideos"
                        },
                    },
                    {
                        $addFields: {
                            latestVideo: {
                                $last: "$channelVideos"
                            },
                        },
                    },
                ],
            },
        },
        {
            $unwind: "$subscribedChannelDetails",
        },
        {
            $project: {
                _id: 0,
                subscribedChannelDetails: {
                    _id: 1,
                    username: 1,
                    fullname: 1,
                    "avatar.url": 1,
                    latestVideo: {
                        _id: 1,
                        title: 1,
                        "thumbnail.url": 1,
                        "videoFile.url": 1,
                        username: 1,
                        fullname: 1,
                        description: 1,
                        duration: 1,
                        createdAt: 1,
                        views: 1
                    }
                }
            }
        }
    ]);
    return res
    .status(200)
    .json(new ApiResponse(200, subscribedChannels, "subscribed channels fetched successfully"))
});
export {
    toggleSubscription,
    getUserChennelSubscribers,
    getSubscribedChannels,
}