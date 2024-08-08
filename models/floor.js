const mongoose = require('mongoose');

const floorSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    floorNumber: { type: Number, required: true },
    floorName: { type: String },
    commonWashroomCount: { type: Number, required: false },
    created_at: { type: Date, default: Date.now },
    // Define the rooms field as an array of ObjectId references to the Room model
    rooms: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Room' }]
});

floorSchema.index({ floorNumber: 1, userId: 1 }, { unique: true });


module.exports = mongoose.model('Floor', floorSchema);