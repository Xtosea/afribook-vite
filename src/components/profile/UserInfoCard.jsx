import React from "react";

const UserInfoCard = ({ user }) => {
  return (
    <div className="bg-white p-4 rounded-xl shadow space-y-2">
      <h3 className="font-semibold text-lg">About</h3>

      <p>📖 Intro: {user.intro}</p>
      <p>🎂 DOB: {user.dob}</p>
      <p>📞 Phone: {user.phone}</p>
      <p>🎓 Education: {user.education}</p>
      <p>🌍 Origin: {user.origin}</p>
      <p>💍 Status: {user.maritalStatus}</p>
      <p>📧 Email: {user.email}</p>
    </div>
  );
};

export default UserInfoCard;