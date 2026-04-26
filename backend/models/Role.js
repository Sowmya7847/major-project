const mongoose = require('mongoose');
mongoose.set('bufferCommands', false);

const roleSchema = new mongoose.Schema({
    roleId: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    permissions: [{
        resourceName: { type: String, required: true },
        resourceGroup: { type: String, required: true },
        read: { type: Boolean, default: false },
        write: { type: Boolean, default: false },
        execute: { type: Boolean, default: false },
        delete: { type: Boolean, default: false }
    }],
    policy: {
        version: { type: String, default: '2.0' },
        statement: [{
            effect: { type: String, enum: ['Allow', 'Deny'] },
            action: [String],
            resource: String
        }],
        condition: { type: Object }
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true,
    autoIndex: false
});

module.exports = mongoose.model('Role', roleSchema);
