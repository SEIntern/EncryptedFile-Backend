import mongoose from 'mongoose';

const FileSchema = new mongoose.Schema({
    filename: {
        type: String,
        required: true,
        trim: true
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    manager_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Manager'
    },
    admin_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    },
    iv: {
        type: String,
        required: true
    },
    public_id: {
        type: String,
        required: true
    },
    url: {
        type: String,
        required: true
    },
    encryption_key: {
        type: String,
        required: function () {
            return this.role === 'admin' || this.role === 'manager'
        },
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
    },
}, { timestamps: true });

export default mongoose.model('File', FileSchema);
