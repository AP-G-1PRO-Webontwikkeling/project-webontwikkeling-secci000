import gcData from '../../json/graphicsCards.json';
import mfData from '../../json/manufacturers.json';
import * as readline from 'readline-sync';
import { GraphicsCard } from '../gcInterfaces/gcInterfaces';


const manufacturers = mfData;

function displayGraphicsCard(graphicsCard: GraphicsCard): void {

    console.log(` 
     - id: ${graphicsCard.id}
     - name: ${graphicsCard.name}
     - description: ${graphicsCard.description}
     - price: ${graphicsCard.price}`);

    if (graphicsCard.productionStatus == true) {
        console.log(`Still in production`);
    }
    else {
        console.log(`Not in production anymore`);
    }
    console.log(`
    - releasedate: ${graphicsCard.releaseDate}
     - imageURL: ${graphicsCard.imageURL}
     - recommended usage: ${graphicsCard.recommendedUsage}
     - manufacturer: ${graphicsCard.manufacturer}
        id: ${graphicsCard.manufacturerInfo.id}
        name: ${graphicsCard.manufacturerInfo.name}
        founded year: ${graphicsCard.manufacturerInfo.foundedYear}
        headquarters: ${graphicsCard.manufacturerInfo.headquarters}
        website: ${graphicsCard.manufacturerInfo.website}`);
        

}
async function main() {
    const response = await fetch("https://raw.githubusercontent.com/AP-G-1PRO-Webontwikkeling/project-webontwikkeling-secci000/main/json/graphicsCards.json?token=GHSAT0AAAAAACOXSJVK5QDYPNHLAYDAZ2AMZPBLDTQ")
    const graphicsCards: GraphicsCard[] = await response.json();
    console.log(`1. View all data
    2. Filter by Id
    3. Exit`);
    let index: number = Number(readline.question(`Please enter your choice: `));
    while (index != 3) {
        if (index == 1) {
            graphicsCards.forEach(element => {
                console.log(`${element.name} (Id:${element.id})`)
            });
        }
        else if (index == 2) {
            let idInput: number = Number(readline.question(`Please enter the ID you want to filter by: `));
            displayGraphicsCard(graphicsCards[idInput - 1]);
        }
        else if (index == 3) {
            console.log(``);
        }
        index = Number(readline.question(`Please enter your choice: `));
    }
}
main();