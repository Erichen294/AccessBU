const { MongoClient, ServerApiVersion } = require('mongodb');

const uri = "mongodb+srv://accessbu:smartsys@cluster0.twbrrdm.mongodb.net/?retryWrites=true&w=majority";

async function retrieveData() {
    const client = new MongoClient(uri, {
        serverApi: {
            version: ServerApiVersion.v1,
            strict: true,
            deprecationErrors: true,
        }
        });

    try {
        await client.connect();

        const database = client.db('accessbu'); // Replace 'your_database_name' with your actual database name
        const collection = database.collection('nodes'); // Replace 'your_collection_name' with your actual collection name

        // Find all documents in the collection
        const documents = await collection.find({}).toArray();
        console.log('Retrieved documents:');
        // console.log(documents[1].Latitude);
        // console.log(documents[2].Latitude);
        // console.log(documents[3].Latitude);
        // console.log(documents[4].Latitude);
        for (let i = 0; i < documents.length; i++) {
            console.log(documents[i].Latitude);
        }
    } finally {
        await client.close();
    }
}

retrieveData().catch(console.error);
