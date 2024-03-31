import { Footer, Header } from "@/components/template/consumer";

export default function ConsumerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col h-full">
      <Header />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
}