const express = require('express');
const router = express.Router();
// const Post = require('../models/Post');
// import express from 'express';
const { test } = require('../controllers/user.controller');

router.get('/', test);



module.exports = router;