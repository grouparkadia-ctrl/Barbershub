import React from "react";
import { createRoot } from "react-dom/client";
import BookingOS from "./BookingOS";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Member application root is missing.");
}

createRoot(root).render(
  <React.StrictMode>
    <BookingOS />
  </React.StrictMode>,
);
