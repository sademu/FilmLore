import arcjet,{tokenBucket,shield,detectBot} from "@arcjet/node";
import dotenv from "dotenv";    
dotenv.config();


//init arcjet

export const aj=arcjet(
    {
        key:process.env.ARCJET_KEY,
        characteristics:["ip.src"],
        rules:[
            //shield protects ur application from commnon attacks e.g SQL injection,XSS etc
            shield({mode:"LIVE"}),
             //block malicious traffic
             detectBot({ 
                mode:"LIVE",
            
             //block all bots except seacrh engines
             allow:[
             "CATEGORY_SEARCH_ENGINE"]
    }),
    //rate limitimg

    tokenBucket({
        mode:"LIVE",
        refillRate:5,//5 requests per second
         interval:10,
        capacity:10,//max 10 requests
    
    })
]


    }
)