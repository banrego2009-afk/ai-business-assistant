"use client";

import { useState, useRef } from "react";
import Scene from "@/components/Scene";
import { CheckCircle2, Hexagon } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const [activeSystem, setActiveSystem] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const heroTextRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // 1. Hero repülés animáció (A szövegen "keresztül" repülünk be a 3D térbe)
    if (heroTextRef.current) {
      gsap.to(heroTextRef.current, {
        scrollTrigger: {
          trigger: "#scroll-container",
          start: "top top",
          end: "500px top",
          scrub: 1,
        },
        scale: 3,
        opacity: 0,
        filter: "blur(10px)",
        ease: "power2.in"
      });
    }

    // 2. Reveal animáció a címsorokhoz
    gsap.utils.toArray(".reveal-heading").forEach((heading: unknown) => {
      gsap.from(heading as HTMLElement, {
        scrollTrigger: {
          trigger: heading as HTMLElement,
          start: "top 80%",
        },
        y: 40,
        opacity: 0,
        duration: 1,
        ease: "power3.out"
      });
    });

    // 3. Reveal animáció a bekezdésekhez
    gsap.utils.toArray(".reveal-text").forEach((p: unknown) => {
      gsap.from(p as HTMLElement, {
        scrollTrigger: {
          trigger: p as HTMLElement,
          start: "top 85%",
        },
        y: 30,
        opacity: 0,
        duration: 1,
        delay: 0.1,
        ease: "power3.out"
      });
    });
  }, { scope: containerRef });

  return (
    <main ref={containerRef} className="relative w-full">
      {/* 3D Háttér */}
      <Scene activeSystem={activeSystem} />

      {/* Navigáció */}
      <nav className="fixed top-0 left-0 w-full p-6 flex justify-between items-center z-50 text-white mix-blend-difference">
        <div className="font-bold tracking-widest text-xl uppercase">[ Vollständiger Name ]</div>
        <div className="flex gap-4 text-xs font-mono font-bold">
          <button className="text-[var(--color-lime)] transition-colors">CH</button>
          <button className="text-gray-500 hover:text-white transition-colors">AT</button>
          <button className="text-gray-500 hover:text-white transition-colors">HU</button>
        </div>
      </nav>

      {/* Görgethető tartalom */}
      <div id="scroll-container" className="relative z-10">
        {/* 3D Animáció hossza (Csak ezen a szakaszon animál a GSAP) */}
        <div id="animation-track">
          {/* 1. KREATÍV KÖZPONTI HERO (Beleolvad a 3D-be) */}
          <section className="h-[100vh] md:h-[120vh] flex flex-col items-center justify-center px-6 pointer-events-none">
            <div ref={heroTextRef} className="flex flex-col items-center text-center z-20 w-full max-w-5xl">
              <div className="inline-block border border-[var(--color-lime)] text-[var(--color-lime)] px-4 py-1.5 rounded-full text-xs font-mono mb-8 uppercase tracking-widest animate-in fade-in slide-in-from-bottom-4 duration-1000 shadow-[0_4px_16px_rgba(0,0,0,0.8)]">
                Externe Elektroplanung
              </div>
              
              <h1 className="text-5xl md:text-8xl lg:text-[7rem] font-bold leading-[1.1] mb-6 md:mb-8 tracking-tight text-white drop-shadow-[0_8px_16px_rgba(0,0,0,0.9)] animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
                DAS SYSTEM HINTER<br/>DEM GEBÄUDE.
              </h1>
              
              <p className="text-lg md:text-2xl text-[var(--color-offwhite)] mb-10 md:mb-12 max-w-2xl leading-relaxed drop-shadow-[0_4px_10px_rgba(0,0,0,0.9)] animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
                Elektroplanung, die Ihr Projekt voranbringt. Eigenständige Projektierung für Unternehmen in der Schweiz und Österreich.
              </p>
              
              {/* Scroll Indicator */}
              <div className="flex flex-col items-center gap-4 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] animate-in fade-in duration-1000 delay-700 mt-4 md:mt-0">
                <span className="text-xs font-mono tracking-widest uppercase">Projekt erkunden</span>
                <div className="w-px h-12 bg-gradient-to-b from-[var(--color-lime)] to-transparent animate-pulse"></div>
              </div>
            </div>
          </section>

          {/* 2. Épületmetszet Feltárása */}
          <section className="min-h-[120vh] md:min-h-[150vh] flex items-center px-6 md:px-20 pointer-events-none">
            <div className="max-w-2xl">
              <h2 className="reveal-heading text-4xl md:text-6xl font-bold mb-6 text-white drop-shadow-[0_8px_16px_rgba(0,0,0,0.9)]">
                Präzision im Detail.
              </h2>
              <p className="reveal-text text-xl md:text-2xl text-[var(--color-offwhite)] leading-relaxed drop-shadow-[0_4px_10px_rgba(0,0,0,0.9)]">
                Die Architektur ist die Hülle, die Gebäudetechnik ist das Nervensystem, das sie zum Leben erweckt. Wir planen technische Systeme als Ganzes.
              </p>
            </div>
          </section>

          {/* 3. 3D -> 2D Tervrajz */}
          <section className="min-h-[120vh] md:min-h-[150vh] flex items-center px-6 md:px-20 pointer-events-none justify-end">
            <div className="max-w-2xl text-right">
              <h2 className="reveal-heading text-4xl md:text-6xl font-bold mb-6 text-white drop-shadow-[0_8px_16px_rgba(0,0,0,0.9)]">
                Räumlich gedacht.<br/>Flach gezeichnet.
              </h2>
              <p className="reveal-text text-xl md:text-2xl text-white leading-relaxed drop-shadow-[0_4px_10px_rgba(0,0,0,0.9)] ml-auto max-w-xl">
                Vom räumlichen Zusammenhang bis ins Detail. Präzise 2D-Pläne und 3D-Modelle in AutoCAD für eine reibungslose Integration.
              </p>
            </div>
          </section>
        </div>

        {/* 4. Interaktív Rendszerbemutató */}
        <section className="min-h-screen flex flex-col justify-center px-6 md:px-20 bg-[#0B0E10] lg:bg-transparent lg:bg-gradient-to-b lg:from-transparent lg:via-[#0B0E10] lg:to-[#0B0E10] pointer-events-auto py-20 md:py-32 relative z-20">
          <div className="max-w-lg mb-12 lg:mb-16">
            <h2 className="reveal-heading text-4xl lg:text-5xl font-bold mb-6">Umfassende Elektroplanung</h2>
            <p className="reveal-text text-xl text-[var(--color-steel)] lg:block hidden">Berühren Sie ein System, um die Planungsdetails in 3D zu erkunden.</p>
            <p className="reveal-text text-xl text-[var(--color-steel)] block lg:hidden">Professionelle Projektierung und Dimensionierung von der ersten Berechnung bis zur CAD-Zeichnung.</p>
          </div>
          
          {/* ASZTALI NÉZET: Kettészedett, interaktív (Hover) */}
          <div className="hidden lg:grid grid-cols-2 gap-12">
            <div className="flex flex-col gap-4">
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
                  className={`text-left px-8 py-5 rounded-2xl border transition-all duration-300 ${
                    activeSystem === sys 
                    ? "border-[var(--color-lime)] bg-[var(--color-lime)]/10 text-white shadow-[0_0_20px_rgba(212,245,104,0.15)] translate-x-4" 
                    : "border-[var(--color-surface)] bg-black/60 text-[var(--color-steel)] hover:border-white/20 hover:text-white"
                  }`}
                >
                  <span className="font-bold text-lg">{sys}</span>
                </button>
              ))}
            </div>
            
            <div className="bg-[#111518]/90 backdrop-blur-xl border border-white/10 rounded-3xl p-10 flex flex-col justify-center shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-lime)]/10 blur-[100px] pointer-events-none rounded-full"></div>
              
              {activeSystem ? (
                <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 relative z-10">
                  <div className="text-[var(--color-lime)] mb-6"><Hexagon className="w-10 h-10" /></div>
                  <h3 className="text-3xl font-bold mb-4">{activeSystem}</h3>
                  <p className="text-[var(--color-steel)] text-lg leading-relaxed mb-8">
                    Eigenständige Projektierung und Dimensionierung. Von der ersten Berechnung bis zur ausführungsreifen CAD-Zeichnung.
                  </p>
                  <ul className="space-y-4">
                    <li className="flex gap-4 text-md items-center"><CheckCircle2 className="w-6 h-6 text-[var(--color-lime)] shrink-0" /> <span>Konzept & Dimensionierung</span></li>
                    <li className="flex gap-4 text-md items-center"><CheckCircle2 className="w-6 h-6 text-[var(--color-lime)] shrink-0" /> <span>Leitungsführung & Trassierung</span></li>
                    <li className="flex gap-4 text-md items-center"><CheckCircle2 className="w-6 h-6 text-[var(--color-lime)] shrink-0" /> <span>Detaillierte CAD-Ausarbeitung</span></li>
                  </ul>
                </div>
              ) : (
                <div className="text-center text-[var(--color-steel)] opacity-40 flex flex-col items-center justify-center h-full min-h-[300px] relative z-10">
                  <Hexagon className="w-16 h-16 mb-6 opacity-20 animate-pulse" />
                  <p className="text-lg font-medium tracking-wide">System auswählen</p>
                </div>
              )}
            </div>
          </div>

          {/* MOBIL NÉZET: Kompakt kártyás lista (Nincs hover, minden látszik) */}
          <div className="flex lg:hidden flex-col gap-6">
            {[
              "Energieverteilung",
              "Beleuchtung",
              "Steckdosen und Stromkreise",
              "Sicherheits- und Beschallungssysteme",
              "Steuerung und Gebäudeautomation"
            ].map((sys) => (
              <div key={sys} className="py-4 border-b border-[var(--color-surface)] last:border-0">
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-[var(--color-lime)]"><Hexagon className="w-6 h-6" /></div>
                  <h3 className="font-bold text-xl text-white">{sys}</h3>
                </div>
                <ul className="space-y-3 mt-4 ml-2">
                  <li className="flex gap-3 text-sm text-[var(--color-steel)] items-center"><CheckCircle2 className="w-4 h-4 text-[var(--color-lime)] shrink-0" /> <span>Konzept & Dimensionierung</span></li>
                  <li className="flex gap-3 text-sm text-[var(--color-steel)] items-center"><CheckCircle2 className="w-4 h-4 text-[var(--color-lime)] shrink-0" /> <span>Leitungsführung & Trassierung</span></li>
                  <li className="flex gap-3 text-sm text-[var(--color-steel)] items-center"><CheckCircle2 className="w-4 h-4 text-[var(--color-lime)] shrink-0" /> <span>Detaillierte CAD-Ausarbeitung</span></li>
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* 5. Személyes Szakmai Profil */}
        <section className="min-h-screen flex items-center justify-center px-6 md:px-20 bg-[#0B0E10] text-white relative z-10 pointer-events-auto py-20 md:py-32">
          <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="order-2 lg:order-1 hidden lg:flex justify-center w-full">
              <div className="w-full max-w-sm md:max-w-md aspect-[3/4] bg-[#111518] border border-[var(--color-steel)]/20 rounded-3xl relative overflow-hidden group shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                <div className="absolute inset-0 bg-gradient-to-tr from-[var(--color-graphite)] via-transparent to-transparent z-10"></div>
                <div className="absolute inset-0 flex items-center justify-center text-[var(--color-steel)] font-mono text-sm opacity-50 z-20 group-hover:opacity-100 transition-opacity">
                  [ Portrait / Architekturfoto ]
                </div>
                {/* Geometriai díszítés portré hiányában */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(212,245,104,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(212,245,104,0.03)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
              </div>
            </div>
            
            <div className="order-1 lg:order-2">
              <div className="reveal-heading inline-block border border-[var(--color-lime)] text-[var(--color-lime)] px-4 py-1.5 rounded-full text-xs font-mono mb-6 md:mb-8 uppercase tracking-widest">
                [ Vollständiger Name ]
              </div>
              <h2 className="reveal-heading text-4xl md:text-5xl font-bold mb-6 md:mb-8 leading-tight">
                10 Jahre Erfahrung in der österreichischen Gebäudeelektrotechnik.
              </h2>
              <div className="space-y-6 text-[var(--color-steel)] text-lg md:text-xl leading-relaxed reveal-text">
                <p>
                  Als unabhängiger Elektroplaner übernehme ich die vollständige technische Ausarbeitung – von der ersten Konzeption bis zur ausführungsreifen CAD-Zeichnung.
                </p>
                <p>
                  Mein Fokus liegt auf der eigenständigen Umsetzung komplexer Gebäudeinfrastrukturen. Ich verstehe die Zusammenhänge der Systeme und arbeite nahtlos mit Ihrem bestehenden Projektteam zusammen.
                </p>
              </div>
              
              <div className="mt-8 md:mt-12 grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 reveal-text">
                <div className="p-2 md:p-4">
                  <div className="font-mono text-[var(--color-lime)] text-xs mb-2 uppercase tracking-wider">Software</div>
                  <div className="font-bold text-base md:text-lg text-white">AutoCAD, 3D-Planung</div>
                </div>
                <div className="p-2 md:p-4">
                  <div className="font-mono text-[var(--color-lime)] text-xs mb-2 uppercase tracking-wider">Einsatzort</div>
                  <div className="font-bold text-base md:text-lg text-white">Remote / Hybrid</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6. Együttműködés & Kapcsolat */}
        <section className="min-h-screen flex flex-col justify-center px-6 md:px-20 bg-[var(--color-offwhite)] text-[var(--color-graphite)] pointer-events-auto relative z-10 py-20 md:py-32">
          <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
            <div className="flex flex-col justify-center">
              <h2 className="reveal-heading text-4xl md:text-6xl font-bold mb-6 md:mb-8 leading-tight">Ein erfahrener Elektroplaner für Ihr Projektteam.</h2>
              <div className="space-y-6 md:space-y-8 mt-4 md:mt-8 reveal-text">
                <div className="border-l-4 border-[var(--color-graphite)] pl-6 hover:border-[var(--color-lime)] transition-colors cursor-default">
                  <h4 className="font-bold text-xl md:text-2xl mb-2">Projektbezogener Einsatz</h4>
                  <p className="text-gray-600 text-lg">Gezielte Verstärkung für Lastspitzen in laufenden Projekten.</p>
                </div>
                <div className="border-l-4 border-gray-300 pl-6 hover:border-[var(--color-lime)] transition-colors cursor-default">
                  <h4 className="font-bold text-2xl mb-2">Laufende Zusammenarbeit</h4>
                  <p className="text-gray-600 text-lg">Verlässliche Partnerschaft auf Stundenbasis.</p>
                </div>
                <div className="border-l-4 border-gray-300 pl-6 hover:border-[var(--color-lime)] transition-colors cursor-default">
                  <h4 className="font-bold text-2xl mb-2">Definierte Planungspakete</h4>
                  <p className="text-gray-600 text-lg">Eigenverantwortliche Übernahme von Teilbereichen.</p>
                </div>
              </div>
              <div className="mt-12 bg-gray-100 p-6 rounded-xl inline-block reveal-text">
                <p className="text-sm font-mono text-gray-700 font-bold uppercase tracking-wide">Stundensatz nach Leistungsumfang und Einsatzmodell.</p>
              </div>
            </div>
            
            <div className="bg-white p-10 md:p-12 rounded-3xl shadow-2xl border border-gray-100 reveal-text">
              <h3 className="text-3xl font-bold mb-4">Besprechen wir Ihr Projekt.</h3>
              <p className="text-gray-500 mb-10 text-lg">Sie suchen einen erfahrenen Elektroplaner? Beschreiben Sie kurz die Aufgabe.</p>
              
              <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <input type="text" placeholder="Name" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 text-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-lime)] focus:border-transparent transition-all" />
                  <input type="text" placeholder="Unternehmen" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 text-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-lime)] focus:border-transparent transition-all" />
                </div>
                <input type="email" placeholder="Geschäftliche E-Mail" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 text-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-lime)] focus:border-transparent transition-all" />
                <textarea placeholder="Projektbeschreibung..." rows={5} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 text-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-lime)] focus:border-transparent transition-all"></textarea>
                <button className="w-full bg-[#0B0E10] text-white font-bold py-5 rounded-xl text-lg hover:bg-[var(--color-lime)] hover:text-[var(--color-graphite)] transition-colors shadow-lg">
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
