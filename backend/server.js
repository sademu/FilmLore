import express from "express"
import helmet  from "helmet";
import morgan from "morgan";
import cors from "cors"
import dotenv from "dotenv"
import actorRoutes from "./routes/actorRoutes.js"
import userRoutes from "./routes/userRoutes.js"
import mediaRoutes from "./routes/mediaRoutes.js"
import authRoutes from "./routes/authRoutes.js"
import movieReviewRoutes from "./routes/movieReviewRoutes.js"
import EpisodereviewRoutes from "./routes/EpisodereviewRoutes.js"
import watchlistRoutes from "./routes/watchlistRoutes.js"
import blogRoutes from "./routes/blogRoutes.js"


import {sql,initDB} from "./config/db.js"
dotenv.config()
import { aj } from "./lib/arcjet.js";

const PORT=process.env.PORT ||5000
console.log(PORT)
const app=express();
app.use(helmet())
app.use(morgan("dev"))
app.use(express.json())
app.use(cors())


app.use("/api",blogRoutes)
app.use("/api",watchlistRoutes)
app.use("/api",movieReviewRoutes)
app.use("/api",actorRoutes)
app.use("/api/user",userRoutes)
app.use("/api",mediaRoutes)
app.use("/api/auth",authRoutes)
app.use("/api",EpisodereviewRoutes)







  
app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
     initDB();
  })


  //
  