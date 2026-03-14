import type { ReactNode } from "react";
import Footer from "./Footer";
import Navbar from "./Navbar";

interface IProps {
  children: ReactNode;
}

export default function CommonLayout({ children }: IProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="grow">{children}</div>
      <Footer />
    </div>
  );
}
