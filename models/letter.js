const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const letterSchema = new Schema({
  host: Schema.ObjectId,
  email: String,
  content: String,
  date: Date
});

const ModelClass = mongoose.model('letter', letterSchema);

module.exports = ModelClass;
