const express = require("express")
const body = require("body-parser")
const cors = require("cors")
const { MongoClient } = require("mongodb")
const app = express()

const port = process.env.PORT || 3000

const url = 'mongodb+srv://logathrim:WLf6yB3JdWlp4DwP@short-url-cluster.h96gkgm.mongodb.net/?retryWrites=true&w=majority';
const client = new MongoClient(url);

function makeid(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
}

app.use(body.json())
app.use(body.urlencoded())
app.use(cors())

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html")
})

app.get("/history", (req, res) => {
    res.sendFile(__dirname + "/history.html")
})

app.get("/api/history", async (req, res) => {
    await client.connect()
    const db = client.db("jigsaw-interview")
    const collection = db.collection('short-url')

    const result = await collection.find({}).toArray()

    res.json({ result })
})

app.get("*", async (req, res) => {
    const path = req.originalUrl.slice(1)

    if(path === 'favicon.ico') {
        res.send()
        return
    }

    await client.connect()
    const db = client.db("jigsaw-interview")
    const collection = db.collection('short-url')

    const result = await collection.findOne({ path })
    await collection.updateOne({ path }, { $inc: { view: +1 } })

    res.redirect(result.url)
})

app.post("/get-url", async (req, res) => {
    const url = req.body.url
    const path = makeid(5)

    await client.connect()
    const db = client.db("jigsaw-interview")
    const collection = db.collection('short-url')

    await collection.insertOne({ url, path, view: 0 })

    res.json({shortUrl: "https://miniurl.herokuapp.com/" + path})
})

app.listen(port, function() {
    console.log("Node.js working ...")
})