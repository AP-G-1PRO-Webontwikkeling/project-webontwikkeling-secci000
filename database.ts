import dotenv from "dotenv";
dotenv.config();
import { MongoClient } from "mongodb";
import { User } from "./types";
import bcrypt from "bcrypt";

export const MONGODB_URI = process.env.MONGODB_URI ?? "mongodb://localhost:27017";

export const client = new MongoClient(MONGODB_URI);

export const userCollection = client.db("login-express").collection<User>("users");

export interface GraphicsCard {
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

export interface Manufacturer {
    id: number;
    name: string;
    foundedYear: number;
    headquarters: string;
    website: string;
    imageURL: string;
}
const saltRounds : number = 10;

async function exit() {
    try {
        await client.close();
        console.log("Disconnected from database");
    } catch (error) {
        console.error(error);
    }
    process.exit(0);
}

async function createInitialUser() {
    if (await userCollection.countDocuments() > 0) {
        return;
    }
    let email : string | undefined = process.env.ADMIN_EMAIL;
    let password : string | undefined = process.env.ADMIN_PASSWORD;
    if (email === undefined || password === undefined) {
        throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set in environment");
    }
    await userCollection.insertOne({
        email: email,
        password: await bcrypt.hash(password, saltRounds),
        role: "ADMIN"
    });
}

export async function login(email: string, password: string) {
    if (email === "" || password === "") {
        throw new Error("Email and password required");
    }
    let user : User | null = await userCollection.findOne<User>({email: email});
    if (user) {
        if (await bcrypt.compare(password, user.password!)) {
            return user;
        } else {
            throw new Error("Password incorrect");
        }
    } else {
        throw new Error("User not found");
    }
}

export async function connect() {
    await client.connect();
    await createInitialUser();
    console.log("Connected to database");
    process.on("SIGINT", exit);
}