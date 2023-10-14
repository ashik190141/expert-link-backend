const express = require('express');
const app = express();
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config()
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = "mongodb+srv://expertLink:iNxDAyEEMAJm4CyU@cluster0.p1lnucg.mongodb.net/?retryWrites=true&w=majority";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server  (optional starting in v4.7)
      await client.connect();

      const usersCollection = client.db('expertLink').collection('users');
      

      app.post('/users', async (req, res) => {
          const user = req.body;
          const result = await usersCollection.insertOne(user);
          res.send(result);
      })

      /* Admin related api */
        // check admin
        app.get('/users/admin/:email', async (req, res) => {
          const email = req?.params?.email;
          const query = { email: email }
          const user = await usersCollection.findOne(query);
          const result = { isAdmin: user?.role === 'admin'}
          res.send(result);
      })

      /* Consultant related api */
        // check consultant
        app.get('/users/consultant/:email', async (req, res) => {
          const email = req?.params?.email;
          const query = { email: email }
          const user = await usersCollection.findOne(query);
          console.log(user)
          const result = { isConsultant: user?.role === 'consultant' && user?.status === 'confirm'}
          res.send(result);
      })
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send("Expert-link is Running");
})

app.listen(port, () => {
    console.log('port no', port);
})