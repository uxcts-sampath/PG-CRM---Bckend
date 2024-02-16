const Room = require('../models/rooms');


const pgroom = async (req, res) => {
  try {
    const newRoom = new Room(req.body);
    const savedRoom = await newRoom.save();
    res.status(201).json(savedRoom);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
    }

const getAllRooms = async (req, res) => {
        try {
          const rooms = await Room.find();
          res.status(200).send(rooms);
        } catch (error) {
          res.status(500).json({ message: error.message });
        }
      };



module.exports = {
   pgroom,
   getAllRooms
    }

    
