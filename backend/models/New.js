const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
 userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
    headline: { 
    type: String, 
    required: true 
  },
  content: { 
    type: String, 
    required: true 
  },
  publishDate: { 
    type: Date, 
    required: true 
  },
  category: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Category', 
    required: true 
  },
 
  status: { 
    type: String, 
    enum: ['draft', 'published', 'archived'], 
    default: 'draft' 
  },
  tags: [{ 
    type: String 
  }],
  viewCount: { 
    type: Number, 
    default: 0 
  },
  // Add image field for unstructured data storage
  imageBase64: { 
    type: String, 
    default: '' 
  }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('News', newsSchema);