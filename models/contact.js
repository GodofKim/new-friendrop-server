const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const contactSchema = new Schema({
  host: Schema.ObjectId,
  email: String,
  date: Date
});

const ModelClass = mongoose.model('contact', contactSchema);

module.exports = ModelClass;
