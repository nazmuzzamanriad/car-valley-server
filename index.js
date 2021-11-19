
const express = require('express')
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId
const app = express()
var cors = require('cors')
const port = process.env.PORT || 5000;

app.use(express.json())
app.use(cors())
require('dotenv').config()
//mongodb configuration and client create
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.n2jo3.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db("carValley");
        const productsCollection = database.collection('cars')
        // new database collection to hold order
        const ordersCollection = database.collection('orders')
        const usersCollection = database.collection('users')
        const reviewsCollection = database.collection('reviews')
        // post method
        app.post('/cars', async (req, res) => {
            const data = req.body;
            const result = await productsCollection.insertOne(data);
            console.log(result)

            console.log(`A document was inserted with the _id: ${result.insertedId}`);

        })


        app.post('/orders', async (req, res) => {
            const data = req.body;
            const result = await ordersCollection.insertOne(data);
            console.log(`A document was inserted with the _id: ${result.insertedId}`);
            res.send(result.insertedId)



        })

        // use firebase users post
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            console.log(result);
            res.json(result);
        });


        app.post('/reviews', async (req, res) => {
            const data = req.body;
            const result = await reviewsCollection.insertOne(data);
            console.log(result)


            console.log(`A document was inserted with the _id: ${result.insertedId}`);

        })


        app.get('/reviews', async (req, res) => {
            const cursor = reviewsCollection.find({});
            const reviews = await cursor.toArray();
            console.log('get data from database', reviews)
            res.send(reviews);

        })
        // get method


        app.get('/orders', async (req, res) => {


            const email = req.query.email;


            const query = { email: email }

            const cursor = ordersCollection.find(query);
            const orders = await cursor.toArray();
            res.send(orders);
        })







        app.get('/manageorder', async (req, res) => {
            const cursor = ordersCollection.find({});
            const orders = await cursor.toArray();
            res.send(orders)
        })
        app.get('/cars', async (req, res) => {
            const cursor = productsCollection.find({});
            const cars = await cursor.toArray();
            res.send(cars)
        })


        app.get("/cars/:id", async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) };
            const car = await productsCollection.findOne(query);
            console.log(car)
            res.send(car)

        })

        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        })

        // usefirebase admin role
        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };

            const updateDoc = { $set: { role: 'admin' } };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.json(result);
        });


        // Delete api
        app.delete('/allorders/:id', async (req, res) => {
            const id = req.params.id

            const query = { _id: ObjectId(id) }
            const result = await ordersCollection.deleteOne(query)
            console.log('deleted a item', id)
            console.log(result)

            res.json(result)

        })

        // manage products delete
        app.delete('/products/:id', async (req, res) => {
            const id = req.params.id

            const query = { _id: ObjectId(id) }
            const result = await productsCollection.deleteOne(query)
            console.log('deleted a item', id)
            console.log(result)

            res.json(result)

        })



    }

    finally {
        // await client.close();
    }

}


run().catch(console.dir)


app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`database connected`)
})