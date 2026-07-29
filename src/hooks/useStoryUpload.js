import { useState } from "react";
import axios from "axios";
import { compressStoryMedia } from "../utils/compressStoryMedia";
import useR2StoryMusic from "./r2StoryMusic";

const API_BASE = import.meta.env.VITE_API_BASE;

export function useStoryUpload() {

  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  const {
    uploadMusic,
  } = useR2StoryMusic();


  const uploadStory = async ({
  file,
  cloudinaryUrl,
  textStyle,
  text,
  music,
  stickers,
  backgroundColor,
  
}) => {


//DEBUGGING ONLY 
  console.log("FILE:", file);
  console.log("CLOUDINARY:", cloudinaryUrl);
  console.log("TEXT:", text);

  try {
    

      setLoading(true);
      setProgress(0);
      setError(null);


      let musicData = null;



      // MUSIC → R2
      if (music instanceof File) {
        musicData = await uploadMusic(music);
      } 
      else if (music) {
        musicData = music;
      }



      let media = [];


// =========================
 // DEBUGGING ONLY 
 // 
console.log("cloudinaryUrl =", cloudinaryUrl);
console.log("file =", file);
console.log("file type =", file?.type);



      // =========================
      // IMAGE FROM CLOUDINARY
      // =========================

      if (cloudinaryUrl) {

        media.push({
          url: cloudinaryUrl,
          type: "image",
        });

      }



      // =========================
      // VIDEO / AUDIO TO R2
      // =========================

      else if (file) {


        if (
          !file.type.startsWith("video/") &&
          !file.type.startsWith("audio/")
        ) {
          throw new Error(
            "Images must use Cloudinary"
          );
        }



        file = await compressStoryMedia(file);

//DEBUGGING ONLY 
console.log("Getting signed URL...");

  const signedRes = await fetch(
  `${API_BASE}/api/r2/signed-url?contentType=${encodeURIComponent(file.type)}`
);


//DEBUGGING ONLY 
console.log("Signed URL status:", signedRes.status);
console.log("Signed URL endpoint:", signedRes.url);

const signedData = await signedRes.json();


//DEBUGGING ONLY 
console.log("Signed URL response:", signedData);



        if(
          !signedRes.ok ||
          !signedData.uploadUrl
        ){
          throw new Error(
            signedData.error ||
            "Failed R2 upload"
          );
        }

//DEBUGGING ONLY 
console.log("Uploading to R2...");

        const uploadRes = await fetch(signedData.uploadUrl, {
  method: "PUT",
  body: file,
  headers: {
    "Content-Type": file.type,
  },
});

console.log("Upload status:", uploadRes.status);

if (!uploadRes.ok) {
  throw new Error("R2 upload failed");
}

console.log("Upload finished.");

//DEBUGGING ONLY 
console.log("Saving story...");

        media.push({

          url: signedData.fileUrl,

          type:
            file.type.startsWith("audio/")
            ? "audio"
            : "video"

        });

      }




      // =========================
      // SAVE STORY
      // =========================

      const token =
        localStorage.getItem("token");

//DEBUGGING ONLY 
//console.log("MEDIA BEFORE SAVE:", media);
//console.log("TEXT BEFORE SAVE:", text);
//console.log("MUSIC BEFORE SAVE:", musicData);



      const res = await fetch(
        `${API_BASE}/api/storyR2`,
        {
          method:"POST",

          headers:{
            "Content-Type":"application/json",

            Authorization:
              `Bearer ${token}`
          },

          
  JSON.stringify({
  text,
  textStyle,
  music: musicData,
  stickers,
  backgroundColor,
  media,
})
        }
      );



      const story =
        await res.json();p

 
//DEBUGGING ONLY 
 //console.log("Status:", res.status);
  //console.log("Response:", story);

console.log("Story save response:", story);



      if(!res.ok){

        throw new Error(
          story.error ||
          "Failed saving story"
        );

      }


      return story;



    } catch(err){

      console.error(
        "Story Upload Error:",
        err
      );

      setError(err.message);

      throw err;


    } finally {

      setLoading(false);

    }

  };



  return {
    uploadStory,
    loading,
    progress,
    error,
  };

}