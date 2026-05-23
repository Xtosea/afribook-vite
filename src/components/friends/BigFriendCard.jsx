export default function BigFriendCard({ user }) {
  const defaultProfile =
    "https://afribook-backend.onrender.com/uploads/profiles/default-profile.png";

  return (
    <div className="relative bg-white rounded-3xl shadow p-6 text-center">

      {/* BIG CORNER AVATAR */}
      <div className="relative w-32 h-32 mx-auto mb-4">

        <img
          src={user.profilePic || defaultProfile}
          className="w-32 h-32 rounded-2xl object-cover"
        />

        {/* corner glow effect */}
        <div className="absolute -top-2 -left-2 w-6 h-6 bg-blue-500 rounded-full"></div>
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-purple-500 rounded-full"></div>
        <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-green-500 rounded-full"></div>
        <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-pink-500 rounded-full"></div>

      </div>

      <h2 className="text-lg font-bold">
        {user.name}
      </h2>

      <p className="text-sm text-gray-500 mb-4">
        AfricSocial Member
      </p>

      <button className="bg-blue-600 text-white px-5 py-2 rounded-xl">
        View Profile
      </button>

    </div>
  );
}