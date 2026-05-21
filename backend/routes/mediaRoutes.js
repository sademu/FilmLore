import express from "express";
import { getAllMovies, getAllSeries,getMovieByID,getSeriesByID,topRatedMovies} from "../controllers/mediaController.js";

const router=express.Router();

router.get("/movies",getAllMovies);
router.get("/series",getAllSeries);
router.get("/movies/:movieId",getMovieByID);
router.get("/series/:seriesId",getSeriesByID);
router.get("/moviesTopRated",topRatedMovies);


export default router;