import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
    {
        ticketId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Ticket',
            required: [true, 'Ticket ID reference is required']
        },
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Sender ID reference is required']
        },
        message: {
            type: String,
            required: [true, 'Comment message is required'],
            trim: true
        },
        isInternal: {
            type: Boolean,
            default: false // Staff-only internal notes hidden from students
        },
        attachments: [
            {
                url: { type: String, required: true },
                filename: { type: String, required: true },
                fileType: { type: String, default: '' },
                size: { type: Number, default: 0 },
                publicId: { type: String, default: '' }
            }
        ]
    },
    {
        timestamps: true
    }
);

const Comment = mongoose.model('Comment', commentSchema);
export default Comment;
