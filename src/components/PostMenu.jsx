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
import { toast } from "react-toastify";

const PostMenu = ({
  post,
  token,
  currentUser,
  onDeleted,
  onUpdated,
}) => {

  const [open, setOpen] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showReport, setShowReport] = useState(false);

  const [undoData, setUndoData] = useState(null);
  const [undoTimer, setUndoTimer] = useState(null);

  const menuRef = useRef(null);

  const isOwner =
    currentUser?._id?.toString() ===
    post?.user?._id?.toString();

  // CLOSE OUTSIDE
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // =========================
  // DELETE WITH UNDO
  // =========================
  const handleDelete = async () => {
    const confirmDelete = window.confirm("Delete this post?");
    if (!confirmDelete) return;

    try {
      // save for undo
      setUndoData(post);

      // optimistic UI remove
      onDeleted?.(post._id);

      setOpen(false);

      toast.success(
        <div>
          Post deleted{" "}
          <button
            onClick={handleUndo}
            className="ml-2 text-blue-500 underline"
          >
            Undo
          </button>
        </div>,
        { autoClose: 8000 }
      );

      // delay real delete
      const timer = setTimeout(async () => {
        try {
          await fetch(`${API_BASE}/api/posts/${post._id}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
        } catch (err) {
          console.error("Final delete failed:", err);
        }
      }, 8000);

      setUndoTimer(timer);

    } catch (err) {
      console.error(err);
      toast.error("Delete failed");
    }
  };

  // =========================
  // UNDO DELETE
  // =========================
  const handleUndo = async () => {
    if (!undoData) return;

    try {
      if (undoTimer) clearTimeout(undoTimer);

      const res = await fetch(
        `${API_BASE}/api/posts/${post._id}/restore`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Restore failed");

      const data = await res.json();

      onUpdated?.(data.post);

      setUndoData(null);

      toast.success("Post restored");

    } catch (err) {
      console.error(err);
      toast.error("Undo failed");
    }
  };

  // =========================
  // SAVE
  // =========================
  const handleSave = async () => {
    try {
      await fetch(`${API_BASE}/api/posts/${post._id}/save`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Post saved");
      setOpen(false);
    } catch (err) {
      toast.error("Save failed");
    }
  };

  // =========================
  // PIN
  // =========================
  const handlePin = async () => {
    try {
      await fetch(`${API_BASE}/api/posts/${post._id}/pin`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Post pinned");
      setOpen(false);
    } catch (err) {
      toast.error("Pin failed");
    }
  };

  // =========================
  // COPY LINK
  // =========================
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/post/${post._id}`
      );

      toast.success("Link copied");
      setOpen(false);
    } catch (err) {
      toast.error("Failed to copy");
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button onClick={() => setOpen(!open)}>
        <MoreHorizontal size={20} />
      </button>

      {open && (
        <div className="absolute right-0 top-12 bg-white shadow-xl rounded-xl w-60 z-50">

          {isOwner && (
            <>
              <button
                onClick={() => setShowEdit(true)}
                className="p-3 w-full hover:bg-gray-100 flex gap-2"
              >
                <Pencil size={16} /> Edit
              </button>

              <button
                onClick={handleDelete}
                className="p-3 w-full hover:bg-gray-100 flex gap-2 text-red-500"
              >
                <Trash2 size={16} /> Delete
              </button>

              <button
                onClick={handlePin}
                className="p-3 w-full hover:bg-gray-100 flex gap-2"
              >
                <Pin size={16} /> Pin
              </button>
            </>
          )}

          <button onClick={handleSave} className="p-3 w-full hover:bg-gray-100">
            <Bookmark size={16} /> Save
          </button>

          <button onClick={() => setShowReport(true)} className="p-3 w-full hover:bg-gray-100 text-red-500">
            <Flag size={16} /> Report
          </button>

          <button onClick={handleCopyLink} className="p-3 w-full hover:bg-gray-100">
            <Link2 size={16} /> Copy Link
          </button>

        </div>
      )}

      {showEdit && (
        <EditPostModal
          post={post}
          token={token}
          onClose={() => setShowEdit(false)}
          onUpdated={onUpdated}
        />
      )}

      {showReport && (
        <ReportPostModal
          post={post}
          token={token}
          onClose={() => setShowReport(false)}
        />
      )}
    </div>
  );
};

export default PostMenu;