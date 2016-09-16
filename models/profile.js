const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/* child schema */
const detailSchema = new Schema({
  charactors: [String],
  appearances: [String],
  bloodgroup: String,
  location: String,
  alcohole: Number,
  religion: String,
  languages: [String],
  introduction: String
});

/* parent schema */
const profileSchema = new Schema({
  host: Schema.ObjectId,
  email: String,
  isInitiatied: Boolean,
  image: [String],
  name: String,
  nickname: String,
  gender: String,
  phone: String,
  school: String,
  major: String,
  interests: [String],
  protected: [String],
  details: [detailSchema]
});


const ModelClass = mongoose.model('profile', profileSchema);

module.exports = ModelClass;
