const mongoose = require('mongoose');

const pricingSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    singleBedPrice:{type:Number,required:true},
    sharingBedPrice:{type:Number,required:true}
});


module.exports = mongoose.model('Pricing', pricingSchema); 