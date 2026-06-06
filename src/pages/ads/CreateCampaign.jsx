import React, { useState } from "react";
import { API_BASE } from "../../api/api";

const CreateCampaign = () => {
  const token = localStorage.getItem("token");

  const [form, setForm] = useState({
    title: "",
    description: "",
    mediaUrl: "",
    adType: "video",
    budget: "",
  });

  const [loading, setLoading] =
    useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]:
        e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const res = await fetch(
        `${API_BASE}/api/ad/create`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
            Authorization:
              `Bearer ${token}`,
          },
          body: JSON.stringify(form),
        }
      );

      const data =
        await res.json();

      if (!res.ok) {
        return alert(
          data.error ||
          "Failed"
        );
      }

      alert(
        "Campaign created successfully"
      );

      setForm({
        title: "",
        description: "",
        mediaUrl: "",
        adType: "video",
        budget: "",
      });

    } catch (err) {
      console.error(err);
      alert(
        "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-4">

      <h1 className="text-2xl font-bold mb-6">
        Create Campaign
      </h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-4"
      >

        <input
          type="text"
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Campaign title"
          className="w-full p-3 rounded bg-gray-900"
          required
        />

        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Description"
          className="w-full p-3 rounded bg-gray-900"
        />

        <input
          type="text"
          name="mediaUrl"
          value={form.mediaUrl}
          onChange={handleChange}
          placeholder="Media URL"
          className="w-full p-3 rounded bg-gray-900"
          required
        />

        <select
          name="adType"
          value={form.adType}
          onChange={handleChange}
          className="w-full p-3 rounded bg-gray-900"
        >
          <option value="video">
            Video
          </option>

          <option value="story">
            Story
          </option>

          <option value="reel">
            Reel
          </option>

          <option value="banner">
            Banner
          </option>
        </select>

        <input
          type="number"
          name="budget"
          value={form.budget}
          onChange={handleChange}
          placeholder="Budget"
          className="w-full p-3 rounded bg-gray-900"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-green-600 px-5 py-3 rounded-xl"
        >
          {loading
            ? "Creating..."
            : "Create Campaign"}
        </button>

      </form>

    </div>
  );
};

export default CreateCampaign;