const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const dropSchema = new Schema({
  host: Schema.ObjectId,
  email: String,
  date: Date
});

const ModelClass = mongoose.model('drop', dropSchema);

module.exports = ModelClass;
