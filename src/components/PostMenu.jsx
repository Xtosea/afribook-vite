import React, { useState, useEffect, useRef } from "react";

import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Bookmark,
  Link2,
  Pin,
  Flag,
} from "lucide-react";

import { API_BASE } from "../api/api";

import EditPostModal from "./EditPostModal";
import ReportPostModal from "./ReportPostModal";

const PostMenu = ({
  post,
  token,
  currentUser,
  onDeleted,
  onUpdated,
}) => {

  const [open, setOpen] = useState(false);

  const [showEdit, setShowEdit] =
    useState(false);

  const [showReport, setShowReport] =
    useState(false);

  const menuRef = useRef(null);

  // =========================
  // SAFE OWNER CHECK
  // =========================

  const isOwner =
    currentUser?._id?.toString() ===
    post?.user?._id?.toString();

  // =========================
  // CLOSE ON OUTSIDE CLICK
  // =========================

  useEffect(() => {

    const handleClickOutside = (e) => {

      if (
        menuRef.current &&
        !menuRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {

      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };

  }, []);

  // =========================
  // DELETE POST
  // =========================

  const handleDelete = async () => {

    const confirmDelete =
      window.confirm(
        "Delete this post?"
      );

    if (!confirmDelete) return;

    try {

      const res = await fetch(
        `${API_BASE}/api/posts/${post._id}`,
        {
          method: "DELETE",

          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error(
          "Delete failed"
        );
      }

      // REMOVE FROM UI
      onDeleted?.(post._id);

      setOpen(false);

    } catch (err) {

      console.error(err);

      alert("Delete failed");
    }
  };

  // =========================
  // SAVE POST
  // =========================

  const handleSave = async () => {

    try {

      const res = await fetch(
        `${API_BASE}/api/posts/${post._id}/save`,
        {
          method: "PUT",

          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error(
          "Save failed"
        );
      }

      alert("Post saved");

      setOpen(false);

    } catch (err) {

      console.error(err);

      alert("Save failed");
    }
  };

  // =========================
  // PIN POST
  // =========================

  const handlePin = async () => {

    try {

      const res = await fetch(
        `${API_BASE}/api/posts/${post._id}/pin`,
        {
          method: "PUT",

          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error(
          "Pin failed"
        );
      }

      alert("Post pinned");

      setOpen(false);

    } catch (err) {

      console.error(err);

      alert("Pin failed");
    }
  };

  // =========================
  // COPY LINK
  // =========================

  const handleCopyLink = async () => {

    try {

      const url =
        `${window.location.origin}/post/${post._id}`;

      await navigator.clipboard.writeText(
        url
      );

      alert("Link copied");

      setOpen(false);

    } catch (err) {

      console.error(err);

      alert("Failed to copy link");
    }
  };

  return (

    <div
      className="relative"
      ref={menuRef}
    >

      {/* MENU BUTTON */}

      <button
        onClick={() =>
          setOpen(!open)
        }
        className="
          p-2
          rounded-full
          hover:bg-gray-100
          transition
        "
      >
        <MoreHorizontal size={20} />
      </button>

      {/* MENU */}

      {open && (

        <div
          className="
            absolute
            right-0
            top-12
            bg-white
            shadow-2xl
            rounded-2xl
            border
            w-60
            z-50
            overflow-hidden
          "
        >

          {/* OWNER OPTIONS */}

          {isOwner && (

            <>

              <button
                onClick={() => {
                  setShowEdit(true);
                  setOpen(false);
                }}
                className="
                  flex
                  items-center
                  gap-3
                  w-full
                  px-4
                  py-3
                  hover:bg-gray-100
                  transition
                "
              >
                <Pencil size={18} />
                Edit Post
              </button>

              <button
                onClick={handleDelete}
                className="
                  flex
                  items-center
                  gap-3
                  w-full
                  px-4
                  py-3
                  hover:bg-gray-100
                  text-red-500
                  transition
                "
              >
                <Trash2 size={18} />
                Delete Post
              </button>

              <button
                onClick={handlePin}
                className="
                  flex
                  items-center
                  gap-3
                  w-full
                  px-4
                  py-3
                  hover:bg-gray-100
                  transition
                "
              >
                <Pin size={18} />
                Pin Post
              </button>

            </>
          )}

          {/* SAVE */}

          <button
            onClick={handleSave}
            className="
              flex
              items-center
              gap-3
              w-full
              px-4
              py-3
              hover:bg-gray-100
              transition
            "
          >
            <Bookmark size={18} />
            Save Post
          </button>

          {/* REPORT */}

          <button
            onClick={() => {
              setShowReport(true);
              setOpen(false);
            }}
            className="
              flex
              items-center
              gap-3
              w-full
              px-4
              py-3
              hover:bg-gray-100
              text-red-500
              transition
            "
          >
            <Flag size={18} />
            Report Post
          </button>

          {/* COPY LINK */}

          <button
            onClick={handleCopyLink}
            className="
              flex
              items-center
              gap-3
              w-full
              px-4
              py-3
              hover:bg-gray-100
              transition
            "
          >
            <Link2 size={18} />
            Copy Link
          </button>

        </div>
      )}

      {/* EDIT MODAL */}

      {showEdit && (

        <EditPostModal
          post={post}
          token={token}
          onClose={() =>
            setShowEdit(false)
          }
          onUpdated={onUpdated}
        />

      )}

      {/* REPORT MODAL */}

      {showReport && (

        <ReportPostModal
          post={post}
          token={token}
          onClose={() =>
            setShowReport(false)
          }
        />

      )}

    </div>
  );
};

export default PostMenu;