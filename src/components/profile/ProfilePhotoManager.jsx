import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

import { API_BASE } from "../../api/api";
import { useImageKitUpload } from "../../hooks/useImageKitUpload";
import ImageCropModal from "./ImageCropModal";

const ProfilePhotoManager = forwardRef(({
  token,
  currentUserId,
  onProfileUpdated,
}, ref) => {

  const { uploadImageKit } = useImageKitUpload();

  // Hidden file inputs
  const profileInputRef = useRef(null);
  const coverInputRef = useRef(null);

  // Camera / Gallery mode
  const [captureMode, setCaptureMode] = useState("");

  // What are we uploading?
  const [uploadType, setUploadType] = useState(null);

  // Crop state
  const [cropImage, setCropImage] = useState(null);
  const [cropFile, setCropFile] = useState(null);

  // Upload progress
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  /*
      PUBLIC FUNCTIONS

      These can be called from Profile.jsx

      photoManager.current.openProfile("camera")

      photoManager.current.openCover("gallery")
  */

  useImperativeHandle(ref, () => ({

    openProfile(mode = "gallery") {

      setUploadType("profilePic");
      setCaptureMode(mode);

      setTimeout(() => {
        profileInputRef.current?.click();
      }, 100);
    },

    openCover(mode = "gallery") {

      setUploadType("coverPhoto");
      setCaptureMode(mode);

      setTimeout(() => {
        coverInputRef.current?.click();
      }, 100);
    },

  }));

  /*
      File selected

      (We'll finish this in Part 2)
  */

  const onFileSelected = (file) => {

    if (!file) return;

    setCropFile(file);

    setCropImage(
      URL.createObjectURL(file)
    );
  };

  return (
    <>

      {/* PROFILE INPUT */}

      <input
        ref={profileInputRef}
        hidden
        type="file"
        accept="image/*"
        capture={
          captureMode === "camera"
            ? "environment"
            : undefined
        }
        onChange={(e) =>
          onFileSelected(
            e.target.files?.[0]
          )
        }
      />

      {/* COVER INPUT */}

      <input
        ref={coverInputRef}
        hidden
        type="file"
        accept="image/*"
        capture={
          captureMode === "camera"
            ? "environment"
            : undefined
        }
        onChange={(e) =>
          onFileSelected(
            e.target.files?.[0]
          )
        }
      />

      {/* Crop Modal */}

      <ImageCropModal
        open={!!cropImage}
        image={cropImage}
        aspect={
          uploadType === "coverPhoto"
            ? 16 / 9
            : 1
        }
        cropShape={
          uploadType === "profilePic"
            ? "round"
            : "rect"
        }
        onCancel={() => {

          setCropImage(null);
          setCropFile(null);

        }}

        onCropComplete={() => {

          /*
             Upload comes in Part 2
          */

        }}
      />

    </>
  );

});

export default ProfilePhotoManager;