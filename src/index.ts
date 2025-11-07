import express from "express"
import mongoose from "mongoose"
import jwt, { decode } from "jsonwebtoken"
import bcrypt from "bcrypt"
import {TagModel, UserModel, LinkModel, ContentModel} from "./db.js"
import { middlewareAuth } from "./middleware.js"
import { JWT_SECRET } from "./config.js"


const app = express()
app.use(express.json())

interface UserPayload {
  id: string;
}

app.post("/api/v1/signup", async (req, res) => {
    const username = req.body.username
    const password = req.body.password

    const hashedPassword = await bcrypt.hash(password, 5)

    await UserModel.create({
        username: username,
        password: hashedPassword
    })
    res.json({
        message: "User are siggned up Successfully" 
    })

})

app.post("/api/v1/signin", async (req, res) => {
    const {username, password} = req.body

    const user = await UserModel.findOne({
        username:username
    })

    if(!user){
        res.status(403).json({
            message:"User not exist with provided username"
        })
        return 
    }

    const paswordMatch = await bcrypt.compare(password, user.password)

    if(!paswordMatch){
        res.status(403).json({
            message:"Password didn't match"
        })
        return
    }else{
        const token = jwt.sign({
            id: user._id
        }, JWT_SECRET)

        res.json({
            token:token,
            message:"User Logged in Successfully, Token generated"
        })
    }

})

app.post("/api/v1/content", middlewareAuth, async (req, res) => {

    const {link,title} = req.body

    const newContent = await ContentModel.create({
        link: link,
        title: title,
        tags: [],
        // @ts-ignore
        userId: req.Userid   
    })
        res.status(201).json({
            message:"You created content successfully ",
            content: newContent
        })
})

app.get("/api/v1/content", middlewareAuth, async (req, res) => {
    // @ts-ignore
    const userId = req.Userid

    const content = await ContentModel.findOne({
        userId: userId
    }).populate("userId", "username")
    res.json({
        content
    })
})

app.delete("/api/v1/content",middlewareAuth, async (req, res) => {
    const contentId = req.body.contentId;

    await ContentModel.deleteOne({
        contentId,
        // @ts-ignore
        userId: req.Userid
    })
    res.json({
        message: "Deleted Successfully"
    })
})

app.post("api/v1/brain/share", (req, res) => {

})

app.listen(3000)