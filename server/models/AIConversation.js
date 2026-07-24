const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    required: true,
    enum: ['user', 'assistant'],
  },
  content: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const aiConversationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    messages: [messageSchema],
    title: {
      type: String,
      default: 'New Conversation',
      trim: true,
    },
    type: {
      type: String,
      enum: ['budget-planner', 'insights', 'chat'],
      default: 'chat',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('AIConversation', aiConversationSchema);

