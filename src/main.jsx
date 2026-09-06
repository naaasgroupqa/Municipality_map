import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Play, Pause, RotateCcw, Clock3, MapPinned, Satellite, Map as MapIcon, Info } from 'lucide-react';
import './styles.css';

const GOOGLE_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
const LOGO_URL = 'https://qatarplatform.net/wp-content/uploads/2024/04/%D8%B4%D8%B9%D8%A7%D8%B1-%D9%88%D8%B2%D8%A7%D8%B1%D8%A9-%D8%A7%D9%84%D8%A8%D9%84%D8%AF%D9%8A%D8%A9-1.png';

const milestones = [
  { year: 1939, title: 'First oil-era road', ar: 'بداية شبكة الطرق الحديثة', text: 'The first road associated with Qatar’s oil era connected Doha and Dukhan in 1938/39.', focus: {lat:25.34,lng:51.15,zoom:9}, route:'dukhan' },
  { year: 1948, title: 'Industrial corridor expands', ar: 'توسع طرق الصناعة والطاقة', text: 'A second oil-industry route linked Dukhan with Umm Bab and Mesaieed in 1947/48.', focus:{lat:25.18,lng:51.08,zoom:8}, route:'industrial' },
  { year: 1950, title: 'Doha begins modern transformation', ar: 'بداية التحول العمراني في الدوحة', text: 'Oil revenues began driving public infrastructure, municipal works and rapid urban change in Doha.', focus:{lat:25.2854,lng:51.5310,zoom:12} },
  { year: 1963, title: 'A & B Ring roads established', ar: 'ظهور الطريقين الدائريين الأول والثاني', text: 'Historical urban research documents the roads later known as A Ring and B Ring by 1963.', focus:{lat:25.2854,lng:51.505,zoom:12} },
  { year: 1965, title: 'C Ring outline in place', ar: 'بداية الطريق الدائري الثالث', text: 'The outline of the road later known as C Ring was already in place by 1965.', focus:{lat:25.275,lng:51.495,zoom:11} },
  { year: 1970, title: 'Regional road system matures', ar: 'توسع الربط بين مناطق الدولة', text: 'Major inter-city routes were upgraded during the 1970s as Doha expanded beyond its early core.', focus:{lat:25.25,lng:51.25,zoom:9}, route:'salwa' },
  { year: 2010, title: 'Expressway programme accelerates', ar: 'تسارع برنامج الطرق السريعة', text: 'Salwa Road Phase 2 began in 2010 as part of a new generation of high-capacity roads.', focus:{lat:25.23,lng:51.38,zoom:10}, route:'salwaModern' },
  { year: 2012, title: 'North Road enhancement', ar: 'تطوير طريق الشمال', text: 'The North Road corridor enhancement began in 2012, including major junction and service-road upgrades.', focus:{lat:25.55,lng:51.39,zoom:9}, route:'north' },
  { year: 2014, title: 'Dukhan Highway modernisation', ar: 'تحديث طريق دخان السريع', text: 'Nine kilometres of the new Dukhan Highway Central opened in July 2014.', focus:{lat:25.34,lng:51.25,zoom:10}, route:'dukhanModern' },
  { year: 2017, title: 'National expressway leap', ar: 'قفزة في شبكة الطرق السريعة', text: 'G-Ring Road, major Orbital Highway sections and the completed Dukhan Highway Central transformed cross-country movement.', focus:{lat:25.22,lng:51.34,zoom:9}, route:'expressway2017' },
  { year: 2018, title: 'Southern network integration', ar: 'تكامل شبكة الطرق الجنوبية', text: 'New links connected Doha Expressway with the E, F and G Ring Roads and southern growth areas.', focus:{lat:25.18,lng:51.50,zoom:10}, route:'south2018' },
  { year: 2020, title: 'Mesaimeer interchange expansion', ar: 'تطوير تقاطع مسيمير', text: 'New sections at Mesaimeer Interchange improved free-flow connectivity between major Doha corridors.', focus:{lat:25.221,lng:51.456,zoom:12}, route:'mesaimeer' },
  { year: 2022, title: 'D-Ring Road upgrade', ar: 'تطوير الطريق الدائري الرابع', text: 'A 3.5 km section of D-Ring Road was developed and expanded with upgraded intersections.', focus:{lat:25.244,lng:51.506,zoom:12}, route:'dring' },
  { year: 2026, title: 'Connected Qatar', ar: 'قطر بشبكة مترابطة', text: 'Today’s map shows the mature national road system. Historical overlays remain limited to documented milestones.', focus:{lat:25.35,lng:51.20,zoom:8} }
];

const routes = {
  dukhan: {year:1939, name:'Doha–Dukhan historic corridor', path:[[25.2854,51.5310],[25.292,51.425],[25.35,51.23],[25.43,50.79]]},
  industrial: {year:1948, name:'Dukhan–Umm Bab–Mesaieed industrial corridor', path:[[25.43,50.79],[25.21,50.81],[24.99,51.55]]},
  salwa: {year:1970, name:'Salwa regional corridor', path:[[25.27,51.49],[25.19,51.34],[25.03,51.10],[24.75,50.84]]},
  salwaModern: {year:2010, name:'Salwa Road Phase 2 corridor', path:[[25.267,51.497],[25.251,51.444],[25.231,51.385],[25.215,51.325]]},
  north: {year:2012, name:'North Road / Al Shamal corridor', path:[[25.33,51.45],[25.42,51.40],[25.62,51.38],[25.88,51.30],[26.10,51.20]]},
  dukhanModern: {year:2014, name:'Dukhan Highway Central corridor', path:[[25.316,51.40],[25.335,51.31],[25.36,51.21]]},
  expressway2017: {year:2017, name:'2017 expressway openings', path:[[25.12,51.58],[25.15,51.45],[25.20,51.30],[25.29,51.19],[25.38,51.22]]},
  south2018: {year:2018, name:'Southern Doha expressway links', path:[[25.16,51.55],[25.19,51.50],[25.22,51.45],[25.25,51.43]]},
  mesaimeer: {year:2020, name:'Mesaimeer Interchange links', path:[[25.213,51.445],[25.221,51.456],[25.236,51.474]]},
  dring: {year:2022, name:'D-Ring Road development section', path:[[25.226,51.486],[25.238,51.505],[25.252,51.522],[25.263,51.529]]}
};

const places = [
  ['Doha',25.2854,51.5310],['Al Rayyan',25.2919,51.4244],['Al Wakrah',25.1715,51.6034],['Umm Salal',25.4149,51.4058],['Al Khor',25.6800,51.5075],['Al Shamal',26.1268,51.2010],['Al Daayen / Lusail',25.5197,51.5478],['Al Shahaniya',25.3705,51.2136],['Dukhan',25.43,50.79],['Mesaieed',24.99,51.55]
];

function loadGoogleMaps(){
  if(window.google?.maps) return Promise.resolve(window.google.maps);
  if(window.__gmapsPromise) return window.__gmapsPromise;
  window.__gmapsPromise = new Promise((resolve,reject)=>{
    const cb='__initMunicipalityGoogleMap';
    window[cb]=()=>{ resolve(window.google.maps); delete window[cb]; };
    const s=document.createElement('script');
    s.src=`https://maps.googleapis.com/maps/api/js?key=${GOOGLE_KEY}&callback=${cb}&v=weekly`;
    s.async=true; s.defer=true; s.onerror=reject; document.head.appendChild(s);
  });
  return window.__gmapsPromise;
}

function GoogleHistoryMap({year,mapType,onMapReady}){
  const el=useRef(null); const mapRef=useRef(null); const overlays=useRef([]); const markers=useRef([]);
  useEffect(()=>{
    if(!GOOGLE_KEY) return;
    let alive=true;
    loadGoogleMaps().then(gmaps=>{
      if(!alive) return;
      const map=new gmaps.Map(el.current,{center:{lat:25.35,lng:51.20},zoom:8,mapTypeId:mapType,streetViewControl:false,fullscreenControl:true,mapTypeControl:false,gestureHandling:'greedy'});
      mapRef.current=map; onMapReady?.(map);
      markers.current=places.map(([name,lat,lng])=>new gmaps.Marker({map,position:{lat,lng},title:name,label:{text:name,color:'#5c1233',fontWeight:'700',fontSize:'11px'}}));
    });
    return()=>{alive=false; overlays.current.forEach(o=>o.setMap(null)); markers.current.forEach(m=>m.setMap(null));};
  },[]);

  useEffect(()=>{ if(mapRef.current) mapRef.current.setMapTypeId(mapType); },[mapType]);

  useEffect(()=>{
    if(!mapRef.current || !window.google?.maps) return;
    overlays.current.forEach(o=>o.setMap(null)); overlays.current=[];
    Object.values(routes).filter(r=>r.year<=year).forEach(r=>{
      const line=new google.maps.Polyline({
        map:mapRef.current,
        path:r.path.map(([lat,lng])=>({lat,lng})),
        strokeColor:r.year<2000?'#b4873d':'#8a1538',
        strokeOpacity:.95,
        strokeWeight:r.year<2000?4:5,
        geodesic:true,
        zIndex:10
      });
      const mid=r.path[Math.floor(r.path.length/2)];
      const marker=new google.maps.Marker({map:mapRef.current,position:{lat:mid[0],lng:mid[1]},title:r.name,icon:{path:google.maps.SymbolPath.CIRCLE,scale:4,fillColor:'#ffffff',fillOpacity:1,strokeColor:'#8a1538',strokeWeight:2}});
      const info=new google.maps.InfoWindow({content:`<div style="font:600 12px Arial;color:#222">${r.name}</div><div style="font:11px Arial;color:#666;margin-top:3px">Documented milestone: ${r.year}. Overlay follows the present-day corridor approximately.</div>`});
      marker.addListener('click',()=>info.open({map:mapRef.current,anchor:marker}));
      overlays.current.push(line,marker);
    });
  },[year]);

  return <div ref={el} className="google-map"/>;
}

function App(){
  const [year,setYear]=useState(1939); const [playing,setPlaying]=useState(false); const [mapType,setMapType]=useState('roadmap'); const mapObj=useRef(null);
  const current=useMemo(()=>[...milestones].reverse().find(m=>year>=m.year)||milestones[0],[year]);
  useEffect(()=>{ if(!playing)return; const t=setInterval(()=>setYear(v=>{if(v>=2026){setPlaying(false);return 2026;}return v+1;}),100); return()=>clearInterval(t);},[playing]);
  useEffect(()=>{ if(mapObj.current&&current.focus) mapObj.current.panTo({lat:current.focus.lat,lng:current.focus.lng}); if(mapObj.current&&current.focus) mapObj.current.setZoom(current.focus.zoom); },[current.year]);
  const jump=y=>{setPlaying(false);setYear(y)};

  return <div className="app-shell">
    <header className="topbar">
      <div className="brand-lockup">
        <img src={LOGO_URL} alt="Ministry of Municipality - State of Qatar"/>
      </div>
      <div className="title-lockup"><span>INTERACTIVE URBAN HISTORY</span><h1>Qatar Road & Urban Development <b>1939 — 2026</b></h1></div>
      <div className="verified"><span></span> DOCUMENTED MILESTONES</div>
    </header>

    <main className="main-grid">
      <section className="map-panel">
        {!GOOGLE_KEY && <div className="api-key-card"><MapPinned size={34}/><h2>Google Maps API key required</h2><p>Add <b>VITE_GOOGLE_MAPS_API_KEY</b> in Render → Environment, then redeploy. Enable the Maps JavaScript API for the key.</p></div>}
        {GOOGLE_KEY && <GoogleHistoryMap year={year} mapType={mapType} onMapReady={m=>mapObj.current=m}/>} 
        <div className="map-overlay-title"><span>QATAR DEVELOPMENT TIMELINE</span><strong>{year}</strong></div>
        <div className="map-switch"><button className={mapType==='roadmap'?'active':''} onClick={()=>setMapType('roadmap')}><MapIcon size={15}/> Map</button><button className={mapType==='hybrid'?'active':''} onClick={()=>setMapType('hybrid')}><Satellite size={15}/> Satellite</button></div>
        <div className="accuracy-note"><Info size={13}/> Current geography is from Google Maps. Historical coloured corridors use documented dates; their drawn geometry follows present-day alignments approximately unless an official historical GIS layer is available.</div>
      </section>

      <aside className="story-panel">
        <div className="year-block"><span>YEAR</span><strong>{year}</strong><em>{current.ar}</em></div>
        <div className="story-card"><div className="story-year"><Clock3 size={17}/>{current.year}</div><h2>{current.title}</h2><p>{current.text}</p></div>
        <div className="milestones">
          {milestones.map(m=><button key={m.year} className={year>=m.year?'passed':''} onClick={()=>jump(m.year)}><span>{m.year}</span><i></i><b>{m.title}</b></button>)}
        </div>
      </aside>
    </main>

    <footer className="timeline-dock">
      <button className="play" onClick={()=>setPlaying(v=>!v)}>{playing?<Pause size={19}/>:<Play size={19} fill="currentColor"/>}</button>
      <button className="reset" onClick={()=>jump(1939)}><RotateCcw size={16}/></button>
      <div className="slider"><div className="edge"><span>1939</span><span>2026</span></div><input type="range" min="1939" max="2026" value={year} onChange={e=>jump(Number(e.target.value))} style={{'--p':`${((year-1939)/(2026-1939))*100}%`}}/></div>
      <div className="phase"><span>CURRENT MILESTONE</span><b>{current.title}</b></div>
    </footer>
  </div>;
}

createRoot(document.getElementById('root')).render(<App/>);
