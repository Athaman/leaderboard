const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const Schema = mongoose.Schema;

const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true // This doesn't seem to work 100% of the time, would debug for prod.
    },
    password: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    highScore: {
        type: Number,
        default: 0
    }
});

// Note not to use () => here since we need the 'this' scoped to the context the function is called in not declared in
UserSchema.pre('save', async function(next) { 
    const hash = await bcrypt.hash(this.password, 10);
    this.password = hash;
    next();
});

// Note not to use () => here since we need the 'this' scoped to the context the function is called in not declared in
UserSchema.methods.isValidPassword = async function(password) {
    const user = this;
    const compare = await bcrypt.compare(password, user.password);
    return compare;
};

const UserModel = mongoose.model('user', UserSchema);

module.exports = UserModel;

