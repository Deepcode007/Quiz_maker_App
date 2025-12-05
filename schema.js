const {mongoose, zod} = require("./import")


const userSchema = new mongoose.Schema(
    {
        name: {type: String},
        email: { type: String, unique: true},
        password: { type: String},
        role: {type: String, enum:["admin", "student"]}
    }
)

const quesSchema = new mongoose.Schema({
    text: {type:String},
    options:[ {type: String}],
    correctOptionIndex: {type: Number, enum:[0,1,2,3]}
})

const quizSchema = new mongoose.Schema(
    {
    title: {type: String},
    questions: [ quesSchema]
}
)

const signupzod = zod.object({
    name: zod.string({error: "Invalid name format"}),
    email: zod.string().email({error: "Invalid email format"}),
    password: zod.string({error: "Invalid password format"})
    .min(4,{error: "Password minimum length is 4"})
    .max(30,{error: "Password maximum length is 30"}),
    role: zod.string(["admin", "student"],{error: "Invalid role format"})
})

const signinzod = zod.object({
    email: zod.string().email({error: "Invalid email format"}),
    password: zod.string({error: "Invalid password format"})
    .min(4,{error: "Password minimum length is 4"})
    .max(30,{error: "Password maximum length is 30"})
})

const usermodel = mongoose.model('users', userSchema)
const quizmodel = mongoose.model('quiz',quizSchema)

module.exports = { usermodel, quizmodel, signupzod, signinzod, quesSchema}