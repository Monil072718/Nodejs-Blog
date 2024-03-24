const mongoose = require('mongoose')
const url = 'mongodb://localhost:27017/Test'

const connectDb = async () => {
        await mongoose.connect(url)
}

module.exports = { connectDb }
