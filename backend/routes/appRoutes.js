module.exports = app => {
    const passwordHash = require("password-hash")
    const jwt = require("jsonwebtoken");
    const key = require("../config/key.json");

    const users = require("../models").Users;

    // const Tournaments = require("../controllers/tournamentController");
    // const Bookings = require("../controllers/bookingController")

    app.get("/", (req, res) => {
        res.send("Working Fine!!");
    });

    app.post("/signup", (req, res) => {
        let data = req.body.password;
        let hash = passwordHash.generate(data);
        users.create({
            username: req.body.username,
            email: req.body.email,
            password: hash,
            money: 100.0,
            role: false,
            google: false
        });
        res.send("create Success")
    })

    app.post("/login", (req, res) => {
        let data = req.body;
        users
            .findAll({
                attributes: ["id", "email", "password", "role"],
                where: { email: data.email }
            })
            .then(prom => {
                let val = passwordHash.verify(data.password, prom[0].password);
                let token;
                if (val) {
                    token = {
                        id: jwt.sign(
                            {
                                exp: Date.now() / 1000 + 60 * 60,
                                id: prom[0].id
                            },
                            key.tokenKey
                        ),
                        validity: true,
                        role: prom[0].role,
                    };
                } else {
                    token = {
                        id: jwt.sign({ id: prom[0].id }, key.tokenKey),
                        validity: false,
                    };
                }
                res.send(token);
            });
    })

    app.post("/googleLogin", async (req, res) => {
        console.log("GOOGLE LOGIN", req.body)
        // let uid = uuid()
        let uid = Math.floor(Math.random() * 100)
        let resp = await users.create({
            id: uid,
            email: req.body.email,
            password: req.body.token,
            money: 100.0,
            role: false,
            google: true,
        });

        let token = {
            id: jwt.sign(
                {
                    exp: Date.now() / 1000 + 60 * 60,
                    id: uid
                },
                key.tokenKey
            ),
            validity: true,
            role: false,
            google: true
        };

        console.log("GOOGLE LOGIN", token)
        res.send(token)
    })
}