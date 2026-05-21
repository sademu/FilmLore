import express from "express"
import { getActorByID,getAllActors } from "../controllers/actorController.js";


const router=express.Router();

router.get("/actors/:actorID",getActorByID)
router.get("/actors",getAllActors)





export default router;