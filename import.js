const express = require("express")
const mongoose = require("mongoose")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const {WebSocketServer} = require("ws")
const zod = require("zod")
require('dotenv').config()

const url = process.env.url;

mongoose.connect(url)


const app = express()
app.use(express.json())

function server(){
    app.listen(3000,()=>console.log("listening 3000"))
}

module.exports = { server, app, mongoose, jwt, bcrypt, zod , WebSocketServer}