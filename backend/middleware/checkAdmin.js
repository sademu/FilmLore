import { sql } from "../config/db.js";

export const checkAdmin=async (req,res,next)=>
{
    try{
        const username=req.user?.username
        if(!username)
        {
            return res.status(401).json(
                {
                    message:'unauthorized,no user found'
                }
            )
        }
        const query=await sql`
        SELECT "Role" FROM "SystemUser"
        WHERE "UserName"=username
        `
        if(query.length===0)
        {
            return res.status(404).json(
                {
                    message:"user not found"
                }
            )
        }
        if(query[0].Role !='Admin')
        {
          return res.status(403).json(
            {
                message:'access denied'
            }
          )
        }
        next()

    }
    catch(error)
    {
     return res.status(500).json(
        {
            message:'server error'
        }
     )
    }
}