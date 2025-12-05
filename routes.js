const {app, bcrypt, zod, server, mongoose} = require("./import")
const {usermodel, quizmodel, signupzod, signinzod, quesSchema} = require("./schema")
const {auth, token} = require("./middleware")

server()

app.post("/api/auth/signup", async (req,res)=>{
    let {name, email, password, role} = req.body
    let obj = {name,email,password,role};
    let result = signupzod.safeParse(obj)
    if(!result.success)
    {
        res.status(400).json({
            success: false,
            error: "Invalid request schema",
            // details: {result: result.error}
        });
        return;
    }
    obj.password = await bcrypt.hash(password,10)
    let check = await usermodel.findOne({email: email})

    if(check != null)
    {
        res.status(400).json({success: false,
            "details": { "email": "Already Exists" },
            "error": "User with this email already exists",
        });
        return;
    }
    try{
        let user = await usermodel.create(obj)
        res.status(201).json({
            "success": true,
            "data": user
        });
    }
    catch(err)
    {
        res.status(200).json({success: false, error:"Error creating user"});
    }
})

app.post("/api/auth/login", async(req,res, next)=>{
    let {email, password} = req.body
    let obj = {email, password}

    let result = signinzod.safeParse(obj)

    if(! result.success)
    {
        res.status(400).json({
            success: false,
            error: "Invalid request schema",
            details: {result: result.error}
        });
        return;
    }

    let user = await usermodel.findOne({email:email})
    if(user == null)
    {
        res.status(404).json({success: false, error: "User does not exist"});
        return;
    }
    if(! await bcrypt.compare(password, user.password))
    {
        res.status(400).json({success: false, error: "Invalid email or password"});
        return;
    }
    req.uid = user._id
    req.name = user.name
    req.role = user.role
    next()
}, token)

app.get("/api/auth/me", auth, async(req,res)=>{
    let uid = req.uid
    let user = await usermodel.findOne({_id: uid})
    if(user == null)
    {
        res.status(404).json({message: false, error: "User not found"});
        return;
    }
    res.status(200).json({
        "success": true,
        "data": { "_id": user._id, "name": user.name, "email": user.email, "role": user.role }
    })
})

//admin only
app.post("/api/quiz", auth, async(req,res)=>{
    let role = req.role
    if(role!=="admin")
    {
        res.status(401).json({
            "success": false,
            "error": "Unauthorized, admin access required"
        });
        return;
    }
    let title = req.body.title
    if(!title  || typeof(title)!="string")
    {
        res.status(400).json({
            "success": false,
            "error": "Invalid request schema"
        });
        return;
    }
    let questions = []
    if(req.body.questions) questions = req.body.questions


    let quiz = await quizmodel.create({title: title.trim(), questions:questions});

    res.status(201).json({
        "success": true,
        "data": { "_id": quiz._id, "title": quiz.title }
    })
})

app.post("/api/quiz/:quizId/questions", auth, async(req,res)=>{
    let role = req.role
    let quizid = req.params.quizId
    if(role!=="admin")
    {
        res.status(401).json({
            "success": false,
            "error": "Unauthorized, admin access required"
        });
        return;
    }

    let {text, options, correctOptionIndex} = req.body
    if(!text || text.trim()=="")
    {
        res.status(400).json({
            "success": false,
            "error": "Invalid request schema",
            "details": { "text": "Question text is required" }
        });
        return;
    }

    if(!options || !correctOptionIndex)
    {
        res.status(400).json({
            "success": false,
            "error": "Invalid request schema"
        });
        return;
    }

    let quiz = await quizmodel.findOne({_id: quizid})
    if(quiz==null)
    {
        res.status(404).json({
            message: false,
            error: "Quiz not found"
        });
        return;
    }

    quiz.questions.push({
        text: text,
        options: options,
        correctOptionIndex: correctOptionIndex
    })
    await quiz.save()
    let qid = quiz.questions[quiz.questions.length -1]._id
    res.status(201).json({
        "success": true,
        "data": {
        "quizId": quizid,
        "question": {
            "_id": qid,
            "text": text,
            "options": options,
            "correctOptionIndex": correctOptionIndex
        }
    }})
})

app.get("/api/quiz/:quizId", auth, async(req,res)=>{
    let role = req.role
    let quizid = req.params.quizId
    if(role!=="admin")
    {
        res.status(401).json({
            "success": false,
            "error": "Unauthorized, admin access required"
        });
        return;
    }
    if(!mongoose.Types.ObjectId.isValid(quizid))
    {
        res.status(404).json({
            success: false,
            error: "Quiz not found"
        });
        return;
    }

    let quiz = await quizmodel.findOne({_id: quizid})
    if(quiz==null)
    {
        res.status(404).json({
            success: false,
            error: "Quiz not found"
        });
        return;
    }

    res.status(200).json({
        "success": true,
        "data": {
            "_id": quizid,
            "title": quiz.title,
            "questions": quiz.questions
        }
    })
})

