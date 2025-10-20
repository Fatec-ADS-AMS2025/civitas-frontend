import type { NextConfig } from "next";

// Define explicitamente a raiz do Turbopack para evitar o aviso de múltiplos lockfiles
const nextConfig = {
  turbopack: {
    // Usa a pasta atual (onde este arquivo está) como raiz do workspace
    root: __dirname,
  },
} satisfies NextConfig;

export default nextConfig;
