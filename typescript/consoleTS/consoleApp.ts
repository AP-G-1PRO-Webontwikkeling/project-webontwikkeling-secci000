import gcData from '../../json/graphicsCards.json';
import mfData from '../../json/manufacturers.json';
import * as readline from 'readline-sync';
import { GraphicsCard } from '../gcInterfaces/gcInterfaces';


const manufacturers = mfData;
const graphicsCards: GraphicsCard[] = gcData;

function main() {
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
            console.log(``);
        }
        else if (index == 3) {
            console.log(``);
        }
    }
    index = Number(readline.question(`Please enter your choice: `));
}
main();