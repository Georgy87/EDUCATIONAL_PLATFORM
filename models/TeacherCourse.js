const { Schema, model, ObjectId } = require('mongoose');
const TeacherCourse = new Schema(
    {
        user: { type: ObjectId, ref: 'User' },
        photo: { type: String },
        profession: { type: String },
        competence: { type: String },
        author: { type: String },
        price: { type: String },
        smallDescription: { type: String },
        fullDescription: { type: String },
        user: { type: ObjectId, ref: 'User' },
        avatar: { type: String },
        content: [
            { type: Schema.Types.ObjectId, ref: 'Modules', require: true },
        ],
        courseUsers: { type: Array },
        courseLessonsVideo: { type: Array },
        lessonVideo: { type: String, require: true },
        courseTest: [
            {
                questionText: String,
                answerOptions: [
                    {
                        answerText: String,
                        isCorrect: Boolean,
                    },
                ],
            },
        ],
    },
    {
        timestamps: true,
    },
);
module.exports = model('TeacherCourse', TeacherCourse);
