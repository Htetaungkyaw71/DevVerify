import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "@/store/hooks";
import { setCredentials } from "@/store/authSlice";
import api from "@/lib/api";

export default function OAuthSuccess() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const finalizeLogin = async () => {
      try {
        const response = await api.get("/me");
        dispatch(setCredentials({ user: response.data?.user ?? null }));
        navigate("/");
      } catch {
        navigate("/auth", { replace: true });
      }
    };

    void finalizeLogin();
  }, [dispatch, navigate]);

  return <div>Logging you in...</div>;
}
