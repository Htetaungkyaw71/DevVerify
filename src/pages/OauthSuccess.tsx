import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "@/store/hooks";
import { setToken } from "@/store/authSlice";

export default function OAuthSuccess() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      dispatch(setToken(token));
      navigate("/");
    }
  }, [dispatch, navigate]);

  return <div>Logging you in...</div>;
}
