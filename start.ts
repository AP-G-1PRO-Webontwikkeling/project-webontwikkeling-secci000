import express from "express";
import graphicsCardsData from './json/graphicsCards.json';
import manufacturersData from './json/manufacturers.json';

const app = express();
app.use(express.static("css"));
app.set("view engine", "ejs");
app.set("port", 3000);
// Load manufacturers data from JSON file
app.get("/", (req, res) => {
res.render('cards', { graphicsCards: graphicsCardsData, manufacturers: manufacturersData });
});
app.use(express.static("css"));
app.get("/detail/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const card = graphicsCardsData.find(card => card.id === id);
    res.render('detail', { card });
});

app.listen(app.get("port"), () =>
    console.log("[server] http://localhost:" + app.get("port"))
);