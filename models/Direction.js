const { Schema, model, ObjectId } = require('mongoose');
const Direction = new Schema({
    name: { type: String, required: true },
    user: { type: ObjectId, ref: 'User' },
    direction: { type: String },
});
module.exports = model('Direction', Direction);
