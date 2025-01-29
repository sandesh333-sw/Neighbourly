const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/legalListing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/neighbourly";

main().then(() => {
    console.log("connected to DB");
}).catch(err => {
    console.log(err);
});

async function main(){
    await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
    await Listing.deleteMany({}); // Delete all existing documents
    await Listing.insertMany(initData.data); // Insert raw data
    console.log("Data was reset (existing deleted, new data added)");
 }
 
 initDB();