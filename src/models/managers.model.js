import mongoose from 'mongoose';

const managerSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: true
    },
    admin_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: true
    },
    max_users: {
        type: Number,
        required: true
    },
    current_user_count: {
        type: Number,
        default: 0
    },
    isBlocked: {
        type: Boolean,
        default: false
    }

}, { timestamps: true });

export default mongoose.model('Manager', managerSchema);
