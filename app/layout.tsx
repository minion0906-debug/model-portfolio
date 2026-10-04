import "./globals.css";
import type { Metadata } from "next";
export const metadata: Metadata={title:"MAYA — Model Portfolio",description:"Secure model portfolio and media management."};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}