const { Schema, model } = require("mongoose");

const CommentModel = new Schema({
    courseId: { type: String },
    text: { type: String },
    photo: { type: String },
    user: {
        required: true,
        ref: "User",
        type: Schema.Types.ObjectId,
    },
    created: {
        type: Date,
        default: Date.now
    },
    comments: [
        {
            text: { type: String },
            photo: { type: String },
            user: {
                required: true,
                ref: "User",
                type: Schema.Types.ObjectId,
                trim: true
            },
            created: {
                type: Date,
                default: Date.now
            },
        },
    ],
});

module.exports = model("Comments", CommentModel);