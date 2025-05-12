import { Playlist } from '../models/playlists.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import mongoose, { isValidObjectId } from 'mongoose';
import { Video } from '../models/video.model.js';

const createPlaylist = asyncHandler(async (req,res)=>{
    const {name,description} = req.body;
    if(!name || !description){
        throw new ApiError(400,"name and description are required");
    }
    const playlist = await Playlist.create({
        name,
        description,
        owner: req.user?._id,
    });
    if(!playlist){
        throw new ApiError(500,"unable to create playlist");
    }
    return res
    .status(200)
    .json(new ApiResponse(200,playlist,"Playlist created successfully"))
});

const updatePlaylist = asyncHandler(async (req,res)=>{
    const { name, description } = req.body;
    const { playlistId } = req.params;
    if(!name || !description){
        throw new ApiError(400,"name and description are required");
    }
    if(!isValidObjectId(playlistId)){
        throw new ApiError(400,"Invalid playlist id");
    }
    const playlist = await Playlist.findById(playlistId);
    if(!playlist){
        throw new ApiError(404,"Playlist is not found");
    }
    if(playlist.owner.toString() !== req.user?._id.toString()){
        throw new ApiError(403,"You are not allowed to update this playlist");
    }
    const updatedPlaylist = await Playlist.findByIdAndUpdate(playlist?._id,{
        $set: {
            name,
            description,
        },

    },
    { new: true }
);
    return res
    .status(200)
    .json(new ApiResponse(200,updatedPlaylist,"playlist updated successfully"));
});

const deletePlaylist = asyncHandler(async (req,res)=>{
    const { playlistId } = req.params;
    if(!isValidObjectId(playlistId)){
        throw new ApiError(400,"Invalid playlist id");
    }
    const playlist = await Playlist.findById(playlistId);
    if(!playlist){
        throw new ApiError(404,"playlist is not found");
    }
    if(playlist.owner.toString() !== req.user?._id.toString()){
        throw new ApiError(403,"you are not allowed to delete this playlist");
    }
    await Playlist.findByIdAndDelete(playlist?._id);
    return res
    .status(200)
    .json(new ApiResponse(200,{},"playlist deleted successfully"));
});

const addVideoToPlaylist = asyncHandler(async (req,res)=>{
    const { videoId, playlistId } = req.params;
    if(!isValidObjectId(playlistId)&& !isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid playlist id or video id");
    }
    const playlist = await Playlist.findById(playlistId);
    const video = await Video.findById(videoId);
    if(!video){
        throw new ApiError(404,"video is not found");
    }
    if(!playlist){
        throw new ApiError(404,"playlist is not found");
    }
    if(playlist.owner.toString() !== req.user?._id.toString()){
        throw new ApiError(403,"you are not allowed to add video to this playlist");
    }
    const updatePlaylist = await Playlist.findByIdAndUpdate(playlistId,{
        $addToSet: {
            videos: videoId,
        }
    },
    { new: true }
);
if(!updatePlaylist){
    throw new ApiError(500,"unable to add video to playlist");
}
return res
.status(200)
.json(new ApiResponse(200,updatePlaylist,"video added to playlist successfully"))
});

const removeVideoFromPlaylist = asyncHandler(async (req,res)=>{
    const { videoId,playlistId } = req.params;
    if(!isValidObjectId(playlistId) && !isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid playlist id or video id");
    }
    const playlist = await Playlist.findById(playlistId);
    const video = await Video.findById(videoId);
    if(!video){
        throw new ApiError(404,"video is not found");
    }
    if(!playlist){
        throw new ApiError(404,"Playlist is not found");
    }
    if(playlist.owner.toString() !== req.user?._id.toString()){
        throw new ApiError(403,"you are not allowed to remove video from this playlist")
    }
    const updatedPlaylist = await Playlist.findByIdAndUpdate(playlist?._id,{
        $pull: {// remove the video from the playlist
            videos: videoId,
        }
    },{ new: true});
    if(!updatedPlaylist){
        throw new ApiError(500,"unable to remove video from playlist");
    }
    return res
    .status(200)
    .json(new ApiResponse(200,))
});

const getPlaylistById = asyncHandler(async (req,res)=>{
    const { playlistId } = req.params;
    if(!isValidObjectId(playlistId)){
        throw new ApiError(400,"Invalid playlist id");
    }

    const playlist = await Playlist.findById(playlistId);
    if(!playlist){
        throw new ApiError(404,"playlist is not found");
    }
    const playlistVideos = await Playlist.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(playlistId),
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "videos",
                foreignField: "_id",
                as: "playlistVideos",
            }
        },
        {
            $match: {
                "videos.isPublished": true,
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "ownerDetails"
            }
        },
        {
            $addFields: {
                totalVideos: {
                    $size: "$playlistVideos"
                },
                totalViews: {
                    $sum: "$playlistVideos.views",
                },
                owner: {
                    $first: "$ownerDetails"
                }
            }
        },
        {
            $project: {
                _id: 0,
                name: 1,
                description: 1,
                createdAt: 1,
                updatedAt: 1,
                totalVideos: 1,
                totalViews: 1,
                playlistVideos: {
                    _id: 1,
                    title: 1,
                    description: 1,
                    "videoFile.url": 1,
                    "thumbnail.url": 1,
                    duration: 1,
                    views: 1,
                    createdAt: 1
                },
                owner: {
                    username: 1,
                    fullname: 1,
                    "avatar.url": 1
                }
            }
        }
    ]);
    return res
    .status(200)
    .json(new ApiResponse(200,playlistVideos,"playlist fetched successfully"));
})

const getUserPlaylists = asyncHandler(async (req,res)=>{
    const { userId } = req.params;
    if(!isValidObjectId(userId)){
        throw new ApiError(400,"Invalid user id");
    };

    const playlists = await Playlist.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId),
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "videos",
                foreignField: "_id",
                as: "playlistVideos"
            }
        },
        {
            $addFields: {
                totalVideos: {
                    $size: "$playlistVideos"
                },
                totalViews: {
                    $sum: "$playlistVideos.views"
                }
            }
        },
        {
            $project: {
                _id: 1,
                name: 1,
                description: 1,
                updatedAt: 1,
                totalVideos: 1,
                totalViews: 1
            }
        },
    ]);
    return res
    .status(200)
    .json(new ApiResponse(200,playlists,"user playlists fetched successfully"));
});

export {
    createPlaylist,
    updatePlaylist,
    deletePlaylist,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    getPlaylistById,
    getUserPlaylists,
}