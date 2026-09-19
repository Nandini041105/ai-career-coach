import mongoose from 'mongoose';

export const TARGET_ROLES = [
  'RTL Design Engineer',
  'FPGA Design Engineer',
  'VLSI Engineer',
  'Physical Design Engineer',
  'Embedded Systems Engineer',
  'Software Engineer',
  'Data/AI Engineer',
  'Other'
];

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters']
    },
    targetRole: {
      type: String,
      enum: TARGET_ROLES,
      default: 'Software Engineer'
    }
  },
  {
    timestamps: true
  }
);

// Do not return password hash by default
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

const User = mongoose.model('User', userSchema);
export default User;
