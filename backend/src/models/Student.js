import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    maxlength: 80
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    unique: true,
    maxlength: 254,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  phone: {
    type: String,
    trim: true,
    maxlength: 30,
    default: ''
  },
  course: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  yearOrSemester: {
    type: String,
    trim: true,
    maxlength: 50,
    default: ''
  }
}, {
  timestamps: true,
  versionKey: false
});

export default mongoose.model('Student', studentSchema);