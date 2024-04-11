const mongoose = require('mongoose');
const Pricing = require('../models/pricing');

const createPrice = async(req, res) => {
    try {
        // Directly extracting singleBedPrice and sharingBedPrice from req.body
        const { userId, singleBedPrice, sharingBedPrice } = req.body;

        // Check if singleBedPrice and sharingBedPrice are provided
        if (singleBedPrice === undefined || sharingBedPrice === undefined) {
            return res.status(400).json({ message: "Missing singleBedPrice or sharingBedPrice" });
        }

        const newPrice = new Pricing({
            userId,
            singleBedPrice,
            sharingBedPrice
        });

        const savedPrice = await newPrice.save();
        res.status(201).json(savedPrice);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



const getPrice = async (req, res) => {
    try {
        // Retrieve all pricing entries from the database
        const pricing = await Pricing.find();
        res.json(pricing);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}


const updatePrice = async (req, res) => {
    try {
        const { singleBedPrice, sharingBedPrice } = req.body;
        const userId = req.params.userId; // Retrieve userId from the URL parameters
        // Find the pricing entry by its userId and update its fields
        const updatedPrice = await Pricing.findOneAndUpdate({ userId }, {
            singleBedPrice,
            sharingBedPrice
        }, { new: true });
        if (updatedPrice) {
            res.json(updatedPrice);
        } else {
            res.status(404).json({ message: 'Pricing not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}



module.exports = {
    createPrice,
    getPrice,
    updatePrice
}