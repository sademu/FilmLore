import {neon} from "@neondatabase/serverless"
import dotenv from "dotenv"
dotenv.config()

const {PGHOST,PGDATABASE, PGUSER,PGPASSWORD}=process.env;

//creates a sql connection using our environment variable
export const sql=neon(`postgresql://${PGUSER}:${PGPASSWORD}@${PGHOST}/${PGDATABASE}?sslmode=require`)

//this sql function we export is used as a tagged templete literal ,which allows  us to write sql queries safely
 export const initDB= async function initDB() {
  try{

   //Media Table
   await sql`
     CREATE TABLE  IF NOT EXISTS Media(
     MediaID SERIAL PRIMARY KEY,
     Title VARCHAR(255) NOT NULL,
     OverView TEXT,
     Poster TEXT,
     Language VARCHAR(50),
     Rating numeric(3,2),
     Trailer TEXT,
     ReleaseYear INT,
     Country VARCHAR(100),
     Type VARCHAR(50) NOT NULL
   );`


   //Movie Table
   await sql`
     CREATE TABLE IF NOT EXISTS Movie(
     MovieID SERIAL PRIMARY KEY,
     MediaID INT REFERENCES Media(MediaID) ON DELETE CASCADE,
     Duration INT
     );`
   
     //Series Table
   await sql`
     CREATE TABLE IF NOT EXISTS Series(  
      SeriesID SERIAL PRIMARY KEY, 
      MediaID INT REFERENCES Media(MediaID) ON DELETE CASCADE,
      isOngoing BOOLEAN
      );`

    //Season Table
   await sql`
     CREATE TABLE IF NOT EXISTS Season(
     SeasonID SERIAL PRIMARY KEY,
     SeriesID INT REFERENCES Series(SeriesID) ON DELETE CASCADE,
     SeasonNO INT,
     AvgRating numeric(3,2),
    SeasonTitle VARCHAR(255)
     
     );`

    //Episode Table
   await sql`
     CREATE TABLE IF NOT EXISTS Episode(
     EpisodeID SERIAL PRIMARY KEY,
     SeasonID INT REFERENCES Season(SeasonID) ON DELETE CASCADE,
     EpisodeTitle VARCHAR(255) NOT NULL,
     AvgRating numeric(3,2),
     Duration INT,
     EpisodeNO INT
     );`

    //Actor Table
     await sql`
     CREATE TABLE IF NOT EXISTS Actor(
     ActorID SERIAL PRIMARY KEY,
     ActorName VARCHAR(255) NOT NULL,
     Picture TEXT,
     Biography TEXT,
     Nationality varchar(100),
     DOB DATE,
     Gender VARCHAR(50)
     );`

     //Director Table
     await sql`
     CREATE TABLE IF NOT EXISTS Director(
     DirectorID SERIAL PRIMARY KEY,
     DirectorName VARCHAR(255) NOT NULL,
     Picture TEXT,
     Biography TEXT,
     Nationality varchar(100),
     DOB DATE
      );`

      //Studio Table
     await sql`
     CREATE TABLE IF NOT EXISTS Studio(
     StudioID SERIAL PRIMARY KEY,
     StudioName VARCHAR(255) NOT NULL,
     Location VARCHAR(100),
     FoundedYear INT,
     Description TEXT
      );`

      //Award Table
     await sql`
     CREATE TABLE IF NOT EXISTS Award(
     AwardID SERIAL PRIMARY KEY,
     AwardName VARCHAR(255) NOT NULL,
     AwardCategory VARCHAR(100)
    
      );`

      //Genre Table
     await sql`
     CREATE TABLE IF NOT EXISTS Genre(
     GenreID SERIAL PRIMARY KEY,
     GenreName VARCHAR(100) NOT NULL
      );`

      //SystemUser Table
     await sql`
     CREATE TABLE IF NOT EXISTS SystemUser(
     UserName VARCHAR(100) PRIMARY KEY,
     Password VARCHAR(255) NOT NULL,
     FullName VARCHAR(255) NOT NULL,
     Role VARCHAR(50) NOT NULL,
     DateOfBirth DATE,
     Email VARCHAR(255) UNIQUE NOT NULL,
     ProfilePicture TEXT

      );`

      //Admin Table
     await sql`
     CREATE TABLE IF NOT EXISTS Admin(
     UserName VARCHAR(100) PRIMARY KEY REFERENCES SystemUser(UserName) ON DELETE CASCADE
     
      );`

      //User Table
     await sql`
     CREATE TABLE IF NOT EXISTS APPUser(
     UserName VARCHAR(100) PRIMARY KEY REFERENCES SystemUser(UserName) ON DELETE CASCADE
      );`

    //MediaActor Table
     await sql`
     CREATE TABLE IF NOT EXISTS MediaActor(
     MediaActorID SERIAL PRIMARY KEY,
     MediaID INT REFERENCES Media(MediaID) ON DELETE CASCADE,
     ActorID INT REFERENCES Actor(ActorID) ON DELETE CASCADE,
     CharacterName VARCHAR(255)
      );`

      //MediaDirector Table
     await sql`
     CREATE TABLE IF NOT EXISTS MediaDirector(
     MediaDirectorID SERIAL PRIMARY KEY,
     MediaID INT REFERENCES Media(MediaID) ON DELETE CASCADE,
     DirectorID INT REFERENCES Director(DirectorID) ON DELETE CASCADE
      );`

      //MediaGenre Table
     await sql`
     CREATE TABLE IF NOT EXISTS MediaGenre(
     MediaGenreID SERIAL PRIMARY KEY,
     MediaID INT REFERENCES Media(MediaID) ON DELETE CASCADE,
     GenreID INT REFERENCES Genre(GenreID) ON DELETE CASCADE
      );`

      //MediaAward Table
     await sql`
     CREATE TABLE IF NOT EXISTS MediaAward(
     MediaAwardID SERIAL PRIMARY KEY,
     MediaID INT REFERENCES Media(MediaID) ON DELETE CASCADE,
     AwardID INT REFERENCES Award(AwardID) ON DELETE CASCADE,
     Year INT
      );`

    //MediaStudio Table
     await sql`
     CREATE TABLE IF NOT EXISTS MediaStudio(
     MediaStudioID SERIAL PRIMARY KEY,
     MediaID INT REFERENCES Media(MediaID) ON DELETE CASCADE,
     StudioID INT REFERENCES Studio(StudioID) ON DELETE CASCADE
      );`

    //Watchlist Table
     await sql`
     CREATE TABLE IF NOT EXISTS Watchlist(
     WatchlistID SERIAL PRIMARY KEY,
     UserName VARCHAR(100) REFERENCES APPUser(UserName) ON DELETE CASCADE,
     MediaID INT REFERENCES Media(MediaID) ON DELETE CASCADE,
     Title VARCHAR(255) NOT NULL,
     isCompleted BOOLEAN DEFAULT FALSE
      );`

      //MovieReview Table
     await sql`
     CREATE TABLE IF NOT EXISTS MovieReview(
     ReviewID SERIAL PRIMARY KEY,
     MovieID INT REFERENCES Movie(MovieID) ON DELETE CASCADE,
     UserName VARCHAR(100) REFERENCES APPUser(UserName) ON DELETE CASCADE,
     Rating INT CHECK (Rating >=1 AND Rating <=10),
     ReviewText TEXT,
     ReviewDate DATE DEFAULT CURRENT_DATE
      );`

      
      //EpisodeReview Table
     await sql`
     CREATE TABLE IF NOT EXISTS EpisodeReview(
     ReviewID SERIAL PRIMARY KEY,
     EpisodeID INT REFERENCES Episode(EpisodeID) ON DELETE CASCADE,
     UserName VARCHAR(100) REFERENCES APPUser(UserName) ON DELETE CASCADE,
     Rating INT CHECK (Rating >=1 AND Rating <=10),
     ReviewText TEXT,
     ReviewDate DATE DEFAULT CURRENT_DATE
      );`

      //Blog Table
     await sql`
     CREATE TABLE IF NOT EXISTS Blog(
     BlogID SERIAL PRIMARY KEY,
     UserName VARCHAR(100) REFERENCES APPUser(UserName) ON DELETE CASCADE,
     Title VARCHAR(255) NOT NULL,
     Content TEXT,
     CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );`

      //BlogComment Table
     await sql`
     CREATE TABLE IF NOT EXISTS BlogComment(
     CommentID SERIAL PRIMARY KEY,
     BlogID INT REFERENCES Blog(BlogID) ON DELETE CASCADE,
     UserName VARCHAR(100) REFERENCES APPUser(UserName) ON DELETE CASCADE,
     CommentText TEXT,
     CommentDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );`

      //BlogReaction Table
     await sql`
     CREATE TABLE IF NOT EXISTS BlogReaction(
     ReactionID SERIAL PRIMARY KEY,
     BlogID INT REFERENCES Blog(BlogID) ON DELETE CASCADE,
     UserName VARCHAR(100) REFERENCES APPUser(UserName) ON DELETE CASCADE,
     ReactionType VARCHAR(50)
      );`

      //Submission Table
     await sql`
     CREATE TABLE IF NOT EXISTS Submission(
     SubmissionID SERIAL PRIMARY KEY,
     UserName VARCHAR(100) REFERENCES APPUser(UserName) ON DELETE CASCADE,
     MediaTitle VARCHAR(255) NOT NULL,
     MediaType VARCHAR(50),
     Description TEXT,
     SubmissionDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     Status VARCHAR(50) DEFAULT 'Pending'
      );`

      //Approval Table
     await sql`
     CREATE TABLE IF NOT EXISTS Approval(
     ApprovalID SERIAL PRIMARY KEY,
     SubmissionID INT REFERENCES Submission(SubmissionID) ON DELETE CASCADE,
     AdminUserName VARCHAR(100) REFERENCES Admin(UserName) ON DELETE CASCADE,
     ApprovalDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     Decision VARCHAR(50),
     Comments TEXT
      );`

// TRIGGER FUNCTION
await sql`
  CREATE OR REPLACE FUNCTION fn_set_update_timestamp()
  RETURNS TRIGGER AS $$
  BEGIN
    NEW.updatedate = CURRENT_TIMESTAMP;
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql
`;

// DROP TRIGGER — separate call, no semicolon at end
await sql`
  DROP TRIGGER IF EXISTS trg_blog_update_timestamp ON blog
`;

// CREATE TRIGGER — separate call, no semicolon at end
await sql`
  CREATE TRIGGER trg_blog_update_timestamp
  BEFORE UPDATE ON blog
  FOR EACH ROW
  EXECUTE FUNCTION fn_set_update_timestamp()
`;

// FUNCTION
await sql`
  CREATE OR REPLACE FUNCTION get_blog_with_details(p_blogid INT)
  RETURNS TABLE (
    blogid INT,
    username VARCHAR,
    title VARCHAR,
    content TEXT,
    createdate TIMESTAMP,
    updatedate TIMESTAMP,
    reaction_count BIGINT,
    comments JSON
  ) AS $$
  BEGIN
    RETURN QUERY
    SELECT
      b.blogid,
      b.username,
      b.title,
      b.content,
      b.createdate,
      b.updatedate,
      COUNT(DISTINCT r.reactionid) AS reaction_count,
      COALESCE(
        JSON_AGG(
          JSON_BUILD_OBJECT(
            'commentid', c.commentid,
            'username', c.username,
            'commenttext', c.commenttext,
            'commentdate', c.commentdate
          ) ORDER BY c.commentdate DESC
        ) FILTER (WHERE c.commentid IS NOT NULL),
        '[]'
      ) AS comments
    FROM blog b
    LEFT JOIN blogcomment c ON b.blogid = c.blogid
    LEFT JOIN blogreaction r ON b.blogid = r.blogid
    WHERE b.blogid = p_blogid
    GROUP BY b.blogid, b.username, b.title, b.content, b.createdate, b.updatedate;
  END;
  $$ LANGUAGE plpgsql
`;

// PROCEDURE
await sql`
  CREATE OR REPLACE PROCEDURE create_blog(
    p_username VARCHAR,
    p_title VARCHAR,
    p_content TEXT
  )
  LANGUAGE plpgsql AS $$
  BEGIN
    IF p_title IS NULL OR TRIM(p_title) = '' THEN
      RAISE EXCEPTION 'Title is required';
    END IF;
    IF p_content IS NULL OR TRIM(p_content) = '' THEN
      RAISE EXCEPTION 'Content is required';
    END IF;
    INSERT INTO blog (username, title, content)
    VALUES (p_username, p_title, p_content);
  END;
  $$
`;


      console.log("Database initialized successfully");

   

  }
  catch(error)
  {
    console.log("error initialising database ",error)

  }
  
}
