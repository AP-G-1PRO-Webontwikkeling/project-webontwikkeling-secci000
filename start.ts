import express from "express";
import graphicsCardsData from './json/graphicsCards.json';
import manufacturersData from './json/manufacturers.json';
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
    };
}
let cards: GraphicsCard[] = [];

app.get("/", (req, res) => {
    const sortField = typeof req.query.sortField === "string" ? req.query.sortField : "name";
    const sortDirection = typeof req.query.sortDirection === "string" ? req.query.sortDirection : "asc";
    let sortedCards = [...cards].sort((a, b) => {
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
        graphicsCards: graphicsCardsData,
        manufacturers: manufacturersData,
        cards: sortedCards,
        sortFields: sortFields,
        sortDirections: sortDirections,
        sortField: sortField,
        sortDirection: sortDirection
    });
});
app.get("/detail/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const card = graphicsCardsData.find(card => card.id === id);
    res.render('detail', { card });
});
app.get("/manufacturers", (req, res)=>{
res.render('manufacturers', {manufacturers: manufacturersData});
})
app.listen(app.get("port"),async () => {
    let response = await fetch("https://raw.githubusercontent.com/AP-G-1PRO-Webontwikkeling/project-webontwikkeling-secci000/main/json/graphicsCards.json")
    cards = await response.json();
    console.log("[server] http://localhost:" + app.get("port"))
}
);