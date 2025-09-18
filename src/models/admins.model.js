import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema({
    company_name: {
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
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    subscription: {
        plan_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'SubscriptionPlan'
        },
        start_date: Date,
        end_date: Date,
        is_active: {
            type: Boolean,
            default: false
        },
        auto_renew: {
            type: Boolean,
            default: false
        }
    },
    is_subscription_expired: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

export default mongoose.model('Admin', adminSchema);

