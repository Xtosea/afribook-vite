import React from "react";

const AboutSection = ({ user }) => {
  const fields = [
    { label: "Name", value: user.name },
    { label: "Bio", value: user.bio },
    { label: "Intro", value: user.intro },
    { label: "Birthday", value: user.dob },
    { label: "Phone", value: user.phone },
    { label: "Education", value: user.education },
    { label: "Origin", value: user.origin },
    { label: "Marital Status", value: user.maritalStatus },
    { label: "Spouse", value: user.spouse },
    { label: "Gender", value: user.gender },
    { label: "Email", value: user.email },
    { label: "Hubby", value: user.hubby },
  ];

  return (
    <div className="bg-white rounded-xl shadow p-4 space-y-3">
      <h2 className="text-xl font-semibold">About</h2>

      {fields.map((item, index) => {
        if (!item.value) return null;

        return (
          <div
            key={index}
            className="flex justify-between border-b pb-2"
          >
            <span className="text-gray-600">
              {item.label}
            </span>

            <span className="font-medium">
              {item.value}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default AboutSection;