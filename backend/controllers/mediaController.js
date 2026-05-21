import { sql } from "../config/db.js";

export const getAllMovies=async(req,res)=>
{
    try{
        const movieQuery=
        await sql
        `
        SELECT * FROM media
        WHERE type='Movie'

        `;
        
        return res.status(200).json({success:true,data:movieQuery});


          
    }
    catch(error)
    
    {
        return res.status(500).json({success:false,message:error.message})

    }
}

export const getAllSeries=async(req,res)=>
{
    try{ 
         const seriesQuery=
        await sql
        `
        SELECT * FROM media
        WHERE type='Series'

        `;
        
        return res.status(200).json({success:true,data:seriesQuery});
    }

    catch(error)
    {
        return res.status(500).json({success:false,message:error.message})  
    }
}

export const getMovieByID=async(req,res)=>
{
    try
    {
        const movieid=Number(req.params.movieId);
        const movieQuery=
        await sql
        `
        SELECT M.* ,MO.duration
        FROM media M
        JOIN movie MO ON m.mediaid=mo.mediaid
        WHERE M.mediaid=${Number(req.params.movieId)}
        `;

        const movieActorsQuery=
         await sql`
         SELECT A.*
         FROM actor A
         JOIN mediaactor MA ON A.actorid=MA.actorid
         WHERE MA.mediaid=${movieid}
         
         `;

        const movieStudioQuery=
        await sql`
        SELECT S.*
        FROM studio S
        JOIN mediastudio MS ON S.studioid=MS.studioid
        WHERE MS.mediaid = ${movieid}
         
        `;

        const movieGenreQuery=
        await sql`
        SELECT G.*
        FROM genre G
        JOIN mediagenre MG ON G.genreid=MG.genreid
        WHERE MG.mediaid =${movieid}
         
        `;


        const movieDirectorQuery=
        await sql`
        SELECT D.*
        FROM director D
        JOIN mediadirector MD ON D.directorid=MD.directorid
        WHERE MD.mediaid =${movieid}
         
        `;

        const movieAwardQuery=
        await sql`
        SELECT A.*
        FROM award A
        JOIN mediaaward MA ON A.awardid=MA.awardid
        WHERE MA.mediaid=${movieid}
         
        `;

        const movieData=movieQuery[0];
        if(movieData)
        {
            movieData.actors=movieActorsQuery;
            movieData.studios=movieStudioQuery;
            movieData.genres=movieGenreQuery;
            movieData.directors=movieDirectorQuery;
            movieData.awards=movieAwardQuery;
        }
        return res.status(200).json({success:true,data:movieData});


    }
    catch(error)
    {
        return res.status(500).json({success:false,message:error.message})

    }
}


export const getSeriesByID=async(req,res)=>
{
    try
    {
        const mediaid=Number(req.params.seriesId);
        // First, get the seriesid using the mediaid
        const seriesIdRow = await sql`
        SELECT seriesid FROM series WHERE mediaid = ${mediaid}
        `;
        if (seriesIdRow.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Series not found'
            });
        }
      

        const seriesQuery=
          await sql
          `
          SELECT M.* ,S.isongoing
          FROM media M
          JOIN series S ON m.mediaid=S.mediaid
          WHERE M.mediaid=${mediaid}


        

          `;

        const seriesActorsQuery=
            await sql` 
            SELECT A.*
            FROM actor A
            JOIN mediaactor MA ON A.actorid=MA.actorid
            WHERE MA.mediaid =${mediaid}
          
            `;

        const seriesStudioQuery=
        await sql`
        SELECT S.*
        FROM studio S
        JOIN mediastudio MS ON S.studioid=MS.studioid
        WHERE MS.mediaid = ${mediaid}
        
        `;

        const seriesGenreQuery=
        await sql`
        SELECT G.*
        FROM genre G
        JOIN mediagenre MG ON G.genreid=MG.genreid
        WHERE MG.mediaid = ${mediaid}
        `;

        const seriesDirectorQuery=
        await sql`
        SELECT D.*
        FROM director D
        JOIN mediadirector MD ON D.directorid=MD.directorid
        WHERE MD.mediaid = ${mediaid}
            
        `;

        const seriesAwardQuery=
        await sql`
        SELECT A.*
        FROM award A
        JOIN mediaaward MA ON A.awardid=MA.awardid
        WHERE MA.mediaid = ${mediaid}
        `;

        
        const seasonQuery=
        await sql`
        SELECT *,
         COUNT(*) OVER() AS total_seasons
        FROM season
        WHERE seriesid=${seriesIdRow[0].seriesid}
        `;

        const episodeQuery=
        await sql`
        SELECT E.*, S.seasonno AS seasonnumber,
        S.seasonid as season_seasonid,

        COUNT(*) OVER() AS total_episodes
        FROM episode E
        JOIN season S ON E.seasonid=S.seasonid
        WHERE S.seriesid=${seriesIdRow[0].seriesid}
        ORDER BY S.seasonno, E.episodeno
        `;

        const seriesData=seriesQuery[0];
        if(seriesData)
        {
            seriesData.actors=seriesActorsQuery;
            seriesData.studios=seriesStudioQuery;
            seriesData.genres=seriesGenreQuery;
            seriesData.directors=seriesDirectorQuery;
            seriesData.awards=seriesAwardQuery;
            seriesData.seasons=seasonQuery;
            seriesData.episodes=episodeQuery;
        }
        console.log(seriesData)
        return res.status(200).json({success:true,data:seriesData});



    }
    catch(error)
    {
        return res.status(500).json({success:false,message:error.message})

    }

}

export const topRatedMovies=async(req,res)=>
{
    try{
        const movieQuery=
        await sql
        `
        SELECT * FROM media
        WHERE type='Movie'
        ORDER BY rating DESC
        LIMIT 10

        `;
        
        return res.status(200).json({success:true,data:movieQuery});
       

          
    }
    catch(error)
    
    {
        return res.status(500).json({success:false,message:error.message})

    }
}
