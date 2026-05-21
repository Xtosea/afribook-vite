import React, { useState } from "react";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Bookmark,
  Link2,
  Pin,
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

  const [open, setOpen] =
    useState(false);

  const isOwner =
    currentUser?._id === post.user?._id;

const [showEdit, setShowEdit] =
  useState(false);

const [showReport, setShowReport] =
  useState(false);


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

      onDeleted?.(post._id);

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

    } catch (err) {

      console.error(err);

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

    } catch (err) {

      console.error(err);

    }
  };

  // =========================
  // COPY LINK
  // =========================

  const handleCopyLink = async () => {

    const url =
      `${window.location.origin}/post/${post._id}`;

    await navigator.clipboard.writeText(
      url
    );

    alert("Link copied");
  };

  return (

    <div className="relative">

      <button
        onClick={() =>
          setOpen(!open)
        }
        className="p-2 rounded-full hover:bg-gray-100"
      >
        <MoreHorizontal size={20} />
      </button>

      {open && (

        <div
          className="
            absolute
            right-0
            top-12
            bg-white
            shadow-xl
            rounded-2xl
            border
            w-60
            z-50
            overflow-hidden
          "
        >

          {isOwner && (

            <>
              <button
                className="flex items-center gap-3 w-full px-4 py-3 hover:bg-gray-100"
              >
                <Pencil size={18} />
                Edit Post
              </button>

              <button
                onClick={handleDelete}
                className="flex items-center gap-3 w-full px-4 py-3 hover:bg-gray-100 text-red-500"
              >
                <Trash2 size={18} />
                Delete Post
              </button>

              <button
                onClick={handlePin}
                className="flex items-center gap-3 w-full px-4 py-3 hover:bg-gray-100"
              >
                <Pin size={18} />
                Pin Post
              </button>
            </>
          )}

          <button
            onClick={handleSave}
            className="flex items-center gap-3 w-full px-4 py-3 hover:bg-gray-100"
          >
            <Bookmark size={18} />
            Save Post
          </button>

          <button
            onClick={handleCopyLink}
            className="flex items-center gap-3 w-full px-4 py-3 hover:bg-gray-100"
          >
            <Link2 size={18} />
            Copy Link
          </button>

        </div>
      )}

    </div>
  );
};

export default PostMenu;