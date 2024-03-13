const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define schema for Bed within Room
const BedSchema = new Schema({
    bedNumber: {
        type: Number,
        required: true
    },
    status: {
        type: String, 
        enum: ['available', 'occupied'],
        default: 'available'
    }
}); 

// Define schema for Room
const RoomSchema = new Schema({
    floor: {
        type: Schema.Types.ObjectId,
        ref: 'Floor',
        required: true
    },
    roomNumber: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        enum: ['single', 'shared'],
        required: true
    },
    commonWashroom: {
        type: String,
        enum: ['Yes', 'No'],
        required: true
    },
    numberOfBeds: {
        type: Number,
        required: true
    },
    beds: [BedSchema] // Array of beds within the room
});

// Create model
const Room = mongoose.model('Room', RoomSchema);

module.exports = Room;




