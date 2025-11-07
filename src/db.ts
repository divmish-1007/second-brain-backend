import {Model, Schema } from "mongoose";
import mongoose from "mongoose";

mongoose.connect("mongodb+srv://divakarmishra5301_db_user:ASDasd123@cluster0.itwplte.mongodb.net/Second-Brain")
const ObjectId = mongoose.Types.ObjectId

const userSchema = new Schema({
    username: {type: String, required: true, unique: true},
    password: {type: String, required:true},
})

const tagSchema = new Schema({
    title:{type:String, required:true, unique:true}
})

const linkSchema = new Schema({
    hash:{type:String, required: true},
    userId:{type: mongoose.Types.ObjectId, ref:'User', required:true}
})

const contentType = ['image', ]
const contentSchema = new Schema({
    link:{type:String, required: true},
    type:{type: String, enum:contentType},
    title:{type:String, required: true},
    tags: [{type: mongoose.Types.ObjectId, ref:'Tag'}],
    userId:{type:mongoose.Types.ObjectId, ref:'User', required:true}
})

// We create Usermodel to use these strutures to stroe the data
// The first argument is that where i want to put the data in database 
// The second argument is that in which format we want to store the data which we defined above 


export const TagModel = mongoose.model('Tags', tagSchema)
export const UserModel = mongoose.model('User', userSchema)
export const LinkModel = mongoose.model('Link', linkSchema)
export const ContentModel = mongoose.model('Content', contentSchema)

// The below code works only in traditional Node.js Javascript!

// module.exports = {
//     TagModel: TagModel,
//     UserModel: UserModel,
//     LinkModel: LinkModel,
//     ContentModel: ContentModel
// }

// The below one for the Typescript

// export default{
//     TagModel,
//     UserModel,
//     LinkModel,
//     ContentModel
// }