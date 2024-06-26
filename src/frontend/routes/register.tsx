import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { AlertCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const Register = () => {
  // const { setLoggedIn } = useContext(AppContext);
  const [errors, setErrors] = useState<string[] | null>(null);
  const router = useRouter();
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const res = await fetch("/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password, firstName, lastName }),
    });

    if (res.ok) {
      // alert("Zarejestrowano !");
      toast.success("Zarejestrowano !");
      setErrors(null);
      window.localStorage.setItem("loggedIn", "true");
      router.navigate({
        to: "/",
      });
    } else {
      const data = await res.json();
      setErrors(data.error.split("\n"));
    }
  };
  return (
    <div className="w-full h-screen bg-zinc-950 flex justify-center items-center">
      <form onSubmit={handleSubmit}>
        <div className="w-96 flex flex-col gap-4 text-center">
          <h1 className="text-5xl text-white font-bold mb-4">Rejestracja</h1>

          <Input type="text" placeholder="Nazwa użytkownika" name="username" />
          <Input type="password" placeholder="Hasło" name="password" />
          <Input type="text" placeholder="Imię" name="firstName" />
          <Input type="text" placeholder="Nazwisko" name="lastName" />
          <Button variant="default" size="default" className="w-full" type="submit">
            Zarejestruj się
          </Button>
          {errors && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle style={{ textAlign: "left" }}>Błąd</AlertTitle>
              <AlertDescription style={{ textAlign: "left" }}>{errors?.map((x) => <p>{x}</p>)}</AlertDescription>
            </Alert>
          )}
        </div>
      </form>
    </div>
  );
};

export const Route = createFileRoute("/register")({
  component: Register,
});
