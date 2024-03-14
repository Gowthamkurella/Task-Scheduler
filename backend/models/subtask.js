const mongoose = require('mongoose');

const subTaskSchema = new mongoose.Schema({
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      required: true,
    },
    title:{
      type: String,
      required : true
    },
    status: {
      type: Number,
      required: true,
      enum: [0, 1], // 0 for incomplete, 1 for complete.
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  }, { timestamps: true });
  
  const SubTask = mongoose.model('SubTask', subTaskSchema);
  
  module.exports = SubTask;