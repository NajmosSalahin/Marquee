import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true, minlength: 3, maxlength: 24 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  emailVerified: { type: Boolean, default: false },
  tokenVersion: { type: Number, default: 0 },
  preferences: {
    accentColor: { type: String, enum: ['amber', 'crimson', 'violet', 'emerald', 'azure'], default: 'amber' },
    defaultView: { type: String, enum: ['board', 'grid', 'list'], default: 'board' },
    density: { type: String, enum: ['comfortable', 'compact'], default: 'comfortable' },
  },
  createdAt: { type: Date, default: Date.now },
});

userSchema.methods.toPublic = function toPublic() {
  return {
    id: this._id,
    username: this.username,
    email: this.email,
    emailVerified: this.emailVerified,
    preferences: this.preferences,
    createdAt: this.createdAt,
  };
};

export default mongoose.model('User', userSchema);
