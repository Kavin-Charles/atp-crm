const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const schema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true },
  name:     { type: String, required: true, trim: true },
  role:     { type: String, enum: ['admin', 'manager', 'designer'], default: 'designer' },
  active:   { type: Boolean, default: true },
}, { timestamps: true });

schema.pre('save', async function () {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
});

schema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

schema.methods.toSafe = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', schema);
