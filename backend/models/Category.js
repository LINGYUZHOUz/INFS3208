const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true,
        unique: true,
        trim: true
    },
    description: { 
        type: String,
        trim: true 
    },
    color: { 
        type: String, 
        default: '#3B82F6'
    },
    isActive: { 
        type: Boolean, 
        default: true 
    },
    createdBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Category', categorySchema);