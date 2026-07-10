import { useAuth } from "../context/AuthContext";
import ListingForm from "../components/marketplace/ListingForm";

export default function CreateListing() {
  const { token, currentUser } = useAuth();

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">
        Create Marketplace Listing
      </h1>

      <ListingForm
        token={token}
        currentUser={currentUser}
      />
    </div>
  );
}