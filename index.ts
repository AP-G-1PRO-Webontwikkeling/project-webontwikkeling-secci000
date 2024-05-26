import express, { Express } from "express";
//import express from "express";
import { Collection, MongoClient, ObjectId } from "mongodb";
import path from "path";
import session from "./session";
import dotenv from "dotenv";
import {connect} from "./database";
import { secureMiddleware } from "./middleware/secureMiddleware";
import { flashMiddleware } from "./middleware/flashMiddleware";
import { homeRouter } from "./routers/homeRouter";
import { loginRouter } from "./routers/loginRouter";
dotenv.config();
const uri = "mongodb+srv://matthewwan:matthewwan@cluster0.ocj6det.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri);
//const app = express();
const collection: Collection<GraphicsCard> = client.db("gcAndManu").collection<GraphicsCard>("graphicsCards");

const app : Express = express();

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(session);
app.use(flashMiddleware);
app.set('views', path.join(__dirname, "views"));

app.set("port", process.env.PORT || 3000);

app.use("/", loginRouter());
app.use("/", secureMiddleware, homeRouter());

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

interface Manufacturer {
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

app.get("/cards", (req, res) => {
    const sortField = typeof req.query.sortField === "string" ? req.query.sortField : "name";
    const sortDirection = typeof req.query.sortDirection === "string" ? req.query.sortDirection : "asc";
    const searchQuery = typeof req.query.q === "string" ? req.query.q.toLowerCase() : "";

    let filteredCards = cards.filter(card => 
        card.name.toLowerCase().includes(searchQuery)
    );

    let sortedCards = filteredCards.sort((a, b) => {
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

app.get("/manufacturers", (req, res) => {
    res.render('manufacturers', { manufacturers: manufacturers });
});

app.get("/manufacturer/:id", (req, res) => {
    const id = req.params.id;
    const manufacturer = manufacturers.find(manufacturer => manufacturer.id === parseInt(id));

    if (manufacturer) {
        res.render('manufacturerDetail', { manufacturer });
    } else {
        res.status(404).send('Manufacturer not found');
    }
});

async function getCardById(id: number) {
    return await collection.findOne({ id: id });
}

async function UpdateCard(id: ObjectId, card: Partial<GraphicsCard>) {
    const updateResult = await collection.updateOne({ _id: id }, { $set: card });
    console.log(`Matched ${updateResult.matchedCount} document(s) and modified ${updateResult.modifiedCount} document(s).`);
    return updateResult;
}

app.get("/login", async (req, res) => {

    res.render("login");
});

app.get("/cards/:id/edit", async (req, res) => {
    let id: number = parseInt(req.params.id);
    let card: GraphicsCard | null = await getCardById(id);
    res.render("edit", {
        card: card
    });
});

app.post("/cards/:id/edit", async (req, res) => {
    try {
        const id = new ObjectId(req.params.id);

        const updatedCard: Partial<GraphicsCard> = {
            name: req.body.name,
            description: req.body.description,
            price: parseFloat(req.body.price),
            releaseDate: req.body.releaseDate,
            imageURL: req.body.imageURL,
            manufacturer: req.body.manufacturer,
            recommendedUsage: req.body.recommendedUsage ? req.body.recommendedUsage.split(',') : [],
            manufacturerInfo: {
                id: req.body.manufacturerId,
                name: req.body.manufacturerName,
                foundedYear: parseInt(req.body.foundedYear),
                headquarters: req.body.headquarters,
                website: req.body.website,
                imageURL: req.body.manufacturerImageURL,
            }
        };

        const updateResult = await UpdateCard(id, updatedCard);
        if (updateResult.matchedCount === 0) {
            res.status(404).send('Card not found');
        } else {
            res.redirect("/");
        }
    } catch (error) {
        res.status(500).send('Internal Server Error');
    }
});



app.listen(app.get("port"), async () => {
    await client.connect();
    await loadData();
    try {
        await connect();
        console.log("Server started on http://localhost:" + app.get('port'));
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
    console.log("[server] http://localhost:" + app.get("port"));
});
