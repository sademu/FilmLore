import { sql } from "../config/db.js";
export const getActorByID= async (req,res)=>
{
     const ActorID=Number(req.params.actorID)
    try{
       const actorQuery= await sql`
              SELECT * FROM Actor 
                WHERE ActorID=${ActorID}
        `;

        const actorMediaQuery= await sql`
                SELECT * FROM Media
                WHERE MediaID IN (
                    SELECT MediaID FROM MediaActor
                    WHERE ActorID=${ActorID}
                )
        `;
      
   if(actorQuery.length===0)
   {
        return res.status(404).json({success:false,message:"Actor not found"})
   }
        const actorData=actorQuery[0];
        const mediaData=actorMediaQuery;
        if(mediaData.length>0)
        {
        
         actorData.media=mediaData;

        }
        
        
                  
        
        console.log("Actor fetched" )
        res.status(200).json({success:true,data:actorData})
    }
    catch(error)
    {
          res.status(500).json({success:false,message:error.message} )
    }
}

export const getAllActors= async (req,res)=>
{
   
   try{
         const actorQuery= await sql`
              SELECT * FROM Actor
                
        `;
        if(actorQuery.length===0  )
        {
            return res.status(404).json({success:false,message:"No actors found"})
        }
        console.log("Actors fetched" )
        res.status(200).json({success:true,data:actorQuery})
   }   
    catch(error)
    {
    console.log("error in getting actor",error)
    res.status(500).json({success:false,message:error.message} )
    }
}

