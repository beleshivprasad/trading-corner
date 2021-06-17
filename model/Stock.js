const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema({
    symbol: {
        type:String,
        required:true,
    },
    stock: {
        type:String,
        required:true,
    },
    price: {
        type:String,
        required:true,
    }
})

const Stock = mongoose.model('Stock',stockSchema);
module.exports = Stock;
