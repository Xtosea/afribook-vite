import React, { useEffect, useState } from "react";
import { API_BASE } from "../../api/api";

const UpComingEvents = () => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(
          `${API_BASE}/api/events/upcoming?limit=5`
        );

        const data = await res.json();

        setEvents(data.events || []);
      } catch (err) {
        console.log(err);
      }
    };

    load();
  }, []);

  return (
    <div className="space-y-3">
      {events.map((event) => (
        <div
          key={event._id}
          className="border rounded-xl p-3"
        >
          <h3 className="font-semibold">
            {event.title}
          </h3>

          <p className="text-sm text-gray-500">
            {event.location}
          </p>

          <p className="text-xs text-blue-600 mt-1">
            {event.date}
          </p>
        </div>
      ))}
    </div>
  );
};

export default UpComingEvents;