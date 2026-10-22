import React, { useState } from "react";
import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { Metrics } from "./components/Metrics";
import { ArchitectureVisualizer } from "./components/ArchitectureVisualizer";
import { BentoGrid } from "./components/BentoGrid";
import { BenchmarkLab } from "./components/BenchmarkLab";
import { CodeMatrix } from "./components/CodeMatrix";
import { DemoGallery } from "./components/DemoGallery";
import { Footer } from "./components/Footer";
import "./styles/portal.css";

export type FrameworkId = "react" | "vue" | "angular";

export default function App() {
  const [activeFw, setActiveFw] = useState<FrameworkId>("react");

  return (
    <div className="portal-root" data-fw={activeFw}>
      {/* 全局动态极光背景与透视星轨网格 */}
      <div className="cosmos-backdrop" aria-hidden="true">
        <div className="aurora-orb orb-emerald" />
        <div className="aurora-orb orb-cyan" />
        <div className="aurora-orb orb-fw" />
        <div className="cyber-grid-floor" />
        <div className="noise-overlay" />
      </div>

      <Navbar activeFw={activeFw} onSelectFw={setActiveFw} />

      <main className="portal-main">
        <Hero activeFw={activeFw} onSelectFw={setActiveFw} />
        <Metrics />
        <ArchitectureVisualizer activeFw={activeFw} onSelectFw={setActiveFw} />
        <BentoGrid />
        <BenchmarkLab />
        <CodeMatrix activeFw={activeFw} onSelectFw={setActiveFw} />
        <DemoGallery activeFw={activeFw} onSelectFw={setActiveFw} />
      </main>

      <Footer />
    </div>
  );
}
