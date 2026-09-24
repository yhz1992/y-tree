import React from "react";
import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { ArchitectureVisualizer } from "./components/ArchitectureVisualizer";
import { BenchmarkLab } from "./components/BenchmarkLab";
import { CodeMatrix } from "./components/CodeMatrix";
import { DemoGallery } from "./components/DemoGallery";
import { Footer } from "./components/Footer";
import "./styles/portal.css";

export default function App() {
  return (
    <div className="portal-root">
      <Navbar />
      <main>
        <Hero />
        <ArchitectureVisualizer />
        <BenchmarkLab />
        <CodeMatrix />
        <DemoGallery />
      </main>
      <Footer />
    </div>
  );
}
