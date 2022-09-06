const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
require('dotenv').config()
const port = process.env.PORT || 5000;

const app= express();

//middleware
app.use(cors()); //2 ta port a connection kre
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.4ccu5uw.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run(){
    try{
        await client.connect();
        const productCollection = client.db('emajohn').collection('product');

        app.get('/product', async(req, res)=>{
            //0 --> skip : 0 get: 0-10(10):
            //1 -->skip: 1*10 get: 11-20(10):
            //2 -->skip: 2*10 get: 21-30(10):
            console.log('query', req.query);
            const page = parseInt(req.query.page);
            const size = parseInt(req.query.size);
            const query = {};
            const cursor = productCollection.find(query);
            let products;
            if(page || size){
                products = await cursor.skip(page*size).limit(size).toArray();
            }
            else{
                products = await cursor.toArray();
            }
            res.send(products);
        });
        app.get('/productCount', async(req, res)=>{
            const count = await productCollection.estimatedDocumentCount();
            res.send({count});
        });
        //use post to get products by ids
        app.post('/productByKeys', async(req, res)=>{
            const keys = req.body;
            const ids = keys.map(id => ObjectId(id));
            const query = {_id: {$in: ids}};
            const cursor = productCollection.find(query);
            const products= await cursor.toArray();
            console.log(keys);
            res.send(products);
        })

    }
    finally{

    }

}
run().catch(console.dir);

app.get('/', (req, res)=>{
    console.log('node developer');
});

app.listen(port, ()=>{
    console.log('node server connected', port);
})