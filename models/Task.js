import mongoose from 'mongoose';

export const TASK_STATUSES = ['todo', 'in-progress', 'review', 'done'];
export const TASK_PRIORITIES = ['low', 'medium', 'high', 'urgent'];

const TaskSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    // Stored encrypted in DB
    title: {
      type: String,
      required: [true, 'Title is required'],
      maxlength: [500, 'Title too long (encrypted value)'],
    },
    description: {
      type: String,
      maxlength: [5000, 'Description too long (encrypted value)'],
      default: null,
    },
    status: {
      type: String,
      enum: {
        values: TASK_STATUSES,
        message: 'Status must be one of: todo, in-progress, review, done',
      },
      default: 'todo',
    },
    priority: {
      type: String,
      enum: {
        values: TASK_PRIORITIES,
        message: 'Priority must be one of: low, medium, high, urgent',
      },
      default: 'medium',
    },
    dueDate: {
      type: Date,
      default: null,
    },
    tags: [{
      type: String,
      maxlength: 30,
    }],
    isArchived: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Compound index for user's tasks sorted by creation
TaskSchema.index({ user: 1, createdAt: -1 });
TaskSchema.index({ user: 1, status: 1 });
TaskSchema.index({ user: 1, isArchived: 1 });

export default mongoose.models.Task || mongoose.model('Task', TaskSchema);
