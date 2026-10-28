import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  type: { type: String, enum: ['student_created', 'student_updated', 'student_deleted'], required: true },
  title: { type: String, required: true, trim: true, maxlength: 160 },
  message: { type: String, required: true, trim: true, maxlength: 500 },
  studentId: { type: String, default: '' },
  readAt: { type: Date, default: null }
}, { timestamps: true, versionKey: false });

notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ readAt: 1, createdAt: -1 });

export default mongoose.model('Notification', notificationSchema);
