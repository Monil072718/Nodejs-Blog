const mongoose = require('mongoose')
const url = 'mongodb://127.0.0.1:27017/Passport'

const connectDb = async () => {
        await mongoose.connect(url)
}

module.exports = { connectDb }
