import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AppContext } from "@/context";
import { createFileRoute, createLazyFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { useContext } from "react";

const Login = () => {
  // const { setLoggedIn } = useContext(AppContext);
  const router = useRouter();
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;
    const res = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    if (res.ok) {
      window.sessionStorage.setItem("loggedIn", "true");
      router.navigate({
        to: "/",
      });
    } else {
      alert("Invalid credentials");
    }
  };
  return (
    <div className="w-full h-screen bg-zinc-950 flex justify-center items-center">
      <form onSubmit={handleSubmit}>
        <div className="w-96 flex flex-col gap-4 text-center">
          <h1 className="text-5xl text-white font-bold mb-4">Zaloguj się</h1>

          <Input type="text" placeholder="Login" name="username" />
          <Input type="password" placeholder="Hasło" name="password" />
          <Button variant="default" size="default" className="w-full" type="submit">
            Login
          </Button>
          <p className="text-gray-200">
            Nie masz konta ?{" "}
            <a className="text-white" href="/register">
              Zarejestruj się
            </a>
          </p>
        </div>
      </form>
    </div>
  );
};

export const Route = createFileRoute("/login")({
  component: Login,
});
