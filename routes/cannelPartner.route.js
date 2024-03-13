const express = require('express');
const router = express.Router();
const channelPartnerController = require('../controllers/channelPartnerController');

// Get all channel partners
router.get('/', channelPartnerController.getAllChannelPartners);

// Get channel partner by ID
router.get('/:id', channelPartnerController.getChannelPartnerById);

// Create a new channel partner
router.post('/', channelPartnerController.createChannelPartner);

// Update a channel partner by ID
router.put('/:id', channelPartnerController.updateChannelPartnerById);

// Delete a channel partner by ID
router.delete('/:id', channelPartnerController.deleteChannelPartnerById);

module.exports = router;
