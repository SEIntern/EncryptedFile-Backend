import mongoose from 'mongoose';

const subscriptionPlanSchema = new mongoose.Schema({
    plan_name: {
        type: String,
        required: true,
        trim: true
    },
    duration_days: {
        type: Number,
        required: true
    },
    max_managers: {
        type: Number,
        required: true
    },
    max_users_per_manager: {
        type: Number,
        required: true
    },
    max_files_per_user: {
        type: Number,
        required: true
    },
    price: {
        type: Number,
        required: true
    }
}, { timestamps: true });

export default mongoose.model('SubscriptionPlan', SubscriptionPlan);


