
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config({ path: "./.env" });


function connecter (){
    mongoose.connect(process.env.MONGODB_URI)
    .then(()=>{
        console.log('Database connected')
    })
    .catch((error)=>{
        console.log('Failed To Connect',error)
    })
}

export default connecter