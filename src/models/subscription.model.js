import mongoose, { Schema } from "mongoose";
const SubscriptionSchema = Schema.mongoose({
    subscriber: {
        type: Schema.Types.ObjectId,// one who is subscribing
        ref: "User"
    },
    channel: {
        type: Schema.Types.ObjectId,// one to whom "subscribe" is subscribing
        ref:"User"
    },
},{timestamps: true});

export const Subscription = mongoose.model("Subscription",SubscriptionSchema);