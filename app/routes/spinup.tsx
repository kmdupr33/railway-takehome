import { Outlet } from "@remix-run/react";
import Navbar from "~/components/navbar";

export default function Spinup() {
  return (
    <>
      <Navbar />
      <div className="container mx-auto px-12 pt-4">
        <Outlet />
      </div>
    </>
  );
}
