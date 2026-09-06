import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Play, Pause, RotateCcw, Map, Layers3, Clock3, ChevronRight } from 'lucide-react';
import './styles.css';

const phases = [
  { year: 1950, label: 'Early settlement roads', labelAr: 'بدايات شبكة الطرق', note: 'Compact routes around Doha’s historic urban core.' },
  { year: 1960, label: 'First urban expansion', labelAr: 'التوسع العمراني الأول', note: 'New radial connections extend beyond the old centre.' },
  { year: 1970, label: 'Oil-era growth', labelAr: 'نمو مرحلة النفط', note: 'Faster expansion links emerging residential districts.' },
  { year: 1980, label: 'Municipal network growth', labelAr: 'نمو الشبكة البلدية', note: 'Primary corridors begin forming a metropolitan network.' },
  { year: 1990, label: 'Doha metropolitan expansion', labelAr: 'توسع الدوحة الكبرى', note: 'More cross-city routes improve east–west movement.' },
  { year: 2000, label: 'Modernisation', labelAr: 'مرحلة التحديث', note: 'Major arterial roads and ring-road connectivity accelerate.' },
  { year: 2010, label: 'National infrastructure era', labelAr: 'عصر البنية التحتية الوطنية', note: 'Expressway-scale development reshapes regional mobility.' },
  { year: 2020, label: 'Integrated mobility network', labelAr: 'شبكة تنقل متكاملة', note: 'High-capacity corridors connect new urban growth zones.' },
  { year: 2026, label: 'Today', labelAr: 'اليوم', note: 'A mature connected road system supporting Qatar’s urban regions.' },
];

const roads = [
  { y:1950, d:'M462 353 C480 336 502 331 525 338' },
  { y:1950, d:'M480 367 C500 357 522 360 542 374' },
  { y:1960, d:'M510 338 C555 316 603 308 647 319' },
  { y:1960, d:'M500 365 C535 394 560 416 590 449' },
  { y:1970, d:'M535 348 C570 350 605 362 643 385' },
  { y:1970, d:'M542 374 C526 420 511 459 497 506' },
  { y:1980, d:'M590 449 C623 435 658 424 697 423' },
  { y:1980, d:'M643 385 C678 372 711 367 746 372' },
  { y:1990, d:'M497 506 C550 512 603 513 658 505' },
  { y:1990, d:'M647 319 C672 289 690 258 705 224' },
  { y:2000, d:'M658 505 C703 485 742 456 774 420' },
  { y:2000, d:'M697 423 C722 406 748 389 776 375' },
  { y:2010, d:'M705 224 C740 212 775 207 814 213' },
  { y:2010, d:'M746 372 C784 347 819 314 846 273' },
  { y:2020, d:'M774 420 C810 447 843 472 874 503' },
  { y:2020, d:'M776 375 C815 378 854 390 893 411' },
  { y:2026, d:'M814 213 C835 245 846 273 846 306' },
  { y:2026, d:'M893 411 C899 366 896 323 886 282' },
];

const cities = [
  {name:'Doha', x:525, y:350, since:1950},
  {name:'Al Rayyan', x:458, y:396, since:1960},
  {name:'Al Wakrah', x:570, y:500, since:1970},
  {name:'Umm Salal', x:535, y:280, since:1980},
  {name:'Al Khor', x:674, y:198, since:1990},
  {name:'Lusail', x:610, y:302, since:2010},
];

function App(){
  const [year,setYear] = useState(1950);
  const [playing,setPlaying] = useState(false);
  const [showLabels,setShowLabels] = useState(true);
  const [showGrid,setShowGrid] = useState(true);

  const phase = useMemo(()=>[...phases].reverse().find(p=>year>=p.year) || phases[0],[year]);
  const activeRoads = roads.filter(r=>r.y<=year);

  useEffect(()=>{
    if(!playing) return;
    const t=setInterval(()=>{
      setYear(v=>{
        if(v>=2026){ setPlaying(false); return 2026; }
        return Math.min(2026,v+1);
      });
    },90);
    return ()=>clearInterval(t);
  },[playing]);

  const jumpTo = y => { setPlaying(false); setYear(y); };

  return <div className="app-shell">
    <header className="topbar">
      <div className="brand">
        <div className="crest" aria-label="Ministry of Municipality identity">
          <div className="crest-ring">◈</div>
          <div className="crest-copy"><span>وزارة البلدية</span><b>Ministry of Municipality</b></div>
        </div>
      </div>
      <div className="project-title">
        <span className="eyebrow">INTERACTIVE URBAN HISTORY</span>
        <h1>Qatar Road Evolution <strong>1950 — 2026</strong></h1>
      </div>
      <div className="status-chip"><span></span> LIVE PROTOTYPE</div>
    </header>

    <main className="main-grid">
      <section className="hero-panel">
        <div className="map-stage">
          <div className="map-caption">
            <span>ROAD NETWORK EVOLUTION</span>
            <b>{year}</b>
          </div>
          <svg viewBox="0 0 1000 700" className="qatar-map" role="img" aria-label="Interactive illustrative road growth map of Qatar">
            <defs>
              <linearGradient id="land" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fffaf4"/><stop offset="1" stopColor="#eadfce"/></linearGradient>
              <filter id="glow"><feGaussianBlur stdDeviation="4" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
              <pattern id="grid" width="28" height="28" patternUnits="userSpaceOnUse"><path d="M 28 0 L 0 0 0 28" fill="none" stroke="#ffffff" strokeOpacity=".07" strokeWidth="1"/></pattern>
            </defs>
            <rect width="1000" height="700" fill="#0b2430"/>
            {showGrid && <rect width="1000" height="700" fill="url(#grid)"/>}
            <path className="coast" d="M447 611 C411 553 403 491 415 429 C429 356 450 314 472 272 C493 231 513 184 541 124 C560 84 585 57 617 49 C649 41 674 54 693 79 C716 108 723 145 739 169 C758 198 789 208 814 227 C850 255 873 292 887 337 C902 389 901 451 883 511 C868 563 839 611 797 640 C746 676 679 673 617 657 C560 643 496 635 447 611 Z" fill="url(#land)"/>
            <path className="coast-inner" d="M464 596 C438 548 431 492 440 438 C450 376 469 330 490 287 C513 240 530 197 554 145 C573 104 594 80 620 74"/>

            {activeRoads.map((r,i)=><path key={i} d={r.d} className={'road road-'+r.y} style={{animationDelay:`${Math.min(i,8)*55}ms`}}/>)}

            {cities.filter(c=>c.since<=year).map(c=><g key={c.name} className="city">
              <circle cx={c.x} cy={c.y} r="6"/>
              <circle className="pulse" cx={c.x} cy={c.y} r="12"/>
              {showLabels && <text x={c.x+12} y={c.y-9}>{c.name}</text>}
            </g>)}
          </svg>

          <div className="map-tools">
            <button className={showLabels?'active':''} onClick={()=>setShowLabels(v=>!v)}><Map size={16}/> Labels</button>
            <button className={showGrid?'active':''} onClick={()=>setShowGrid(v=>!v)}><Layers3 size={16}/> Grid</button>
          </div>
          <div className="prototype-note">Illustrative historical reconstruction for interactive concept demonstration. Replace with verified GIS road layers for official deployment.</div>
        </div>
      </section>

      <aside className="story-panel">
        <div className="year-display">
          <span>YEAR</span>
          <strong>{year}</strong>
          <em>{phase.labelAr}</em>
        </div>
        <div className="story-card">
          <div className="story-index"><Clock3 size={18}/> {phase.year}</div>
          <h2>{phase.label}</h2>
          <p>{phase.note}</p>
          <div className="growth-meter"><div style={{width:`${((year-1950)/(2026-1950))*100}%`}}></div></div>
          <div className="metric-row"><span>Network maturity</span><b>{Math.round(((year-1950)/(2026-1950))*100)}%</b></div>
        </div>
        <div className="milestones">
          {phases.map(p=><button key={p.year} className={year>=p.year?'passed':''} onClick={()=>jumpTo(p.year)}>
            <span>{p.year}</span><i></i><b>{p.label}</b><ChevronRight size={14}/>
          </button>)}
        </div>
      </aside>
    </main>

    <footer className="timeline-dock">
      <button className="play-btn" onClick={()=>setPlaying(v=>!v)}>{playing?<Pause size={20}/>:<Play size={20} fill="currentColor"/>}</button>
      <button className="reset-btn" onClick={()=>{setPlaying(false);setYear(1950)}}><RotateCcw size={17}/></button>
      <div className="slider-wrap">
        <div className="slider-labels"><span>1950</span><span>1960</span><span>1970</span><span>1980</span><span>1990</span><span>2000</span><span>2010</span><span>2020</span><span>2026</span></div>
        <input type="range" min="1950" max="2026" value={year} onChange={e=>{setPlaying(false);setYear(Number(e.target.value))}} style={{'--progress':`${((year-1950)/76)*100}%`}}/>
      </div>
      <div className="current-phase"><span>CURRENT PHASE</span><b>{phase.label}</b></div>
    </footer>
  </div>
}

createRoot(document.getElementById('root')).render(<App/>);
