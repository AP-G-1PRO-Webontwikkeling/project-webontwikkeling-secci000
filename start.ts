import express from "express";
//import graphicsCardsData from './json/graphicsCards.json';
//import manufacturersData from './json/manufacturers.json';
import { MongoClient, ObjectId } from "mongodb";

const uri = "mongodb+srv://matthewwan:matthewwan@cluster0.ocj6det.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri);
const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.set("port", 3000);

interface GraphicsCard {
    id: number;
    name: string;
    description: string;
    price: number;
    productionStatus: boolean;
    releaseDate: string;
    imageURL: string;
    manufacturer: string;
    recommendedUsage: string[];
    manufacturerInfo: {
        id: string;
        name: string;
        foundedYear: number;
        headquarters: string;
        website: string;
        imageURL: string;
    };
}

interface Manufacturer{
    id: number;
    name: string;
    foundedYear: number;
    headquarters: string;
    website: string;
    imageURL: string;
}

let cards: GraphicsCard[] = [];
let manufacturers: Manufacturer[] = [];

async function fetchAndStoreData() {
    const graphicsCardsResponse = await fetch("https://raw.githubusercontent.com/AP-G-1PRO-Webontwikkeling/project-webontwikkeling-secci000/main/json/graphicsCards.json");
    const graphicsCardsData: GraphicsCard[] = await graphicsCardsResponse.json();

    const manufacturersResponse = await fetch("https://raw.githubusercontent.com/AP-G-1PRO-Webontwikkeling/project-webontwikkeling-secci000/main/json/manufacturers.json");
    const manufacturersData: Manufacturer[] = await manufacturersResponse.json();

    const db = client.db("gcAndManu");
    const graphicsCardsCollection = db.collection("graphicsCards");
    const manufacturersCollection = db.collection("manufacturers");

    await graphicsCardsCollection.insertMany(graphicsCardsData);
    await manufacturersCollection.insertMany(manufacturersData);

    return { graphicsCardsData, manufacturersData };
}

async function loadData() {
    const db = client.db("gcAndManu");
    const graphicsCardsCollection = db.collection("graphicsCards");
    const manufacturersCollection = db.collection("manufacturers");

    const graphicsCardsCount = await graphicsCardsCollection.countDocuments();
    const manufacturersCount = await manufacturersCollection.countDocuments();

    if (graphicsCardsCount === 0 || manufacturersCount === 0) {
        const { graphicsCardsData, manufacturersData } = await fetchAndStoreData();
        cards = graphicsCardsData;
        manufacturers = manufacturersData;
    } else {
        cards = await client.db("gcAndManu").collection("graphicsCards").find<GraphicsCard>({}).toArray();
        manufacturers = await client.db("gcAndManu").collection("manufacturers").find<Manufacturer>({}).toArray();
    }
}

app.get("/", (req, res) => {
    const sortField = typeof req.query.sortField === "string" ? req.query.sortField : "name";
    const sortDirection = typeof req.query.sortDirection === "string" ? req.query.sortDirection : "asc";
    const searchQuery = typeof req.query.q === "string" ? req.query.q.toLowerCase() : "";

    let filteredCards = cards.filter(card => 
        card.name.toLowerCase().includes(searchQuery)
    );

    //let sortedCards = [...cards].sort((a, b) => {
        let sortedCards = filteredCards.sort((a, b) =>{
        if (sortField === "name") {
            return sortDirection === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
        } else if (sortField === "description") {
            return sortDirection === "asc" ? a.description.localeCompare(b.description) : b.description.localeCompare(a.description);
        } else if (sortField === "price") {
            return sortDirection === "asc" ? a.price - b.price : b.price - a.price;
        } else if (sortField === "releaseDate") {
            const releaseDateA = new Date(a.releaseDate).getTime();
            const releaseDateB = new Date(b.releaseDate).getTime();
            return sortDirection === "asc" ? releaseDateA - releaseDateB : releaseDateB - releaseDateA;
        } else {
            return 0;
        }
    });
    const sortFields = [
        { value: 'name', text: 'Name', selected: sortField === 'name' ? 'selected' : '' },
        { value: 'description', text: 'Description', selected: sortField === 'description' ? 'selected' : '' },
        { value: 'price', text: 'Price', selected: sortField === 'price' ? 'selected' : '' },
        { value: 'releaseDate', text: 'ReleaseDate', selected: sortField === 'releaseDate' ? 'selected' : '' },
    ];

    const sortDirections = [
        { value: 'asc', text: 'Ascending', selected: sortDirection === 'asc' ? 'selected' : '' },
        { value: 'desc', text: 'Descending', selected: sortDirection === 'desc' ? 'selected' : '' }
    ];
    res.render("cards", {
        graphicsCards: cards,
        manufacturers: manufacturers,
        cards: sortedCards,
        sortFields: sortFields,
        sortDirections: sortDirections,
        sortField: sortField,
        sortDirection: sortDirection,
        q: searchQuery
    });
});
app.get("/detail/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const card = cards.find(card => card.id === id);
    res.render('detail', { card });
});
app.get("/manufacturers", (req, res)=>{
res.render('manufacturers', {manufacturers: manufacturers});
})
app.get("/manufacturer/:id", (req, res) => {
    const id = req.params.id;
    const manufacturer = manufacturers.find(manufacturer => manufacturer.id === parseInt(id));

    if (manufacturer) {
        res.render('manufacturerDetail', { manufacturer });
    } else {
        res.status(404).send('Manufacturer not found');
    }
});


app.get("/edit/:id", async (req, res) => {
    const id = req.params.id;
    
    try {
        const db = client.db("gcAndManu");
        const graphicsCardsCollection = db.collection("graphicsCards");
        const card = await graphicsCardsCollection.findOne({ _id: new ObjectId(id) });

        if (!card) {
            return res.status(404).send('Graphics card not found');
        }

        res.render('edit', { card });
    } catch (error) {
        console.error("Error retrieving graphics card for editing:", error);
        res.status(500).send('Internal Server Error');
    }
});

/*app.listen(app.get("port"),async () => {
    let response = await fetch("https://raw.githubusercontent.com/AP-G-1PRO-Webontwikkeling/project-webontwikkeling-secci000/main/json/graphicsCards.json")
    cards = await response.json();
    console.log("[server] http://localhost:" + app.get("port"))
}
);*/
app.listen(app.get("port"), async () => {
    await client.connect();
    await loadData();
    console.log("[server] http://localhost:" + app.get("port"));
});