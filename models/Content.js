const mongoose = require('mongoose');

const ContentSchema = new mongoose.Schema({
  section: { type: String, required: true, unique: true },
  title: { type: String },
  subtitle: { type: String },
  description: { type: String },
  data: { type: mongoose.Schema.Types.Mixed },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Content', ContentSchema);