const mongoose = require('mongoose');
const taskSchema = new mongoose.Schema({
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    priority: {
      type: Number,
      required: true,
      enum: [0, 1, 2, 3], // Priority determined based on due date proximity.
    },
    status: {
      type: String,
      required: true,
      enum: ['TODO', 'IN_PROGRESS', 'DONE'],
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  }, { timestamps: true }); // Auto-manage createdAt and updatedAt timestamps.
  
  const Task = mongoose.model('Task', taskSchema);
  module.exports = Task;