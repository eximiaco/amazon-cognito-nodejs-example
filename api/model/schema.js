const mongoose = require('mongoose');
const findOrCreate = require('mongoose-findorcreate');

const UserSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true,
        unique: true
    }
});

UserSchema.plugin(findOrCreate);

const UserModel = mongoose.model('user', UserSchema);

module.exports.User = UserModel;