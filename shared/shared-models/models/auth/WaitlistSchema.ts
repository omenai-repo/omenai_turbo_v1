import mongoose, {Schema, Model} from "mongoose";
import {WaitListTypes} from "@omenai/shared-types";
import {v4 as uuidv4} from "uuid"
import {generateAlphaDigit} from "@omenai/shared-utils/src/generateToken";


const waitlistSchema = new Schema<WaitListTypes>({
    name: {type: String, required: true},
    email: {type: String, required: true},
    inviteCode: {type: String, default: () => generateAlphaDigit(8)},
    isInvited: {type: Boolean, default: false},
    referrerKey: {type: String},
    waitlistId: {type: String, default: () => uuidv4()},
    entity: {type: String, required: true},
    discount: {type: Schema.Types.Mixed, default: {plan: "pro", active: false, redeemed: false}}
}, { timestamps: true });

export const Waitlist =
    mongoose.models.Waitlist || mongoose.model("Waitlist", waitlistSchema);