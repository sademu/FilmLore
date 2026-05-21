import jwt from "jsonwebtoken"
import dotenv from 'dotenv'
dotenv.config()

export const verifyToken=async(req,res,next)=>
{
  try{
    const auHeader=req.headers['authorization']
    const token=auHeader && auHeader.split(" ")[1]
    console.log('authorization header',auHeader)
    if(!token)
    {
        return res.status(401).json(
            {
                message:"access token is required"
            }
        )
    }

    jwt.verify(token,process.env.TOKEN_SECRET,(err,user)=>
    {
      if(err)
      {
        return res.status(401).json(
            {
              message:  'token verification error'
            }
        )
      }
      req.user=user;
      next();
    })

  }
  catch(error)
  {
       return res.status(500).json({
        message:'server error'
       })
  }
}
