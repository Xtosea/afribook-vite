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
    text,
    music,
    stickers,
    backgroundColor,
  }) => {

console.log("uploadStory() called");

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



        const signedRes = await fetch(
          `${API_BASE}/api/r2/signed-url?contentType=${encodeURIComponent(
            file.type
          )}`
        );


        const signedData =
          await signedRes.json();



        if(
          !signedRes.ok ||
          !signedData.uploadUrl
        ){
          throw new Error(
            signedData.error ||
            "Failed R2 upload"
          );
        }



        await axios.put(
          signedData.uploadUrl,
          file,
          {
            headers:{
              "Content-Type": file.type
            },

            onUploadProgress:(event)=>{

              if(!event.total) return;

              setProgress(
                Math.round(
                  event.loaded * 100 /
                  event.total
                )
              );

            }
          }
        );



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



      const res = await fetch(
        `${API_BASE}/api/storyR2`,
        {
          method:"POST",

          headers:{
            "Content-Type":"application/json",

            Authorization:
              `Bearer ${token}`
          },

          body:JSON.stringify({

            text,

            music: musicData,

            stickers,

            backgroundColor,

            media

          })
        }
      );



      const story =
        await res.json();

  console.log("Status:", res.status);
  console.log("Response:", story);



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