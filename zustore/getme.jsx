
import { useEffect } from "react";
import api from "../src/services/api";
import useUserStore from "./store"

const FetchUser = () => {
  const setUser = useUserStore((state) => state.setUser);

  useEffect(() => {
    const getUser = async () => {
      try {
        const res = await api.get("/api/user/profile", {
          withCredentials: true,
        });
        setUser(res.data.user);
      } catch (err) {
        console.error("User fetch error:", err);
      }
    };
    getUser();
  }, [setUser]);

  return null;
};

export default FetchUser;
