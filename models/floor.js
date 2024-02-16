const mongoose = require('mongoose');

const floorSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    floorNumber: { type: Number, required: true },
    floorName: { type: String, required: true },
    commonWashroomCount: { type: Number, required: false },
    created_at: { type: Date, default: Date.now },
    // Define the rooms field as an array of ObjectId references to the Room model
    rooms: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Room' }]
});

module.exports = mongoose.model('Floor', floorSchema);