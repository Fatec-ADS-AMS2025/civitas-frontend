
import React from "react";
import Sidebar from "@/components/Sidebar/sidebar"; // ajuste o caminho se necessário
import Image from "next/image";

const HomePage = () => {
  return (
    <div className="min-h-screen flex">
      {/* Sidebar fixa */}
      <Sidebar activeKey="home" />

      {/* Conteúdo principal */}
      <main className="flex-1 p-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Página Inicial</h1>

          <section className="bg-white rounded-lg p-6 shadow">
            <Image src="/next.svg" alt="Next.js logo" width={180} height={38} priority />
            <p className="mt-4">
              Conteúdo de exemplo — edite <code>src/app/page.tsx</code>.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
};
export default HomePage;
