const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const citySchema = new Schema({
    value: String,
    key: Number
    });
const City = mongoose.model('City', citySchema, 'citys');
module.exports =  City;