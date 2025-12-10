import mongoose from "mongoose";

const {MONGODB_URI} = process.env;

if (!MONGODB_URI) {
    throw new Error("MONGODB_URI not defined in environment variables");
}

const connectDatabase = async(): Promise<void> => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("Successfully connect database");
    }
    catch(error) {
        if(error instanceof Error) {
            console.log(`Error connect database: ${error.message}`);
        }
        else {
            console.log("Unknown error connect database")
        }
        
        throw error;
    }
}

export default connectDatabase;