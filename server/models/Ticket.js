import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema(
    {
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Student ID reference is required']
        },
        title: {
            type: String,
            required: [true, 'Ticket title is required'],
            trim: true
        },
        description: {
            type: String,
            required: [true, 'Ticket description is required'],
            trim: true
        },
        category: {
            type: String,
            enum: ['Plumbing', 'Electrical', 'IT', 'Housekeeping'],
            required: [true, 'Category is required']
        },
        status: {
            type: String,
            enum: ['Open', 'Assigned', 'Awaiting-Student-Reply', 'Resolved'],
            default: 'Open'
        },
        priority: {
            type: String,
            enum: ['Low', 'Medium', 'High', 'Critical'],
            default: 'Medium'
        },
        slaDeadline: {
            type: Date,
            required: true,
            default: () => new Date(Date.now() + 24 * 60 * 60 * 1000)
        },
        slaPausedAt: {
            type: Date,
            default: null
        },
        slaRemainingMs: {
            type: Number,
            default: null
        },
        slaBreached: {
            type: Boolean,
            default: false
        },
        breachedAt: {
            type: Date,
            default: null
        },
        resolvedAt: {
            type: Date,
            default: null
        },
        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null
        },
        hostel: {
            type: String,
            enum: ['Neeladri Hostel', 'Velankani Hostel'],
            default: 'Neeladri Hostel'
        },
        locationSnapshot: {
            type: String,
            default: ''
        },
        attachments: [
            {
                url: { type: String, required: true },
                filename: { type: String, required: true },
                fileType: { type: String, default: '' },
                size: { type: Number, default: 0 },
                publicId: { type: String, default: '' }
            }
        ],
        escalationHistory: [
            {
                escalatedAt: { type: Date, default: Date.now },
                oldPriority: String,
                newPriority: String,
                reason: String
            }
        ]
    },
    {
        timestamps: true
    }
);

// Virtual to check if SLA is currently breached dynamically
ticketSchema.virtual('isCurrentlyBreached').get(function () {
    if (this.status === 'Resolved') return false;
    if (this.slaPausedAt) return false;
    return new Date() > this.slaDeadline;
});

ticketSchema.set('toJSON', { virtuals: true });
ticketSchema.set('toObject', { virtuals: true });

const Ticket = mongoose.model('Ticket', ticketSchema);
export default Ticket;
