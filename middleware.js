const { jwt} = require("./import")
const JWT_KEY = process.env.JWT_KEY

function auth(req , res, next)
{
    let token = req.headers["Authorization"]? req.headers["Authorization"]: req.headers["authorization"]
    if(token==undefined)
    {
        res.status(401).json({
            "success": false,
            "error": "Unauthorized, token missing or invalid"
        });
        return;
    }
    try{
        let data = jwt.verify(token, JWT_KEY)
        req.uid = data.uid
        req.role = data.role
        next()
    }
    catch(err)
    {
        if(err.name =="TokenExpiredError")
        {
            res.status(401).json({
                "success": false,
                "error": "Session expired"
            });
            return;
        }
        res.status(401).json({
            "success": false,
            "error": "Unauthorized, token missing or invalid"
        })
        return;
    }
}

function token(req,res)
{
    let {email} = req.body
    let {uid, name, role} = req
    let token = jwt.sign({
        email: email,
        name: name,
        uid: uid,
        role: role
    }, JWT_KEY, {expiresIn: 60*15}) //10 minutes

    res.status(200).json({
        "success": true,
        "data": { "token": token }
    })
}

module.exports = { auth , token}