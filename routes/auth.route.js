const express = require('express');
// const { signup } = require('../controllers/auth.controller');
const { signup,signin,logout } = require('../controllers/auth.controller')
const router = express.Router();
// const Post = require('../models/Post');
// import express from 'express';

// const authController=require('../controllers/auth.controller')

router.post('/signup', signup );
router.post('/signin',signin);
router.get('/logout',logout);


module.exports = router;