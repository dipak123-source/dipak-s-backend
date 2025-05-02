import { Video } from "../models/video.model.js";// only user are dealing with database
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import multer from "multer";
import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model";
import { getWatchHistory } from "./user.controllers.js";
import { Like } from "../models/likes.model.js";
import { Comments } from "../models/comments.model.js";

const getAllvideo = asyncHandler(async(req,res)=>{
    const {page =1, limit=10,query,sortBy, sortType, userId } = req.query;
    console.log(userId);
    const pipeline = [];
    if(query){
        pipeline.push({
            $search: {
                index: "search-video",
                text:{
                    query: query,
                    path: ["title","description"]
                }
            }
        })
    }
    if(userId){
        if(!mongoose.isValidObjectId(userId)){
            throw new ApiError(400,"Invalid userId");
        }
        pipeline.push({
            $match:{
                owner: new mongoose.Types.ObjectId(userId)
            }
        });
    }
    //fetch videos only that are set isPublished to true
    pipeline.push({
        $match:{
            isPublished: true
        }
    });
    //sort the video by the given field in ascending or descending order
    if(sortBy && sortType){
        pipeline.push({
            $sort:{
                [sortBy]: sortType === "asc" ? 1 : -1
            }
        });
    } else{
        pipeline.push({
            $sort:{
                createAt: -1// this will sort videos from newest to oldest if here 
            }
        });
    }
    pipeline.push({
        $lookup:{
            from: "users",
            localField: "owner",
            foregnField: "_id",
            as: "ownerDetails",
            pipeline: [
                {
                    $project:{
                        username: 1,
                        "avatar.url": 1,
                    }
                }
            ]
        }
    },
    {
        $unwind: "$ownerDetails"
    }
)
    const videoAggregate = video.aggregate(pipeline);
    const options = {
        page: parseInt(page,10),
        limit: parseInt(limit,10),
    };
    const videos = await video.aggregatePaginate(videoAggregate, options);

    return res
    .status(200)
    .json(new ApiResponse(200,video,"videos fetched successfully"))
})

const publicshAVideo = asyncHandler(async(req,res)=>{
    const { title, description } = req.body;
    if([title, description].some((field)=>field?.trim() === "")){
        throw new ApiError(400,"All fields are required");
    }
    const videoFileLocalPath = req.files?.videoFile[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail[0]?.path;
    if(!videoFileLocalPath){
        throw new ApiError(400,"videoFilePath is required")
    }
    if(!thumbnailLocalPath){
        throw new ApiError(400,"thumbnailLocalPath is required")
    }
    const videoFile = await uploadOnCloudinary(videoFileLocalPath);
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

    if(!videoFile){
        throw new ApiError(400,"video file is required");
    }
    if(!thumbnail){
        throw new ApiError(400,"thumbnail is required");
    }
    const video = await Video.create({
        title,
        description,
        duration: videoFile.duration,
        videoFile: {
            url: videoFile.url,
            public_id: videoFile.public_id
        },
        thumbnail: {
            url: thumbnail.url,
            public_id: thumbnail.public_id
        },
        owner: req.user?._id,
        isPublished: false
    });

    const videoUploaded = await Video.findById(video._id);

    if(!videoUploaded){
        throw new ApiError(500,"videoUpload failed please try again !!!");
    }
    return res
    .status(200)
    .json(new ApiResponse(200,video,"Video uploaded successfully"))
})
const getVideoById = asyncHandler(async(req,res)=>{
    const {videoId} = req.params;
    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid videoId")
    }
    if(!isValidObjectId(req.user?._id)){
        throw new ApiError(400,"Invalid userId");
    }

    const video = await Video.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $lookup: {
                from:"likes",
                localField: "_id",
                foregnField: "video",
                as: "likes",
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foregnField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $lookup: {
                            from: 'subscriptions',
                            localField: '_id',
                            foregnField: 'channel',
                            as: 'subscribers'
                        }
                    },
                    {
                        $addFields: {
                            subscriberCount: {
                                $size: "$subscribers"
                            }
                        },
                        isSubscribed: {
                            $cond: {
                                if: {
                                    $in: [req.user?._id, "$subscribers.subscriber"]
                                },
                                then: true,
                                else: false 
                            }
                        }
                    }
                ]
            }
        }
    ]);
    if(!video || video.length === 0){
        throw new ApiError(404,"video not found")
    };
     
    await Video.findByIdUpdate(videoId,{
        $inc: {
            view: 1
        }
    });

    await User.findByIdAndUpdate(req.user?._id,{
        $addToSet: {
            WatchHistory: videoId
        }
    })
    return res
    .status(200)
    .json(new ApiResponse(200,video[0],"video fetched successfully"))
})
const updateVideo = asyncHandler(async(req,res)=>{
    const {videoId} = req.params;
    const {title,description} = req.body;

    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid videoId")
    }

    if(!(title || description)){
        throw new ApiError(400,"title or description is required")
    }
    const video = await Video.findById(videoId);

    if(!video){
        throw new ApiError(404,"video is not found");
    }
    if(video.owner.toString() !== req.user._id.toString()){
        throw new ApiError(403,"You are not authorized to update this video");
    }
    // deleting old thumnail and updating new thumnail
    thumbnailDelete = video.thumbnail.public_id;
    const thumbnailLocalPath = req.files?.path;
    if(!thumbnailLocalPath){
        throw new ApiError(400,"thumbnail is required");
    }
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
    if(!thumbnail){
        throw new ApiError(400,"thumbnail is not found")
    }
    const updatedVideo = await Video.findByIdAndUpdate(videoId,{
        title,
        description,
        thumbnail: {
            url: thumbnail.url,
            public_id: thumbnail.public_id,
        }
    },
{
    new: true
});
    if(!updatedVideo){
        throw new ApiError(500,"video update failed please try again")
    }
    if(updateVideo){
        await deleteOnCloudinary(thumbnailDelete);
    }
    return res
    .status(200)
    .json(new ApiResponse(200,updateVideo,"video updated successfully"))
})
const deleteVideo = asyncHandler(async(req,res)=>{
    const {videoId} = req.params;
    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid videoId")
    }
    const video = await Video.findById(videoId);
    if(!video){
        throw new ApiError(404,"video is not found")
    }
    if(video.owner.toString() !== req.user._id.toString()){
        throw new ApiError(403,"You are not authorized to delete this video")
    }
    const videoToDelete = await Video.findByIdAndDelete(video?._id);
    if(!videoToDelete){
        throw new ApiError(500,"video delete failed please try again");
    }
    if(videoToDelete){
        await deleteOnCloudinary(video.thumbnail.public_id);// it would delete the thumbnail
        await deleteOnCloudinary(video.videoFile.public_id,"video");// it would delete the video from cloudinary
    }
    await Like.deleteMany({
        video: videoId
    })

    await Comments.deleteMany({
        video: videoId
    })
    return res
    .status(200)
    .json(new ApiResponse(200,videoToDelete,"video deleted successfully"))
})
const togglePublishStatus = asyncHandler(async(req,res)=>{
    const {videoId} = req.params;
    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid videoId")
    }
    const video = await Video.findById(videoId);
    if(!video){
        throw new ApiError(404,"video is not found in the database")
    }
    if(video.owner.toString() !== req.user._id.toString()){
        throw new ApiError(403,"You are not authorized to update this video")
    }
    const toggleVideoPublish = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                isPublished: !video?.isPublished
            }
        },
        {
            new: true
        }
    );
    if(!toggleVideoPublish){
        throw new ApiError(500,"video publish status update failed please try again")
    }
    return res
    .status(200)
    .json(new ApiResponse(200,toggleVideoPublish,"video publish status updated successfully"))
})
export {
    getAllvideo,
    publicshAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}