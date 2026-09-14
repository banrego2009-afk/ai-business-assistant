"use client";

import { useState } from "react";
import Scene from "@/components/Scene";
import { ArrowRight, ChevronDown, CheckCircle2, Hexagon } from "lucide-react";

export default function Home() {
  const [activeSystem, setActiveSystem] = useState<string | null>(null);

  return (
    <main className="relative w-full">
      {/* 3D Háttér */}
      <Scene activeSystem={activeSystem} />

      {/* Navigáció */}
      <nav className="fixed top-0 left-0 w-full p-6 flex justify-between items-center z-50 mix-blend-difference text-white">
        <div className="font-bold tracking-widest text-xl uppercase">[ Vollständiger Name ]</div>
        <div className="flex gap-4 text-xs font-mono font-bold">
          <button className="hover:text-[var(--color-lime)] transition-colors">CH</button>
          <button className="text-gray-500">AT</button>
          <button className="text-gray-500">HU</button>
        </div>
      </nav>

      {/* Görgethető tartalom */}
      <div id="scroll-container" className="relative z-10">
        
        {/* 1. Nyitóképernyő */}
        <section className="min-h-screen flex flex-col justify-center px-6 md:px-20 pointer-events-none">
          <div className="max-w-2xl pointer-events-auto">
            <div className="inline-block border border-[var(--color-lime)] text-[var(--color-lime)] px-3 py-1 rounded-full text-xs font-mono mb-6 uppercase tracking-widest">
              Externe Elektroplanung
            </div>
            <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
              Elektroplanung, die Ihr Projekt voranbringt.
            </h1>
            <p className="text-lg text-[var(--color-steel)] mb-10 max-w-xl leading-relaxed">
              10 Jahre Berufserfahrung in Österreich. Eigenständige Elektroplanung für Gebäude – als externer Projektpartner für Unternehmen in der Schweiz und Österreich.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="bg-[var(--color-lime)] text-[var(--color-graphite)] px-8 py-4 rounded-lg font-bold hover:bg-white transition-colors flex items-center justify-center gap-2 group">
                Projekt besprechen <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="border border-[var(--color-steel)] text-white px-8 py-4 rounded-lg font-bold hover:border-[var(--color-lime)] hover:text-[var(--color-lime)] transition-colors">
                Kompetenzen entdecken
              </button>
            </div>
            
            <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 border-t border-[var(--color-surface)] pt-8">
              <div>
                <div className="font-mono text-xs text-[var(--color-lime)] mb-2">01</div>
                <div className="text-sm font-medium">10 Jahre Erfahrung in Österreich</div>
              </div>
              <div>
                <div className="font-mono text-xs text-[var(--color-lime)] mb-2">02</div>
                <div className="text-sm font-medium">AutoCAD und 3D-Planung</div>
              </div>
              <div>
                <div className="font-mono text-xs text-[var(--color-lime)] mb-2">03</div>
                <div className="text-sm font-medium">Projektbezogene Zusammenarbeit</div>
              </div>
            </div>
          </div>
          
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce text-[var(--color-steel)]">
            <ChevronDown />
          </div>
        </section>

        {/* 2. Épületmetszet Feltárása */}
        <section className="min-h-[150vh] flex items-center px-6 md:px-20">
          <div className="max-w-xl">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">DAS SYSTEM HINTER DEM GEBÄUDE.</h2>
            <p className="text-xl text-[var(--color-steel)] leading-relaxed">
              Technische Systeme als Ganzes planen. Die Architektur ist die Hülle, die Gebäudetechnik ist das Nervensystem, das sie zum Leben erweckt.
            </p>
          </div>
        </section>

        {/* 3. 3D -> 2D Tervrajz */}
        <section className="min-h-[150vh] flex items-center px-6 md:px-20">
          <div className="max-w-xl">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Vom räumlichen Zusammenhang bis ins Detail.</h2>
            <p className="text-xl text-[var(--color-steel)] leading-relaxed">
              Präzise 2D-Pläne und 3D-Modelle in AutoCAD. Reibungslose Integration in bestehende Planungsprozesse.
            </p>
          </div>
        </section>

        {/* 4. Interaktív Rendszerbemutató */}
        <section className="min-h-screen flex flex-col justify-center px-6 md:px-20 bg-[var(--color-graphite)]/80 backdrop-blur-sm pointer-events-auto">
          <div className="max-w-lg mb-12">
            <h2 className="text-4xl font-bold mb-4">Umfassende Elektroplanung</h2>
            <p className="text-[var(--color-steel)]">Wählen Sie ein System, um die Planungsdetails zu erkunden.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="flex flex-col gap-3">
              {[
                "Energieverteilung",
                "Beleuchtung",
                "Steckdosen und Stromkreise",
                "Sicherheits- und Beschallungssysteme",
                "Steuerung und Gebäudeautomation"
              ].map((sys) => (
                <button 
                  key={sys}
                  onMouseEnter={() => setActiveSystem(sys)}
                  onMouseLeave={() => setActiveSystem(null)}
                  className={`text-left px-6 py-4 rounded-xl border transition-all ${
                    activeSystem === sys 
                    ? "border-[var(--color-lime)] bg-[var(--color-lime)]/10 text-white" 
                    : "border-[var(--color-surface)] text-[var(--color-steel)] hover:border-white/20 hover:text-white"
                  }`}
                >
                  <span className="font-bold">{sys}</span>
                </button>
              ))}
            </div>
            
            <div className="bg-[var(--color-surface)] border border-white/5 rounded-2xl p-8 flex flex-col justify-center">
              {activeSystem ? (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="text-[var(--color-lime)] mb-4"><Hexagon className="w-8 h-8" /></div>
                  <h3 className="text-2xl font-bold mb-3">{activeSystem}</h3>
                  <p className="text-[var(--color-steel)] leading-relaxed mb-6">
                    Eigenständige Projektierung und Dimensionierung. Von der ersten Berechnung bis zur ausführungsreifen CAD-Zeichnung.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex gap-3 text-sm"><CheckCircle2 className="w-5 h-5 text-[var(--color-lime)] shrink-0" /> Konzept & Dimensionierung</li>
                    <li className="flex gap-3 text-sm"><CheckCircle2 className="w-5 h-5 text-[var(--color-lime)] shrink-0" /> Leitungsführung & Trassierung</li>
                    <li className="flex gap-3 text-sm"><CheckCircle2 className="w-5 h-5 text-[var(--color-lime)] shrink-0" /> Detaillierte CAD-Ausarbeitung</li>
                  </ul>
                </div>
              ) : (
                <div className="text-center text-[var(--color-steel)] opacity-50">
                  <Hexagon className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p>Berühren Sie ein System für Details.</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* 5. Személyes Szakmai Profil */}
        <section className="min-h-screen flex items-center justify-center px-6 md:px-20 bg-[var(--color-graphite)] text-white relative z-10 pointer-events-auto border-t border-[var(--color-surface)]">
          <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="order-2 md:order-1 flex justify-center">
              {/* Absztrakt vagy valós portré helye */}
              <div className="w-full max-w-sm aspect-[3/4] bg-[var(--color-surface)] border border-[var(--color-steel)]/20 rounded-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-tr from-[var(--color-graphite)] to-transparent z-10"></div>
                <div className="absolute inset-0 flex items-center justify-center text-[var(--color-steel)] font-mono text-sm opacity-50 z-20 group-hover:opacity-100 transition-opacity">
                  [ Portrait / Architekturfoto ]
                </div>
                {/* Geometriai díszítés portré hiányában */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(212,245,104,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(212,245,104,0.05)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
              </div>
            </div>
            
            <div className="order-1 md:order-2">
              <div className="inline-block border border-[var(--color-lime)] text-[var(--color-lime)] px-3 py-1 rounded-full text-xs font-mono mb-6 uppercase tracking-widest">
                [ Vollständiger Name ]
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                10 Jahre Erfahrung in der österreichischen Gebäudeelektrotechnik.
              </h2>
              <div className="space-y-4 text-[var(--color-steel)] text-lg leading-relaxed">
                <p>
                  Als unabhängiger Elektroplaner übernehme ich die vollständige technische Ausarbeitung – von der ersten Konzeption bis zur ausführungsreifen CAD-Zeichnung.
                </p>
                <p>
                  Mein Fokus liegt auf der eigenständigen Umsetzung komplexer Gebäudeinfrastrukturen. Ich verstehe die Zusammenhänge der Systeme und arbeite nahtlos mit Ihrem bestehenden Projektteam zusammen.
                </p>
              </div>
              
              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="bg-[var(--color-surface)] p-4 rounded-xl border border-white/5">
                  <div className="font-mono text-[var(--color-lime)] text-xs mb-1">Software</div>
                  <div className="font-bold">AutoCAD, 3D-Planung</div>
                </div>
                <div className="bg-[var(--color-surface)] p-4 rounded-xl border border-white/5">
                  <div className="font-mono text-[var(--color-lime)] text-xs mb-1">Einsatzort</div>
                  <div className="font-bold">Remote / Hybrid</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6. Együttműködés & Kapcsolat */}
        <section className="min-h-screen flex flex-col justify-center px-6 md:px-20 bg-white text-[var(--color-graphite)] pointer-events-auto relative z-10">
          <div className="max-w-4xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-16">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">Ein erfahrener Elektroplaner für Ihr Projektteam.</h2>
              <div className="space-y-6 mt-10">
                <div className="border-l-2 border-[var(--color-graphite)] pl-6">
                  <h4 className="font-bold text-lg">Projektbezogener Einsatz</h4>
                  <p className="text-gray-600 mt-2">Gezielte Verstärkung für Lastspitzen in laufenden Projekten.</p>
                </div>
                <div className="border-l-2 border-gray-200 pl-6">
                  <h4 className="font-bold text-lg">Laufende Zusammenarbeit</h4>
                  <p className="text-gray-600 mt-2">Verlässliche Partnerschaft auf Stundenbasis.</p>
                </div>
                <div className="border-l-2 border-gray-200 pl-6">
                  <h4 className="font-bold text-lg">Definierte Planungspakete</h4>
                  <p className="text-gray-600 mt-2">Eigenverantwortliche Übernahme von Teilbereichen.</p>
                </div>
              </div>
              <p className="mt-8 text-sm font-mono text-gray-500">Stundensatz nach Leistungsumfang und Einsatzmodell.</p>
            </div>
            
            <div className="bg-gray-50 p-8 rounded-2xl">
              <h3 className="text-2xl font-bold mb-6">Besprechen wir Ihr nächstes Projekt.</h3>
              <p className="text-gray-600 mb-8">Sie suchen einen erfahrenen Elektroplaner für Ihr Projektteam? Beschreiben Sie kurz die Aufgabe.</p>
              
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-2 gap-4">
                  <input type="text" placeholder="Name" className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-[var(--color-graphite)] transition-colors" />
                  <input type="text" placeholder="Unternehmen" className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-[var(--color-graphite)] transition-colors" />
                </div>
                <input type="email" placeholder="Geschäftliche E-Mail" className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-[var(--color-graphite)] transition-colors" />
                <textarea placeholder="Projektbeschreibung..." rows={4} className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-[var(--color-graphite)] transition-colors"></textarea>
                <button className="w-full bg-[var(--color-graphite)] text-white font-bold py-4 rounded-lg hover:bg-black transition-colors">
                  Anfrage senden
                </button>
              </form>
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}
