const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema({
    symbol: {
        type:String,
        required:true,
        default:"null"

    },
    stock: {
        type:String,
        required:true,
        default:"null"


    },
    price: {
        type:String,
        required:true,
        default:"null"
    }
})

const Stock = mongoose.model('Stock',stockSchema);
module.exports = Stock;
