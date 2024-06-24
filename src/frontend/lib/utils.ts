import { Router } from "@tanstack/react-router";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const generateAvatar = (name: string) => {
  if (!name) return document.createElement("canvas").toDataURL();
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("");
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = 100;
  canvas.height = 100;
  if (!ctx) return;
  const hash = name.split("").reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0);
  const hue = hash % 360;
  ctx.fillStyle = `hsl(${hue}, 100%, 87%)`;
  ctx.fillRect(0, 0, 100, 100);
  ctx.fillStyle = `hsl(${hue}, 70%, 15%)`;
  ctx.font = "bold 45px 'Roboto'";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(initials, 50, 50);
  return canvas.toDataURL();
};

export const fetchApi = async (url: string, router: Router<any, any>, options?: RequestInit) => {
  const res = await fetch(url, options);
  if (res.status === 401) {
    const refresh = await fetch("/api/refresh-token");
    if (refresh.status === 401) {
      window.localStorage.setItem("loggedIn", "false");
      router.navigate({
        to: "/login",
      });
      return;
    } else {
      return fetch(url, options);
    }
  }
  return res;
};
