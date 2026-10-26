import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
    {
        fullname: {
            type: String,
            required: [true, 'Fullname is required'],
            trim: true
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true
        },
        password: {
            type: String,
            required: [true, 'Password is required']
        },
        role: {
            type: String,
            enum: ['Student', 'Warden', 'Technician'],
            default: 'Student'
        },
        hostel: {
            type: String,
            enum: ['Neeladri Hostel', 'Velankani Hostel'],
            default: 'Neeladri Hostel'
        },
        roomNumber: {
            type: String,
            trim: true,
            default: ''
        },
        location: {
            type: String,
            required: [true, 'Hostel block & room location is required'],
            trim: true
        },
        phone: {
            type: String,
            trim: true,
            default: ''
        },
        specialization: {
            type: String,
            trim: true,
            default: ''
        }
    },
    {
        timestamps: true,
        toJSON: {
            transform: (doc, ret) => {
                delete ret.password;
                return ret;
            }
        },
        toObject: {
            transform: (doc, ret) => {
                delete ret.password;
                return ret;
            }
        }
    }
);

const User = mongoose.model('User', userSchema);
export default User;
