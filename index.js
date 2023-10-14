const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config()
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const port = process.env.PORT || 5000;
console.log(process.env.STRIPE_SECRET_KEY)
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
    const serviceCollection = client.db('expertLink').collection('services');
    const bookServicesCollection = client.db('expertLink').collection('book-services');
    const requestAppointmentCollection = client.db('expertLink').collection('req-appointment');
    const userPayemntCollection = client.db('expertLink').collection('payment-collection');

    // common
    // create users
    app.post('/users', async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.send(result);
    })
    //all consultant
    app.get('/consultants', async (req, res) => {
      const query = { role: "consultant", status: "confirm" }
      console.log(query)
      const result = await usersCollection.find(query).toArray();
      res.send(result);
    })

    //all services
    // app.get('/services', async (req, res) => {
    //   const query = { status: "Approved"}
    //   console.log(query)
    //   const result = await serviceCollection.find(query).toArray();
    //   res.send(result);
    // })

    /* Admin related api */
    // check admin
    app.get('/users/admin/:email', async (req, res) => {
      const email = req?.params?.email;
      const query = { email: email }
      const user = await usersCollection.findOne(query);
      const result = { isAdmin: user?.role === 'admin' }
      res.send(result);
    })
    // manage users
    app.get('/allUsers', async (req, res) => {
      const result = await usersCollection.find().toArray();
      //   for (let i = 0; i < result.length; i++){
      //       console.log(result.status);
      //   }
      res.send(result);
    })

    app.patch('/users/makeConsultant/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          status: "confirm"
        }
      }
      const result = await usersCollection.updateOne(filter, updatedDoc);
      res.send(result);
    })

    app.get('/services', async (req, res) => {
      const result = await serviceCollection.find().toArray();
      res.send(result);
    })


    app.patch('/admin/approved/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          status: "Approved"
        }
      }
      const result = await serviceCollection.updateOne(filter, updatedDoc);
      res.send(result);
    })

    app.patch('/admin/rejected/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          status: "Rejected"
        }
      }
      const result = await serviceCollection.updateOne(filter, updatedDoc);
      res.send(result);
    })

    /* Consultant related api */
    // check consultant
    app.get('/users/consultant/:email', async (req, res) => {
      const email = req?.params?.email;
      const query = { email: email }
      const user = await usersCollection.findOne(query);
      const result = { isConsultant: user?.role === 'consultant' && user?.status === 'confirm' }
      res.send(result);
    })

    //consultant details
    app.get('/consultantdetails/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await usersCollection.findOne(query);
      res.send(result);
    })

    //my services
    app.get('/myServices/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await serviceCollection.find(query).toArray();
      res.send(result);
    })

    // add service
    app.post('/consultant/addservice', async (req, res) => {
      const newService = req.body;
      const result = await serviceCollection.insertOne(newService)
      res.send(result)
    })


    //   customer

    app.post('/bookServices', async (req, res) => {
      const bookingService = req.body;
      const result = await bookServicesCollection.insertOne(bookingService);
      res.send(result);
    })

    app.get('/myFavServices/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await bookServicesCollection.find(query).toArray();
      res.send(result);
    })

    app.post('/requestAppointment', async (req, res) => {
      const reqInfo = req.body;
      const result = await requestAppointmentCollection.insertOne(reqInfo);
      res.send(result);
    })

    app.get('/myAppointment/:email', async (req, res) => {
      const email = req.params.email;
      const query = { consultantEmail: email };
      const result = await requestAppointmentCollection.find(query).toArray();
      res.send(result);
    })

    app.patch('/makeRequestAccept/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          status: `Ok, You will have appointment with me.`
        }
      }
      const result = await requestAppointmentCollection.updateOne(filter, updatedDoc);
      res.send(result);
    })

    app.patch('/makeRequestDelete/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          status: `No, i am not available.`
        }
      }
      const result = await requestAppointmentCollection.updateOne(filter, updatedDoc);
      res.send(result);
    })

    app.get('/myAppointmentList/:email', async (req, res) => {
      const email = req.params.email;
      const query = { userEmail: email };
      const result = await requestAppointmentCollection.find(query).toArray();
      res.send(result);
    })

    /* Payment */
    //payment details
    app.get('/payment/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await requestAppointmentCollection.findOne(query);
      res.send(result);
    })

    app.post('/create-payment-intent', async (req, res) => {
      const { price } = req.body;
      console.log(price)
      const amount = parseInt(price * 100);
      const paymentIntent = await stripe.paymentIntents.create({
          amount: amount,
          currency: 'usd',
          payment_method_types: ['card']
      });
      // store history
      app.post('/payments', async (req, res) => {
        const payment = req.body;
        const result = await userPayemntCollection.insertOne(payment);
        res.send(result);
    })

      // Update Class Status
      app.patch('/users/customer/paidservices/:id', async (req, res) => {
        const id = req.params.id;
        const paymentStatus = req.query.paymentStatus;
        // console.log(id, status);
        const filter = { _id: new ObjectId(id) };
        const result = await requestAppointmentCollection.findOne(filter);
        const updateDoc = {
            $set: {
                paymentStatus: paymentStatus,
            },
        };
        const updatedResult = await requestAppointmentCollection.updateOne(filter, updateDoc);
        res.send(updatedResult);

    })

      res.send({
          clientSecret: paymentIntent.client_secret
      })
      // console.log(paymentIntent.client_secret)
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