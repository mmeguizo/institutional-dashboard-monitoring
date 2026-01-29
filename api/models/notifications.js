const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
    },
    reciepient : {
        type: String,
    },
    title: {
        type: String,
    },
    message: {
        type: String,
    },
    type: {
        type: String,
    },
    isRead: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    metadata: {
        type: Object,
        default: {},
    },
    goalDetails: {
        type: Object,
        default: {}, 
    },
    objectiveDetails : {
        type: Object,
        default: {},
    },
    userDetails : {
         type: Object,
        default: {},
    }
}, {
    toJSON: {
        virtuals: true,
    },
    toObject: {
        virtuals: true,
    },
});

NotificationSchema.virtual('user', {
    ref: 'User',
    localField: 'userId',
    foreignField: 'id',
    justOne: true,
    options: {
        select: 'username department role',
    },
});

// Performance indexes for high-traffic queries
NotificationSchema.index({ userId: 1, isRead: 1 }); // Compound index for user notifications
NotificationSchema.index({ reciepient: 1, isRead: 1 }); // For recipient-based queries
NotificationSchema.index({ createdAt: -1 }); // For sorting by creation date
NotificationSchema.index({ type: 1, userId: 1 }); // For filtering by notification type

module.exports = mongoose.model('Notification', NotificationSchema);