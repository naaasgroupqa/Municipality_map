import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { MapContainer, TileLayer, LayersControl, Polyline, CircleMarker, Tooltip, useMap } from 'react-leaflet';
import { Play, Pause, RotateCcw, MapPinned, Satellite, Clock3, ChevronRight, LocateFixed } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import './styles.css';

const phases = [
  { year: 1950, label: 'Early settlement roads', labelAr: 'بدايات شبكة الطرق', note: 'Early road development concentrated around Doha and nearby settlements.' },
  { year: 1960, label: 'First urban expansion', labelAr: 'التوسع العمراني الأول', note: 'Urban connections begin extending west and south from Doha.' },
  { year: 1970, label: 'Rapid national growth', labelAr: 'النمو الوطني المتسارع', note: 'New regional links support expanding residential and industrial areas.' },
  { year: 1980, label: 'Municipal network growth', labelAr: 'نمو الشبكة البلدية', note: 'Primary road corridors increasingly connect major population centres.' },
  { year: 1990, label: 'Metropolitan expansion', labelAr: 'التوسع الحضري', note: 'Doha and surrounding municipalities become more strongly interconnected.' },
  { year: 2000, label: 'Modernisation', labelAr: 'مرحلة التحديث', note: 'Major arterial and ring-road connectivity accelerates.' },
  { year: 2010, label: 'National infrastructure era', labelAr: 'عصر البنية التحتية الوطنية', note: 'Expressway-scale development reshapes mobility across Qatar.' },
  { year: 2020, label: 'Integrated mobility network', labelAr: 'شبكة تنقل متكاملة', note: 'High-capacity corridors connect major new urban growth zones.' },
  { year: 2026, label: 'Today', labelAr: 'اليوم', note: 'A mature national road network links Qatar’s municipalities and urban centres.' },
];

// Geographic corridor overlays are illustrative until verified historical GIS layers are supplied.
const historicalCorridors = [
  { y:1950, name:'Historic Doha core', coords:[[25.286,51.535],[25.284,51.520],[25.290,51.507]] },
  { y:1960, name:'Western urban expansion', coords:[[25.286,51.525],[25.291,51.486],[25.295,51.450]] },
  { y:1960, name:'Southern urban expansion', coords:[[25.280,51.523],[25.255,51.510],[25.226,51.493]] },
  { y:1970, name:'Doha–Al Wakrah growth corridor', coords:[[25.273,51.530],[25.238,51.548],[25.205,51.574],[25.172,51.603]] },
  { y:1970, name:'Doha–Al Rayyan growth corridor', coords:[[25.286,51.510],[25.291,51.470],[25.292,51.424]] },
  { y:1980, name:'Northern metropolitan corridor', coords:[[25.300,51.515],[25.350,51.490],[25.415,51.455]] },
  { y:1980, name:'South-west regional corridor', coords:[[25.285,51.470],[25.235,51.405],[25.190,51.330]] },
  { y:1990, name:'Doha–Al Khor regional corridor', coords:[[25.330,51.520],[25.420,51.535],[25.520,51.545],[25.680,51.508]] },
  { y:2000, name:'West–east metropolitan connection', coords:[[25.300,51.385],[25.295,51.435],[25.292,51.490],[25.290,51.550]] },
  { y:2000, name:'North–south arterial growth', coords:[[25.180,51.505],[25.260,51.500],[25.360,51.500],[25.470,51.500]] },
  { y:2010, name:'Lusail growth connection', coords:[[25.320,51.515],[25.370,51.520],[25.420,51.530],[25.505,51.535]] },
  { y:2010, name:'National northern corridor', coords:[[25.520,51.500],[25.680,51.460],[25.850,51.380],[26.050,51.240]] },
  { y:2020, name:'Orbital network expansion', coords:[[25.180,51.360],[25.270,51.325],[25.390,51.330],[25.500,51.390],[25.560,51.500]] },
  { y:2020, name:'Eastern urban network', coords:[[25.210,51.590],[25.280,51.575],[25.360,51.570],[25.450,51.575]] },
  { y:2026, name:'Integrated national network', coords:[[25.120,51.350],[25.250,51.390],[25.400,51.430],[25.580,51.470],[25.800,51.420],[26.050,51.250]] },
];

const municipalities = [
  {name:'Doha', ar:'الدوحة', pos:[25.2854,51.5310]},
  {name:'Al Rayyan', ar:'الريان', pos:[25.2919,51.4244]},
  {name:'Al Wakrah', ar:'الوكرة', pos:[25.1715,51.6034]},
  {name:'Umm Salal', ar:'أم صلال', pos:[25.4149,51.4058]},
  {name:'Al Khor & Al Thakhira', ar:'الخور والذخيرة', pos:[25.6800,51.5075]},
  {name:'Al Shamal', ar:'الشمال', pos:[26.1268,51.2010]},
  {name:'Al Daayen', ar:'الظعاين', pos:[25.5197,51.5478]},
  {name:'Al Shahaniya', ar:'الشحانية', pos:[25.3705,51.2136]},
];

function QatarViewButton(){
  const map = useMap();
  return <button className="qatar-view-btn" onClick={()=>map.fitBounds([[24.45,50.70],[26.25,51.75]],{padding:[24,24]})}>
    <LocateFixed size={16}/> Qatar view
  </button>;
}

function App(){
  const [year,setYear] = useState(1950);
  const [playing,setPlaying] = useState(false);
  const [showHistory,setShowHistory] = useState(true);
  const [showMunicipalities,setShowMunicipalities] = useState(true);

  const phase = useMemo(()=>[...phases].reverse().find(p=>year>=p.year) || phases[0],[year]);
  const activeRoads = historicalCorridors.filter(r=>r.y<=year);

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
      <div className="status-chip"><span></span> LIVE MAP</div>
    </header>

    <main className="main-grid">
      <section className="hero-panel">
        <div className="map-stage real-map-stage">
          <div className="map-caption">
            <span>REAL QATAR MAP · HISTORICAL ROAD OVERLAY</span>
            <b>{year}</b>
          </div>

          <MapContainer
            center={[25.45,51.18]}
            zoom={8}
            minZoom={7}
            maxZoom={18}
            maxBounds={[[24.2,50.3],[26.6,52.2]]}
            maxBoundsViscosity={0.75}
            className="real-map"
            zoomControl={true}
          >
            <LayersControl position="bottomright">
              <LayersControl.BaseLayer checked name="Detailed Street Map">
                <TileLayer
                  attribution='&copy; OpenStreetMap contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
              </LayersControl.BaseLayer>
              <LayersControl.BaseLayer name="Satellite">
                <TileLayer
                  attribution='Tiles &copy; Esri'
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                />
              </LayersControl.BaseLayer>
            </LayersControl>

            {showHistory && activeRoads.map((r,i)=><Polyline
              key={`${r.y}-${i}`}
              positions={r.coords}
              pathOptions={{color:r.y>=2010?'#8A1538':r.y>=1980?'#B77745':'#C9A25F',weight:r.y>=2010?6:5,opacity:.9,lineCap:'round'}}
            ><Tooltip sticky>{r.name} · illustrative layer · {r.y}</Tooltip></Polyline>)}

            {showMunicipalities && municipalities.map(m=><CircleMarker
              key={m.name}
              center={m.pos}
              radius={6}
              pathOptions={{color:'#ffffff',weight:2,fillColor:'#8A1538',fillOpacity:1}}
            ><Tooltip direction="top" offset={[0,-8]} permanent={false}><strong>{m.name}</strong><br/>{m.ar}</Tooltip></CircleMarker>)}

            <QatarViewButton />
          </MapContainer>

          <div className="map-tools">
            <button className={showHistory?'active':''} onClick={()=>setShowHistory(v=>!v)}><Clock3 size={16}/> History overlay</button>
            <button className={showMunicipalities?'active':''} onClick={()=>setShowMunicipalities(v=>!v)}><MapPinned size={16}/> Municipalities</button>
          </div>
          <div className="basemap-hint"><Satellite size={14}/> Use the layer control at bottom-right for Street / Satellite</div>
          <div className="prototype-note">Current map, roads, place names and coastline are live OpenStreetMap/Esri basemap data. Historical coloured corridors are illustrative until verified Ministry GIS or historical map layers are supplied.</div>
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
          <div className="metric-row"><span>Timeline progress</span><b>{Math.round(((year-1950)/(2026-1950))*100)}%</b></div>
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
