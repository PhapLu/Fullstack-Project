import dotenv from 'dotenv'
dotenv.config()

import mongoose from 'mongoose'
const connectString = process.env.NODE_ENV=='production' ? process.env.MONGODB_CONNECTION_STRING : process.env.MONGODB_LOCAL_CONNECTION_STRING
console.log(connectString)
class Database {
    constructor() {
        this.connect();
    }

    connect() {
        mongoose.set('debug', true); // Enable debugging if needed
        mongoose.connect(connectString, {
        })
        .then(() => {
            console.log('Connected to MongoDB Atlas');
        })
        .catch((err) => {
            console.error('Error connecting to MongoDB Atlas:', err);
        });
    }

    static getInstance() {
        if (!Database.instance) {
            Database.instance = new Database();
        }
        return Database.instance;
    }
}

const instanceMongodb = Database.getInstance()
export default instanceMongodb