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
    
});

const getPlaylistById = asyncHandler(async (req,res)=>{

})

const getUserPlaylists = asyncHandler(async (req,res)=>{

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