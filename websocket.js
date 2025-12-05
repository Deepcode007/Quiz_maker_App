const { title } = require("process");
const { mongoose, jwt} = require("./import")
const {usermodel, quizmodel} = require("./schema")
const url = require('url');
const JWT_KEY = process.env.JWT_KEY

const {WebSocketServer} = require("ws")
const wss= new WebSocketServer({port: 3001})

let livequiz = {}

function auth(ws,token,req)
{
    if(token==undefined)
        {
            ws.send(JSON.stringify({
                "type": "ERROR",
                "success": false,
                "message": "Unauthorized or invalid data"
            }))
            return false;
        }
        try{
            let data = jwt.verify(token, JWT_KEY)
            req.uid = data.uid
            req.role = data.role
            req.name = data.name
            return true;
        }
        catch(err)
        {
            ws.send(JSON.stringify({
                "type": "ERROR",
                "success": false,
                "message": "Unauthorized or invalid data"
            }))
            return false
        }
}

async function quizverify(ws, quizid,req)
{
    if(!quizid)
    {
        ws.send(JSON.stringify({
            "type": "ERROR",
            "success": false,
            "message": "Unauthorized or invalid data"
        }))
        return false;
    }
    if(!mongoose.Types.ObjectId.isValid(quizid))
    {
        ws.send(JSON.stringify({
            "type": "ERROR",
            "success": false,
            "message": "Unauthorized or invalid data"
        }))
        return;
    }
    try{
        if(req.role!='admin') return true;
        let quiz = await quizmodel.findOne({_id: quizid})
        if(quiz==null)
        {
            ws.send(JSON.stringify({
                "type": "ERROR",
                "success": false,
                "message": "Unauthorized or invalid data"
            }));
            return false;
        }
        ws.send(`Quiz ${quiz.title} added.`)

        let ans = {}
        for(let i of quiz.questions)
        {
            ans[i._id]={}
        }
        livequiz[quizid] = {
            quizId: quizid,
            title: quiz.title,
            currentQuestionId: null,
            questions: quiz.questions,
            users: {},
            answers: ans
        }
        return true;
    }
    catch{
        ws.send(JSON.stringify({
            "type": "ERROR",
            "success": false,
            "message": "Unauthorized or invalid data"
        }))
        ws.close({})
    }

}

wss.on("connection",(ws,req)=>{
    let token = url.parse(req.url, true).query.token;
    let quizid = url.parse(req.url, true).query.quizId;

    if(! auth(ws,token,req) || ! quizverify(ws,quizid,req)) ws.close();

    if(req.role=="admin")
    {
        ws.send("Welcome admin!!")
        ws.send("You can START_QUIZ, SHOW_QUESTION, SHOW_RESULT and END_QUIZ");
    }
    else if(req.role == "student")
    {
        ws.send("Welcome to quiz!!")
        ws.send("options: SUBMIT_ANSWER")
        livequiz[quizid].users[req.uid] = {
            ws: ws,
            name: req.name,
            score: 0,
            answeredCurrent: false
        }
    }

    ws.on("message",(data)=>
    {
        data=JSON.parse(data)
        if(! auth(ws,token, req)) ws.close();
        if(req.role=="admin")
        {
            messagehandler(data, req, ws);
        }
        else if(req.role == "student")
        {
            
            if(data.type !="SUBMIT_ANSWER")
            {
                ws.send("Invalid inputs!!");return;
            }
            else submit(data, ws, req);
        }
        
    })
    
    
})

function messagehandler(data, req, ws)
{
    if(data.type=="START_QUIZ") startquiz(data, req, ws);
    else if(data.type =="SHOW_QUESTION") showq(data, ws);
    else if(data.type == "SHOW_RESULT") result(data, req, ws);
    else if(data.type == "END_QUIZ") end(ws); 
}

function startquiz(data, req, ws)
{
    ws.send(JSON.stringify({
    "type": "QUIZ_STARTED",
    "quizId": "quiz123",
    "message": "Quiz is now live"
    }))
    let users = livequiz[data.quizId].users

    Object.keys(users).forEach(key => {

        users[key].ws.send("QUIZ_STARTED");
    });
}

function showq(data,ws){
    let quizId = data.quizId
    let qid = data.questionId

    if(!livequiz[quizId])
    {
        ws.send(JSON.stringify({
            "type": "ERROR",
            "success": false,
            "message": "Invalid quizId or unauthorized"
        }));
        return;
    }

    let question = livequiz[quizId].questions.find(x=> x.id==qid)

    if(!question)
    {
        ws.send(JSON.stringify({
            "type": "ERROR",
            "success": false,
            "message": "Invalid questionId or unauthorized"
        }));
        return;
    }

    let users = livequiz[quizId].users
    Object.keys(users).forEach(key => {
        users[key].ws.send(JSON.stringify({
            type: "QUESTION",
            quizId: quizId,
            questionId: qid,
            text: question.text,
            options: question.options
        }));
    });

    ws.send(JSON.stringify({question, quizId, message: "Question Broadcasted!"}));

}

//student-------
function submit(data, ws, req)
{
    let quizId = data.quizId
    let qid = data.questionId
    let uid = req.uid
    
    if(!livequiz[quizId])
    {
        ws.send(JSON.stringify({
            "type": "ERROR",
            "success": false,
            "message": "Invalid quizId or unauthorized"
        }));
        return;
    }
    let user = livequiz[quizId].users[uid]
    if(!user)
    {
        ws.send(JSON.stringify({
            "type": "ERROR",
            "success": false,
            "message": "User not in quiz or unauthorized"
        }));
        return;
    }

    let question = livequiz[quizId].questions.find(x=> x.id==qid)

    if(!question)
    {
        ws.send(JSON.stringify({
            "type": "ERROR",
            "success": false,
            "message": "Invalid questionId or unauthorized"
        }));
        return;
    }

    let answer = livequiz[quizId].answers[qid]
    if([0,1,2,3].includes(answer[uid]))
    {

        ws.send(JSON.stringify({
            "type": "ANSWER_ACK",
            "accepted": false,
            "reason": "already_answered",
            "message": "You already answered this question."
        }));
        return;
    }


    let ans = data.selectedOptionIndex
    let correct = question.correctOptionIndex

    ws.send(JSON.stringify({
        "type": "ANSWER_ACK",
        "accepted": true,
        "correct": (ans==correct)? true : false,
        "yourScore": (ans==correct)? 1: 0,
        "message": (ans==correct)?"Correct answer!": "Incorrect answer"
    }))
    user.score+= (ans==correct)? 1: 0
    answer[uid] = ans;
}

function result(data, req, ws)
{
    let quizId = data.quizId
    let qid = data.questionId

    if(!livequiz[quizId])
    {
        ws.send(JSON.stringify({
            "type": "ERROR",
            "success": false,
            "message": "Invalid quizId or unauthorized"
        }));
        return;
    }

    let question = livequiz[quizId].questions.find(x=> x.id==qid)

    if(!question)
    {
        ws.send(JSON.stringify({
            "type": "ERROR",
            "success": false,
            "message": "Invalid questionId or unauthorized"
        }));
        return;
    }

    let answer = livequiz[quizId].answers[qid]
    let zero =0, one=0, two=0, three=0;
    Object.keys(answer).forEach(x=>{
        if(answer[x]==0) zero++;
        else if(answer[x]==1) one++;
        else if(answer[x]==2) two++;
        else if(answer[x]==3) three++;
    })
    let obj={
        "type": "RESULT",
        "quizId": quizId,
        "questionId": qid,
        "results": {
            "0": zero,
            "1": one,
            "2": two,
            "3":three
        }
    }

    let users = livequiz[quizId].users
    Object.keys(users).forEach(key=>{
        users[key].ws.send(JSON.stringify(obj))
    })

    ws.send(JSON.stringify(obj));
}