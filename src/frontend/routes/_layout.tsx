import { Button } from "@/components/ui/button";
import { UserContext } from "@/context";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Outlet, useRouter } from "@tanstack/react-router";
import { UserDTO } from "src/api/types";

export const Route = createFileRoute("/_layout")({
  component: () => {
    const router = useRouter();
    const handleLogout = async () => {
      await fetch("/api/logout");
      window.localStorage.setItem("loggedIn", "false");
      router.navigate({
        to: "/login",
      });
    };
    const switchTheme = () => {
      if (window.localStorage.getItem("theme") === "light") {
        window.localStorage.setItem("theme", "dark");
        const root = window.document.documentElement;
        root.classList.remove("light");
        root.classList.add("dark");
      } else {
        window.localStorage.setItem("theme", "light");
        const root = window.document.documentElement;
        root.classList.remove("dark");
        root.classList.add("light");
      }
    };
    const { data: user } = useQuery({
      queryKey: ["user"],
      queryFn: async () => {
        const res = await fetch("/api/user");
        if (res.ok) {
          return res.json();
        }
        if (res.status === 401) {
          window.localStorage.setItem("loggedIn", "false");
          router.navigate({
            to: "/login",
          });
          return null;
        }
        return null;
      },
      refetchOnMount: true,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
    });

    return (
      <UserContext.Provider value={{ user }}>
        <div>
          <div className="absolute right-0 top-0 p-4 flex gap-4">
            <Button variant={"secondary"} onClick={handleLogout}>
              Wyloguj
            </Button>
            <Button onClick={switchTheme}>
              {/* @ts-ignore */}
              <ion-icon name="moon-outline"></ion-icon>
            </Button>
          </div>
          <Outlet />
        </div>
      </UserContext.Provider>
    );
  },
});
