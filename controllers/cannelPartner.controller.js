const ChannelPartner = require('../models/channelPartnerModel');

const channelPartnerController = {};

// Get all channel partners
channelPartnerController.getAllChannelPartners = async (req, res) => {
    try {
        const channelPartners = await ChannelPartner.find();
        res.status(200).json(channelPartners);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get channel partner by ID
channelPartnerController.getChannelPartnerById = async (req, res) => {
    try {
        const channelPartner = await ChannelPartner.findById(req.params.id);
        if (!channelPartner) {
            return res.status(404).json({ message: 'Channel partner not found' });
        }
        res.status(200).json(channelPartner);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create a new channel partner
channelPartnerController.createChannelPartner = async (req, res) => {
    const channelPartner = new ChannelPartner(req.body);
    try {
        const newChannelPartner = await channelPartner.save();
        res.status(201).json(newChannelPartner);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Update a channel partner by ID
channelPartnerController.updateChannelPartnerById = async (req, res) => {
    try {
        const updatedChannelPartner = await ChannelPartner.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedChannelPartner) {
            return res.status(404).json({ message: 'Channel partner not found' });
        }
        res.status(200).json(updatedChannelPartner);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete a channel partner by ID
channelPartnerController.deleteChannelPartnerById = async (req, res) => {
    try {
        const deletedChannelPartner = await ChannelPartner.findByIdAndDelete(req.params.id);
        if (!deletedChannelPartner) {
            return res.status(404).json({ message: 'Channel partner not found' });
        }
        res.status(200).json({ message: 'Channel partner deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = channelPartnerController;
