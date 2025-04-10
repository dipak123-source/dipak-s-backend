import { User } from "../models/user.model.js";// only user are dealing with database
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const generateAccessAndRefreshTokens = async(userId)=>{
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false})

        return {accessToken, refreshToken}
    } catch (error) {
        throw new (500,"Something went wrong while generating refresh and access token");
    }
}

const registerUser = asyncHandler( async (req,res)=>{
    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return response
    const {fullname, email, username, password} = req.body// it has been destructured
    console.log("email:",email);

    if(
        [fullname, email, username, password].some((field)=>
            field?.trim() === ""
        )
    ){
        throw new ApiError(400, "All fields are required")
    }
    
    const existedUser = await User.findOne({
        $or: [{username: username.toLowerCase()},{email: email.toLowerCase()}]
    })
    if (existedUser){
        throw new ApiError(409, "user with email or username already exists")
    }
    let avatarLocalPath;
    let coverImageLocalPath;
    //const avatarLocalPath = req.files?.avatar[0]?.path;
    //const coverImageLocalPath = req.files?.coverImage[0]?.path;
    if(req.files && Array.isArray(req.files.avatar) && req.files.avatar.length > 0){
        avatarLocalPath = req.files.avatar[0].path
    }
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path
    }
    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar file is required for avatarLocalPath")
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    if(!avatar){
        throw new ApiError(400, "Avatar file is required");
    }
    if(!coverImage){
        throw new ApiError(400, "coverImage is required");
    }

    const users = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username
    })

    const createdUser = await User.findById(users._id).select(
        "-password -refreshToken"
    )
    if(!createdUser){
        throw new ApiError(500,"Something went wrong while registering the user");
    }
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )
})

const loginUser = asyncHandler( async (req,res)=>{
    // req body-> data
    // username or email
    // find the username
    // password check
    // access and refresh token
    // access token and refresh token should be passed through the cookies
    const {email,username,password} = req.body

    if(!(username || email)){
        throw new ApiError(400, "Username or password is required")
    }

    const user = await User.findOne({//"or,AND,COMMENT,NOR" these all are the operators of mongodb.
        $or: [{username},{email}]
    })

    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new ApiError(401,"Invalid user credentials")
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")// it is used to find a single document in MONGODB collection by its id
    const options = {// it is an designed options for cookies
        httpOnly: true,
        secure: true
    }
    return res
    .status(200)
    .cookie("accessToken",accessToken, options)
    .cookie("refreshToken",refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser, accessToken,refreshToken
            },
            "User logged In Successfully"
        )
    )
})
const logOutUser = asyncHandler(async(req,res)=>{
    User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )
    const options = {// it is an designed options for cookies
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken",accessToken, options)
    .clearCookie("refreshToken",refreshToken, options)
    .json(new ApiResponse(200, {},"User logged Out"))
})
export {registerUser,loginUser,logOutUser}