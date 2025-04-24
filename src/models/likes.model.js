import mongoose,{mongo, Schema, Types} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const likeSchema = new Schema(
    {
        comment: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        video: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        likeBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        tweet: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    }
    ,{timestamps: true});
likeSchema.plugin(mongooseAggregatePaginate);
export const Like = mongoose.model("Like",likeSchema);