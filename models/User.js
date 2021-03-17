const { Schema, model } = require("mongoose");

const { differenceInMinutes, parseISO } = require("date-fns");

const User = new Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    surname: { type: String },
    avatar: { type: String },
    teacher: { type: Boolean },
    competence: { type: String },
    shoppingCart: { type: Array },
    purchasedCourses: { type: Array },
    confirm_hash: String,
    last_seen: {
        type: Date,
        default: new Date(),
    },
},
    {
        timestamps: true,
    }
);

User.virtual("isOnline").get(function () {
    return differenceInMinutes(parseISO(new Date().toISOString()), this.last_seen) < 2;
});

User.set("toJSON", {
    virtuals: true
});

module.exports = model("User", User);
