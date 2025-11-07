import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "./config.js";

export const middlewareAuth = (req: Request, res:Response,next:NextFunction ) => {
    const token = req.headers.token

    if(!token || typeof token !== 'string'){
        res.status(401).json({
            message: "Authorization token is missing or invalid"
        })
        return
    }

    const decode = jwt.verify(token, JWT_SECRET)

    if(decode){
        // @ts-ignore
        req.Userid = decode.id
        next()
    }
    else{
        res.status(403).json({
            message:"Authentication is failed. User not allowed to create Content",     
        })
    }
}