const express = require("express");
const jwt = require("jsonwebtoken");

const JWT_SECRET = "Rahul123123";

const app = express();
app.use(express.json());

const users = [];

function logger(req, res, next) {
    console.log(req.method + " request came");
    next();
}

// localhost:3000
app.get("/", function (req, res) {
    res.sendFile(__dirname + "/public/index.html");
});

app.post("/signup", logger, function (req, res) {
    const { username, password } = req.body;

    // Check if the user already exists
    const existingUser = users.find(user => user.username === username);
    if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
    }

    users.push({ username, password });

    res.json({
        message: "You are signed up successfully"
    });
});

app.post("/signin", logger, function (req, res) {
    const { username, password } = req.body;

    const foundUser = users.find(user => user.username === username && user.password === password);

    if (!foundUser) {
        return res.status(401).json({ message: "Credentials incorrect" });
    }

    const token = jwt.sign({ username: foundUser.username }, JWT_SECRET);
    res.header("jwt", token);

    res.json({ token });
});

function auth(req, res, next) {
    const token = req.headers.token;
    
    if (!token) {
        return res.status(401).json({ message: "Token required" });
    }

    try {
        const decodedData = jwt.verify(token, JWT_SECRET);
        req.username = decodedData.username;
        next();
    } catch (error) {
        return res.status(403).json({ message: "Invalid or expired token" });
    }
}

app.get("/me", logger, auth, function (req, res) {
    const foundUser = users.find(user => user.username === req.username);

    if (!foundUser) {
        return res.status(404).json({ message: "User not found" });
    }

    res.json({
        username: foundUser.username,
        password: foundUser.password
    });
});

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});