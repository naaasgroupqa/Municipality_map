import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Play, Pause, RotateCcw, Clock3, Map as MapIcon, Moon, Info, LocateFixed } from 'lucide-react';
import './styles.css';

const LOGO_URL = 'https://qatarplatform.net/wp-content/uploads/2024/04/%D8%B4%D8%B9%D8%A7%D8%B1-%D9%88%D8%B2%D8%A7%D8%B1%D8%A9-%D8%A7%D9%84%D8%A8%D9%84%D8%AF%D9%8A%D8%A9-1.png';

const milestones = [
  { year: 1939, title: 'First oil-era road', ar: 'بداية شبكة الطرق الحديثة', text: 'The first road associated with Qatar’s oil era connected Doha and Dukhan in 1938/39.', focus: [51.15,25.34,8.6] },
  { year: 1948, title: 'Industrial corridor expands', ar: 'توسع طرق الصناعة والطاقة', text: 'A second oil-industry route linked Dukhan with Umm Bab and Mesaieed in 1947/48.', focus:[51.08,25.18,8.2] },
  { year: 1950, title: 'Doha begins modern transformation', ar: 'بداية التحول العمراني في الدوحة', text: 'Oil revenues began driving public infrastructure, municipal works and rapid urban change in Doha.', focus:[51.531,25.2854,11.7] },
  { year: 1963, title: 'A & B Ring roads established', ar: 'ظهور الطريقين الدائريين الأول والثاني', text: 'Historical urban research documents the roads later known as A Ring and B Ring by 1963.', focus:[51.505,25.2854,12.2] },
  { year: 1965, title: 'C Ring outline in place', ar: 'بداية الطريق الدائري الثالث', text: 'The outline of the road later known as C Ring was already in place by 1965.', focus:[51.495,25.275,11.6] },
  { year: 1970, title: 'Regional road system matures', ar: 'توسع الربط بين مناطق الدولة', text: 'Major inter-city routes were upgraded as Doha expanded beyond its early core.', focus:[51.25,25.25,9.0] },
  { year: 2010, title: 'Expressway programme accelerates', ar: 'تسارع برنامج الطرق السريعة', text: 'A new generation of high-capacity road projects accelerated across metropolitan Doha and Qatar.', focus:[51.38,25.23,10.1] },
  { year: 2012, title: 'North Road enhancement', ar: 'تطوير طريق الشمال', text: 'The North Road corridor entered a major enhancement phase with junction and service-road upgrades.', focus:[51.39,25.55,9.1] },
  { year: 2014, title: 'Dukhan Highway modernisation', ar: 'تحديث طريق دخان السريع', text: 'Modernisation of the Dukhan corridor strengthened the west–Doha connection.', focus:[51.25,25.34,9.8] },
  { year: 2017, title: 'National expressway leap', ar: 'قفزة في شبكة الطرق السريعة', text: 'Major orbital, ring-road and expressway openings transformed cross-country movement.', focus:[51.34,25.22,9.2] },
  { year: 2018, title: 'Southern network integration', ar: 'تكامل شبكة الطرق الجنوبية', text: 'New links connected Doha’s expressway system with southern growth areas and ring roads.', focus:[51.50,25.18,10.2] },
  { year: 2020, title: 'Mesaimeer interchange expansion', ar: 'تطوير تقاطع مسيمير', text: 'New free-flow connections improved movement between several major Doha corridors.', focus:[51.456,25.221,12.2] },
  { year: 2022, title: 'D-Ring Road upgrade', ar: 'تطوير الطريق الدائري الرابع', text: 'D-Ring Road improvements expanded capacity and upgraded major intersections.', focus:[51.506,25.244,12.2] },
  { year: 2026, title: 'Connected Qatar', ar: 'قطر بشبكة مترابطة', text: 'Today’s basemap shows the mature national road system. Historical overlays are shown only where milestone dating is defensible.', focus:[51.20,25.35,8.0] }
];

const routes = [
  {year:1939,name:'Doha–Dukhan historic corridor',coords:[[51.5310,25.2854],[51.425,25.292],[51.23,25.35],[50.79,25.43]]},
  {year:1948,name:'Dukhan–Umm Bab–Mesaieed industrial corridor',coords:[[50.79,25.43],[50.81,25.21],[51.10,25.08],[51.55,24.99]]},
  {year:1970,name:'Salwa regional corridor',coords:[[51.49,25.27],[51.34,25.19],[51.10,25.03],[50.84,24.75]]},
  {year:2010,name:'Salwa Road modern corridor',coords:[[51.497,25.267],[51.444,25.251],[51.385,25.231],[51.325,25.215]]},
  {year:2012,name:'North Road / Al Shamal corridor',coords:[[51.45,25.33],[51.40,25.42],[51.38,25.62],[51.30,25.88],[51.20,26.10]]},
  {year:2014,name:'Dukhan Highway Central corridor',coords:[[51.40,25.316],[51.31,25.335],[51.21,25.36]]},
  {year:2017,name:'2017 expressway programme corridors',coords:[[51.58,25.12],[51.45,25.15],[51.30,25.20],[51.19,25.29],[51.22,25.38]]},
  {year:2018,name:'Southern Doha expressway links',coords:[[51.55,25.16],[51.50,25.19],[51.45,25.22],[51.43,25.25]]},
  {year:2020,name:'Mesaimeer Interchange links',coords:[[51.445,25.213],[51.456,25.221],[51.474,25.236]]},
  {year:2022,name:'D-Ring Road development section',coords:[[51.486,25.226],[51.505,25.238],[51.522,25.252],[51.529,25.263]]}
];

const places = [
  ['Doha',51.5310,25.2854],['Al Rayyan',51.4244,25.2919],['Al Wakrah',51.6034,25.1715],['Umm Salal',51.4058,25.4149],['Al Khor',51.5075,25.6800],['Al Shamal',51.2010,26.1268],['Al Daayen / Lusail',51.5478,25.5197],['Al Shahaniya',51.2136,25.3705],['Dukhan',50.79,25.43],['Mesaieed',51.55,24.99]
];

const growth = [
  {year:1950,center:[51.531,25.285],radius:8},
  {year:1965,center:[51.515,25.285],radius:18},
  {year:1970,center:[51.50,25.28],radius:28},
  {year:2010,center:[51.47,25.30],radius:46},
  {year:2017,center:[51.40,25.32],radius:72},
  {year:2026,center:[51.30,25.35],radius:105}
];

function rasterStyle(mode){
  const presentation = mode === 'dark';
  return {
    version:8,
    sources:{
      base:{
        type:'raster',
        tiles:['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
        tileSize:256,
        attribution:'© OpenStreetMap contributors'
      }
    },
    layers:[{
      id:'base',
      type:'raster',
      source:'base',
      paint: presentation ? {
        'raster-brightness-min':0.05,
        'raster-brightness-max':0.42,
        'raster-saturation':-0.72,
        'raster-contrast':0.28
      } : {
        'raster-brightness-min':0,
        'raster-brightness-max':1,
        'raster-saturation':0,
        'raster-contrast':0
      }
    }]
  };
}

function historyGeoJSON(year){
  return {type:'FeatureCollection',features:routes.filter(r=>r.year<=year).map(r=>({type:'Feature',properties:{year:r.year,name:r.name},geometry:{type:'LineString',coordinates:r.coords}}))};
}
function growthGeoJSON(year){
  return {type:'FeatureCollection',features:growth.filter(g=>g.year<=year).slice(-1).map(g=>({type:'Feature',properties:{year:g.year,radius:g.radius},geometry:{type:'Point',coordinates:g.center}}))};
}

function addHistoryLayers(map,year){
  if(!map.getSource('history')) map.addSource('history',{type:'geojson',data:historyGeoJSON(year)});
  if(!map.getLayer('history-glow')) map.addLayer({id:'history-glow',type:'line',source:'history',paint:{'line-color':['case',['<',['get','year'],2000],'#d4ad64','#8a1538'],'line-width':['case',['<',['get','year'],2000],7,9],'line-opacity':0.20}});
  if(!map.getLayer('history-lines')) map.addLayer({id:'history-lines',type:'line',source:'history',paint:{'line-color':['case',['<',['get','year'],2000],'#d4ad64','#8a1538'],'line-width':['case',['<',['get','year'],2000],3.5,4.5],'line-opacity':0.96}});
  if(!map.getSource('growth')) map.addSource('growth',{type:'geojson',data:growthGeoJSON(year)});
  if(!map.getLayer('growth-area')) map.addLayer({id:'growth-area',type:'circle',source:'growth',paint:{'circle-radius':['interpolate',['linear'],['zoom'],7,['*',['get','radius'],0.45],12,['*',['get','radius'],2.4]],'circle-color':'#8a1538','circle-opacity':0.08,'circle-stroke-color':'#c9a35e','circle-stroke-opacity':0.45,'circle-stroke-width':1.5}});
}

function QatarMap({year,mode,onReady}){
  const el=useRef(null); const mapRef=useRef(null); const markers=useRef([]);
  useEffect(()=>{
    const map=new maplibregl.Map({container:el.current,style:rasterStyle(mode),center:[51.20,25.35],zoom:8,attributionControl:true,maxBounds:[[50.60,24.35],[52.10,26.35]]});
    map.addControl(new maplibregl.NavigationControl({showCompass:false}),'bottom-right');
    mapRef.current=map;
    map.on('load',()=>{
      addHistoryLayers(map,year);
      places.forEach(([name,lng,lat])=>{
        const node=document.createElement('div'); node.className='place-dot'; node.title=name;
        const popup=new maplibregl.Popup({offset:12,closeButton:false}).setHTML(`<b>${name}</b>`);
        const marker=new maplibregl.Marker({element:node}).setLngLat([lng,lat]).setPopup(popup).addTo(map); markers.current.push(marker);
      });
      map.on('click','history-lines',e=>{
        const f=e.features?.[0]; if(!f)return;
        new maplibregl.Popup().setLngLat(e.lngLat).setHTML(`<b>${f.properties.name}</b><br><span>Milestone year: ${f.properties.year}</span><br><small>Historical date is documented; displayed geometry follows the present-day corridor approximately.</small>`).addTo(map);
      });
      map.on('mouseenter','history-lines',()=>map.getCanvas().style.cursor='pointer');
      map.on('mouseleave','history-lines',()=>map.getCanvas().style.cursor='');
      onReady?.(map);
    });
    return()=>{markers.current.forEach(m=>m.remove());markers.current=[];map.remove();};
  },[]);

  useEffect(()=>{
    const map=mapRef.current; if(!map)return;
    const apply=()=>{
      map.getSource('history')?.setData(historyGeoJSON(year));
      map.getSource('growth')?.setData(growthGeoJSON(year));
    };
    if(map.isStyleLoaded()) apply(); else map.once('idle',apply);
  },[year]);

  useEffect(()=>{
    const map=mapRef.current; if(!map)return;
    map.setStyle(rasterStyle(mode));
    map.once('styledata',()=>addHistoryLayers(map,year));
  },[mode]);

  return <div ref={el} className="maplibre-map"/>;
}

function App(){
  const [year,setYear]=useState(1939); const [playing,setPlaying]=useState(false); const [mode,setMode]=useState('road'); const mapObj=useRef(null);
  const current=useMemo(()=>[...milestones].reverse().find(m=>year>=m.year)||milestones[0],[year]);
  useEffect(()=>{if(!playing)return;const t=setInterval(()=>setYear(v=>{if(v>=2026){setPlaying(false);return 2026;}return v+1;}),100);return()=>clearInterval(t);},[playing]);
  useEffect(()=>{const map=mapObj.current;if(!map||!current.focus)return;map.flyTo({center:[current.focus[0],current.focus[1]],zoom:current.focus[2],duration:1300,essential:true});},[current.year]);
  const jump=y=>{setPlaying(false);setYear(y)};
  const resetQatar=()=>mapObj.current?.flyTo({center:[51.20,25.35],zoom:8,duration:900});

  return <div className="app-shell">
    <header className="topbar">
      <div className="brand-lockup"><img src={LOGO_URL} alt="Ministry of Municipality - State of Qatar"/></div>
      <div className="title-lockup"><span>INTERACTIVE URBAN HISTORY</span><h1>Qatar Road & Urban Development <b>1939 — 2026</b></h1></div>
      <div className="verified"><span></span> DOCUMENTED MILESTONES</div>
    </header>
    <main className="main-grid">
      <section className="map-panel">
        <QatarMap year={year} mode={mode} onReady={m=>mapObj.current=m}/>
        <div className="map-overlay-title"><span>QATAR DEVELOPMENT TIMELINE</span><strong>{year}</strong></div>
        <div className="map-switch">
          <button className={mode==='road'?'active':''} onClick={()=>setMode('road')}><MapIcon size={15}/> Road</button>
          <button className={mode==='dark'?'active':''} onClick={()=>setMode('dark')}><Moon size={15}/> Presentation</button>
          <button onClick={resetQatar}><LocateFixed size={15}/> Qatar</button>
        </div>
        <div className="legend"><span className="lg old"></span>Historic / early corridor <span className="lg modern"></span>Modern expressway milestone <span className="lg growth"></span>Urban-growth footprint</div>
        <div className="accuracy-note"><Info size={13}/> Current roads and place labels come from OpenStreetMap tiles. Historical dates follow documented milestones; coloured corridor geometry is approximate until official historical GIS/aerial layers are supplied.</div>
      </section>
      <aside className="story-panel">
        <div className="year-block"><span>YEAR</span><strong>{year}</strong><em>{current.ar}</em></div>
        <div className="story-card"><div className="story-year"><Clock3 size={17}/>{current.year}</div><h2>{current.title}</h2><p>{current.text}</p></div>
        <div className="milestones">{milestones.map(m=><button key={m.year} className={year>=m.year?'passed':''} onClick={()=>jump(m.year)}><span>{m.year}</span><i></i><b>{m.title}</b></button>)}</div>
      </aside>
    </main>
    <footer className="timeline-dock">
      <button className="play" onClick={()=>setPlaying(v=>!v)}>{playing?<Pause size={19}/>:<Play size={19} fill="currentColor"/>}</button>
      <button className="reset" onClick={()=>jump(1939)}><RotateCcw size={16}/></button>
      <div className="slider"><div className="edge"><span>1939</span><span>2026</span></div><input type="range" min="1939" max="2026" value={year} onChange={e=>jump(Number(e.target.value))} style={{'--p':`${((year-1939)/87)*100}%`}}/></div>
      <div className="phase"><span>CURRENT MILESTONE</span><b>{current.title}</b></div>
    </footer>
  </div>;
}

createRoot(document.getElementById('root')).render(<App/>);