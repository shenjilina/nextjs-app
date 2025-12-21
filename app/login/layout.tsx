import { Nunito } from "next/font/google";

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});



export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className={nunito.className}>{children}</div>;
}
