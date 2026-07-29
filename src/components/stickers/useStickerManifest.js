import { useEffect, useState } from "react";

export default function useStickerManifest() {
  const [manifest, setManifest] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/stickers/manifest.json")
      .then((r) => r.json())
      .then((data) => {
        setManifest(data);
        setLoading(false);
      })
      .catch(() => {
        setManifest({});
        setLoading(false);
      });
  }, []);

  return { manifest, loading };
}