import express from "express"
import mongoose from "mongoose"
import jwt, { decode } from "jsonwebtoken"
import bcrypt from "bcrypt"
import { TagModel, UserModel, LinkModel, ContentModel } from "./db.js"
import { middlewareAuth } from "./middleware.js"
import { JWT_SECRET } from "./config.js"
import { random } from "./uttils.js"


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
    const { username, password } = req.body

    const user = await UserModel.findOne({
        username: username
    })

    if (!user) {
        res.status(403).json({
            message: "User not exist with provided username"
        })
        return
    }

    const paswordMatch = await bcrypt.compare(password, user.password)

    if (!paswordMatch) {
        res.status(403).json({
            message: "Password didn't match"
        })
        return
    } else {
        const token = jwt.sign({
            id: user._id
        }, JWT_SECRET)

        res.json({
            token: token,
            message: "User Logged in Successfully, Token generated"
        })
    }

})

app.post("/api/v1/content", middlewareAuth, async (req, res) => {

    const { link, title } = req.body

    const newContent = await ContentModel.create({
        link: link,
        title: title,
        tags: [],
        // @ts-ignore
        userId: req.userId
    })
    res.status(201).json({
        message: "You created content successfully ",
        content: newContent
    })
})

app.get("/api/v1/content", middlewareAuth, async (req, res) => {
    // @ts-ignore
    const userId = req.userId

    const content = await ContentModel.find({
        userId: userId
    }).populate("userId", "username")
    res.json({
        content
    })
})

app.delete("/api/v1/content", middlewareAuth, async (req, res) => {
    const contentId = req.body.contentId;

    if (!contentId) {
        return res.status(411).json({
            message: "contentId is required"
        })
    }
    try {
        const result = await ContentModel.deleteOne({
            _id: contentId,
            // @ts-ignore
            userId: req.userId
        })

        if (result.deletedCount === 0) {
            res.status(411).json({
                message: "Content not found or you don't have permission to delete it",
            })
        }

        res.json({
            message: "Deleted Successfully"
        })
    } catch (error) {
        res.status(500).json({
            message: "Error Deleting Content"
        })
    }
})

app.post("/api/v1/brain/share", middlewareAuth, async (req, res) => {
    const share = req.body.share

    if (share) {
        // @ts-ignore
        const userId = req.userId
        const existingLink = await LinkModel.findOne({
            userId: userId
        })
        if (existingLink) {
            res.json({
                link: existingLink.hash,
                message: "User already exist with the above link"
            })
        }
        else {
            const link = random(10)
            await LinkModel.create({
                // @ts-ignore
                userId: req.userId,
                hash: link
            })
            res.json({
                link: link,
                message: "Sharable link generated successfully"
            })
        }
    } else {
        await LinkModel.deleteOne({
            // @ts-ignore
            userId: req.userId
        })
        res.json({
            message: "Link deleted successfully"
        })
    }
})

app.get("/api/v1/brain/:shareLink", async (req, res) => {
    const hash = req.params.shareLink

    const link = await LinkModel.findOne({
        hash: hash
    })

    if (!link) {
        res.status(411).json({
            message: "Sorry, incorrect input"
        })
        return;
    }

    const content = await ContentModel.findOne({
        userId: link.userId
    })

    const user = await UserModel.findOne({
        _id: link.userId
    })

    if (!user) {
        res.json({
            message: "User not found , error should ideally not happen"
        })
        return
    }
    res.json({
        username: user.username,
        content: content
    })
})

app.listen(3000)