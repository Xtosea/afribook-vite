import React, {
  useEffect,
  useState,
} from "react";

import { API_BASE } from "../../api/api";

const TrendingHashtags = () => {

  const [hashtags, setHashtags] = useState([]);

  useEffect(() => {

    const loadHashtags = async () => {

      try {

        const res = await fetch(
          `${API_BASE}/api/hashtags/trending?limit=10`
        );

        const data = await res.json();

        setHashtags(
          data.hashtags || []
        );

      } catch (err) {

        console.log(err);

      }

    };

    loadHashtags();

  }, []);

  return (

    <div className="flex flex-wrap gap-2">

      {hashtags.map((tag) => (

        <button
          key={tag.name}
          className="
            px-3
            py-1
            rounded-full
            bg-blue-100
            text-blue-700
            text-sm
            hover:bg-blue-200
            transition
          "
        >
          #{tag.name}
          <span className="ml-2 text-xs text-gray-500">
            {tag.posts} posts
          </span>
        </button>

      ))}

    </div>

  );

};

export default TrendingHashtags;