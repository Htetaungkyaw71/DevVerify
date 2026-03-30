import { useEffect, useRef, useState } from "react";
import { ArrowRight, ChevronDown, LogOut } from "lucide-react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import BrandLogo from "@/components/BrandLogo";
import AppSettingsControls from "@/components/AppSettingsControls";
import api from "@/lib/api";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logout } from "@/store/authSlice";
import { authApi } from "@/store/authApi";
import { challengesApi } from "@/store/challengesApi";
import { positionsApi } from "@/store/positionsApi";
import { submissionsApi } from "@/store/submissionsApi";
import { useAppSettings } from "@/contexts/AppSettingsContext";

export default function MainNavbar() {
  const { t } = useAppSettings();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [hasSessionHint, setHasSessionHint] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("devverify:has_session") === "true";
  });
  const userMenuRef = useRef<HTMLDivElement | null>(null);

  const authUser = useAppSelector((state) => state.auth.user);
  const authInitialized = useAppSelector((state) => state.auth.initialized);

  const username =
    authUser && typeof authUser.username === "string" ? authUser.username : "U";
  const email =
    authUser && typeof authUser.email === "string" ? authUser.email : "";
  const avatar =
    authUser && typeof authUser.avatar === "string" ? authUser.avatar : "";
  const showAuthedShell = authUser || (!authInitialized && hasSessionHint);

  useEffect(() => {
    if (authUser) {
      setHasSessionHint(true);
      return;
    }

    if (authInitialized) {
      setHasSessionHint(false);
    }
  }, [authInitialized, authUser]);

  useEffect(() => {
    if (!showUserMenu) {
      return;
    }

    const onMouseDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (userMenuRef.current && !userMenuRef.current.contains(target)) {
        setShowUserMenu(false);
      }
    };

    window.addEventListener("mousedown", onMouseDown);
    return () => {
      window.removeEventListener("mousedown", onMouseDown);
    };
  }, [showUserMenu]);

  const handleLogout = async () => {
    try {
      await api.post("/logout");
    } catch {}

    dispatch(logout());
    dispatch(authApi.util.resetApiState());
    dispatch(challengesApi.util.resetApiState());
    dispatch(positionsApi.util.resetApiState());
    dispatch(submissionsApi.util.resetApiState());

    localStorage.removeItem("devverify:has_session");
    setHasSessionHint(false);

    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("devverify:draft:")) {
        localStorage.removeItem(key);
      }
    });

    setShowUserMenu(false);
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center ">
        <Link to="/" className="inline-flex items-center">
          <BrandLogo compact textClassName="text-foreground" />
        </Link>

        <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-8 text-sm text-muted-foreground">
          {showAuthedShell ? (
            <NavLink
              to="/dashboard"
              end
              className={({ isActive }) =>
                `transition-colors hover:text-foreground ${
                  isActive ? "text-foreground" : "text-muted-foreground"
                }`
              }
            >
              {t("dashboard")}
            </NavLink>
          ) : null}

          <NavLink
            to="/challenges"
            end
            className={({ isActive }) =>
              `transition-colors hover:text-foreground ${
                isActive ? "text-foreground" : "text-muted-foreground"
              }`
            }
          >
            {t("challenges")}
          </NavLink>
          <NavLink
            to="/about"
            end
            className={({ isActive }) =>
              `transition-colors hover:text-foreground ${
                isActive ? "text-foreground" : "text-muted-foreground"
              }`
            }
          >
            About
          </NavLink>
        </div>

        <div className="flex flex-1 items-center justify-end gap-3">
          <AppSettingsControls />

          {!authInitialized && hasSessionHint ? (
            <></>
          ) : // <div className="h-11 w-[100px] rounded-md ring-1 ring-border bg-secondary/40 animate-pulse" />
          !authInitialized ? null : authUser ? (
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setShowUserMenu((prev) => !prev)}
                className="flex items-center gap-2 rounded-md px-2 py-1.5 ring-1 ring-border bg-secondary/50 hover:bg-accent transition-colors"
              >
                {avatar ? (
                  <img
                    src={avatar}
                    width={32}
                    height={32}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary/15 text-primary text-xs font-semibold flex items-center justify-center">
                    {username.slice(0, 1).toUpperCase()}
                  </div>
                )}

                <div className="text-left leading-tight">
                  <p className="text-sm text-foreground font-medium line-clamp-1 max-w-[120px]">
                    {username}
                  </p>
                </div>

                <ChevronDown size={14} className="text-muted-foreground" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-52 rounded-md border border-border bg-background/95 backdrop-blur p-1.5 shadow-lg z-50">
                  <div className="px-2 py-1.5 border-b border-border/60 mb-1">
                    <p className="text-sm font-medium text-foreground truncate">
                      {username}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {email || t("signin")}
                    </p>
                  </div>

                  <div className="md:hidden px-1 pb-1 border-b border-border/60 mb-1 space-y-0.5">
                    <NavLink
                      to="/dashboard"
                      end
                      onClick={() => setShowUserMenu(false)}
                      className={({ isActive }) =>
                        `w-full text-left px-2 py-2 text-sm rounded hover:bg-accent block ${
                          isActive ? "text-foreground" : "text-muted-foreground"
                        }`
                      }
                    >
                      {t("dashboard")}
                    </NavLink>
                    <NavLink
                      to="/challenges"
                      end
                      onClick={() => setShowUserMenu(false)}
                      className={({ isActive }) =>
                        `w-full text-left px-2 py-2 text-sm rounded hover:bg-accent block ${
                          isActive ? "text-foreground" : "text-muted-foreground"
                        }`
                      }
                    >
                      {t("challenges")}
                    </NavLink>
                  </div>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 text-sm rounded hover:bg-accent text-foreground inline-flex items-center gap-2"
                  >
                    <LogOut size={14} />
                    {t("logout")}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/auth"
              className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-primary text-primary-foreground"
            >
              {t("signin")}
              <ArrowRight size={16} />
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
