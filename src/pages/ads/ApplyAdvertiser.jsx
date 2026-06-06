import { API_BASE }
from "../../api/api";

export default function ApplyAdvertiser() {

  const token =
    localStorage.getItem("token");

  const apply = async () => {

    await fetch(
      `${API_BASE}/api/ad/advertiser/apply`,
      {
        method: "POST",

        headers: {
          Authorization:
            `Bearer ${token}`,
        },
      }
    );

    alert(
      "Application submitted"
    );
  };

  return (
    <div className="p-4 text-white">

      <h1 className="text-2xl font-bold">
        Advertiser Program
      </h1>

      <button
        onClick={apply}
        className="bg-green-600 px-4 py-2 rounded mt-4"
      >
        Apply As Advertiser
      </button>

    </div>
  );
}