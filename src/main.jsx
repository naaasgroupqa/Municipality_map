import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Play, Pause, RotateCcw, Search, Landmark, Map as MapIcon, Moon, LocateFixed, Route, Layers3, X } from 'lucide-react';
import './styles.css';

const LOGO_URL = 'https://qatarplatform.net/wp-content/uploads/2024/04/%D8%B4%D8%B9%D8%A7%D8%B1-%D9%88%D8%B2%D8%A7%D8%B1%D8%A9-%D8%A7%D9%84%D8%A8%D9%84%D8%AF%D9%8A%D8%A9-1.png';

const heritageSites = [
  {id:'zubarah',name:'Al Zubarah Archaeological Site',ar:'موقع الزبارة الأثري',municipality:'Al Shamal',category:'Archaeological Site',period:'18th–19th century',year:1760,lng:51.0297,lat:25.9781,summary:'UNESCO World Heritage site and Qatar’s best-preserved historic pearl-fishing and trading town.'},
  {id:'zubarah-fort',name:'Al Zubarah Fort',ar:'قلعة الزبارة',municipality:'Al Shamal',category:'Fort',period:'1938',year:1938,lng:51.0455,lat:25.9769,summary:'Fort overlooking the archaeological town of Al Zubarah and now a major heritage landmark.'},
  {id:'murair',name:'Qal’at Murair',ar:'قلعة مرير',municipality:'Al Shamal',category:'Fort',period:'18th–20th century',year:1770,lng:51.0365,lat:25.9708,summary:'Historic fortified enclosure linked to Al Zubarah, with wells, cisterns and remains of domestic buildings.'},
  {id:'freiha',name:'Freiha Archaeological Site',ar:'موقع فريحة الأثري',municipality:'Al Shamal',category:'Archaeological Site',period:'18th–mid 19th century',year:1750,lng:51.0417,lat:26.0152,summary:'Coastal archaeological settlement in northern Qatar associated with the pearling era.'},
  {id:'ruwaida',name:'Al Ruwaida Archaeological Site',ar:'موقع الرويضة الأثري',municipality:'Al Shamal',category:'Archaeological Site',period:'16th–18th century',year:1550,lng:51.1472,lat:26.0836,summary:'Northern coastal settlement containing archaeological remains from Qatar’s maritime past.'},
  {id:'rekayat',name:'Al Rekayat Fort',ar:'قلعة الركيات',municipality:'Al Shamal',category:'Fort',period:'19th century',year:1850,lng:51.1304,lat:26.0513,summary:'One of Qatar’s traditional desert forts, built to protect water sources and nearby settlements.'},
  {id:'jassasiya',name:'Al Jassasiya Rock Art Site',ar:'موقع الجساسية للنقوش الصخرية',municipality:'Al Shamal',category:'Rock Art',period:'Historic / pre-modern',year:1750,lng:51.4015,lat:25.9545,summary:'Qatar’s largest concentration of petroglyphs, including cup marks, rosettes, boats and other carved forms.'},
  {id:'jumail',name:'Al Jumail Heritage Village',ar:'قرية الجميل التراثية',municipality:'Al Shamal',category:'Historic Village',period:'19th century',year:1850,lng:51.1665,lat:26.0978,summary:'Abandoned northern coastal village preserving traces of traditional Qatari settlement life.'},
  {id:'murwab',name:'Murwab Archaeological Site',ar:'موقع مروب الأثري',municipality:'Al Shamal',category:'Archaeological Site',period:'Early Islamic period',year:800,lng:51.0212,lat:25.8591,summary:'Important inland archaeological settlement with fortified remains from the early Islamic period.'},
  {id:'barzan',name:'Barzan Towers',ar:'أبراج برزان',municipality:'Umm Salal',category:'Tower',period:'1910–1916',year:1910,lng:51.4132,lat:25.4181,summary:'Historic watchtowers at Umm Salal Mohammed, used to monitor the surrounding wells and cultivated land.'},
  {id:'zekreet',name:'Zekreet Fort & Mosque',ar:'قلعة ومسجد زكريت',municipality:'Al Shahaniya',category:'Fort',period:'1809–1812',year:1810,lng:50.8446,lat:25.4901,summary:'Western Qatar fort built from local beach rock, with a nearby historic mosque.'},
  {id:'bin-ghannam',name:'Jazirat Bin Ghannam',ar:'جزيرة بن غنام',municipality:'Al Khor & Al Thakhira',category:'Archaeological Landscape',period:'2nd millennium BCE onward',year:-1500,lng:51.5491,lat:25.6928,summary:'Coastal island with archaeological evidence of long-term human activity, trade and dye production.'},
  {id:'alkhor-towers',name:'Al Khor Historic Towers',ar:'أبراج الخور التاريخية',municipality:'Al Khor & Al Thakhira',category:'Tower',period:'Early 20th century',year:1900,lng:51.5048,lat:25.6839,summary:'Traditional watchtower remains associated with Al Khor’s historic coastal settlement.'},
  {id:'souq-waqif',name:'Souq Waqif',ar:'سوق واقف',municipality:'Doha',category:'Heritage District',period:'Late 19th–early 20th century',year:1890,lng:51.5332,lat:25.2883,summary:'Doha’s historic marketplace, closely linked to the city’s old shoreline, trade and traditional urban life.'},
  {id:'alkoot',name:'Al Koot Fort',ar:'قلعة الكوت',municipality:'Doha',category:'Fort',period:'Early 20th century',year:1927,lng:51.5320,lat:25.2860,summary:'Historic fort in central Doha, near Souq Waqif, representing the city’s early administrative history.'},
  {id:'old-palace',name:'Old Palace of Sheikh Abdullah bin Jassim',ar:'القصر القديم للشيخ عبدالله بن جاسم',municipality:'Doha',category:'Historic House',period:'Early 20th century',year:1900,lng:51.5493,lat:25.2867,summary:'Historic palace integrated into the National Museum of Qatar complex and associated with Qatar’s modern state history.'},
  {id:'bayt-zaman',name:'Bayt Al Zaman',ar:'بيت الزمان',municipality:'Doha',category:'Historic House',period:'1950s',year:1950,lng:51.5380,lat:25.2815,summary:'A 1950s family home in Old Al Ghanim illustrating Doha’s residential and social history.'},
  {id:'fahd-palace',name:'Fahd bin Ali Palace',ar:'قصر فهد بن علي',municipality:'Doha',category:'Historic House',period:'1953',year:1953,lng:51.5288,lat:25.2934,summary:'Mid-20th-century palace near the Amiri Diwan, preserved as part of Doha’s architectural heritage.'},
  {id:'msheireb',name:'Msheireb Heritage Houses',ar:'بيوت مشيرب التراثية',municipality:'Doha',category:'Heritage District',period:'20th century',year:1920,lng:51.5265,lat:25.2866,summary:'Restored heritage houses documenting domestic life, social change, education and the oil era in central Doha.'},
  {id:'wakrah-souq',name:'Old Al Wakrah Heritage District',ar:'منطقة الوكرة التراثية',municipality:'Al Wakrah',category:'Heritage District',period:'19th–20th century',year:1850,lng:51.6080,lat:25.1719,summary:'Historic coastal settlement area reflecting Al Wakrah’s fishing, pearling and trading past.'}
];

const roadMilestones = [
  {year:1939,name:'Doha–Dukhan oil-era road',coords:[[51.531,25.285],[51.425,25.292],[51.23,25.35],[50.79,25.43]]},
  {year:1948,name:'Dukhan–Umm Bab–Mesaieed industrial corridor',coords:[[50.79,25.43],[50.81,25.21],[51.10,25.08],[51.55,24.99]]},
  {year:1970,name:'Salwa regional corridor',coords:[[51.49,25.27],[51.34,25.19],[51.10,25.03],[50.84,24.75]]},
  {year:2012,name:'North Road enhancement',coords:[[51.45,25.33],[51.40,25.42],[51.38,25.62],[51.30,25.88],[51.20,26.10]]},
  {year:2017,name:'Modern expressway programme',coords:[[51.58,25.12],[51.45,25.15],[51.30,25.20],[51.19,25.29],[51.22,25.38]]}
];

const categories=['All','Archaeological Site','Fort','Tower','Rock Art','Historic Village','Heritage District','Historic House','Archaeological Landscape'];

function baseStyle(mode){
  return {version:8,sources:{base:{type:'raster',tiles:['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],tileSize:256,attribution:'© OpenStreetMap contributors'}},layers:[{id:'base',type:'raster',source:'base',paint:{'raster-brightness-max':mode==='dark'?0.46:1,'raster-saturation':mode==='dark'?-0.85:0,'raster-contrast':mode==='dark'?0.22:0,'raster-opacity':1}}]};
}

function siteGeoJSON(sites){return {type:'FeatureCollection',features:sites.map(s=>({type:'Feature',properties:{...s},geometry:{type:'Point',coordinates:[s.lng,s.lat]}}))};}
function roadsGeoJSON(year){return {type:'FeatureCollection',features:roadMilestones.filter(r=>r.year<=year).map(r=>({type:'Feature',properties:{year:r.year,name:r.name},geometry:{type:'LineString',coordinates:r.coords}}))};}

function HeritageMap({sites,year,mode,showRoads,onSelect,onReady,selectedId}){
  const el=useRef(null); const mapRef=useRef(null);
  useEffect(()=>{
    const map=new maplibregl.Map({container:el.current,style:baseStyle(mode),center:[51.18,25.52],zoom:7.55,maxBounds:[[50.55,24.30],[52.15,26.35]],attributionControl:true});
    map.addControl(new maplibregl.NavigationControl({showCompass:false}),'bottom-right'); mapRef.current=map;
    map.on('load',()=>{
      map.addSource('heritage',{type:'geojson',data:siteGeoJSON(sites),cluster:true,clusterMaxZoom:11,clusterRadius:48});
      map.addLayer({id:'clusters',type:'circle',source:'heritage',filter:['has','point_count'],paint:{'circle-color':'#8a1538','circle-radius':['step',['get','point_count'],18,5,23,10,28],'circle-stroke-color':'#ffffff','circle-stroke-width':2}});
      map.addLayer({id:'cluster-count',type:'symbol',source:'heritage',filter:['has','point_count'],layout:{'text-field':['get','point_count_abbreviated'],'text-size':12},paint:{'text-color':'#ffffff'}});
      map.addLayer({id:'heritage-points',type:'circle',source:'heritage',filter:['!',['has','point_count']],paint:{'circle-radius':9,'circle-color':['case',['==',['get','id'],selectedId],'#d6aa58','#8a1538'],'circle-stroke-color':'#ffffff','circle-stroke-width':2.5}});
      map.addLayer({id:'heritage-labels',type:'symbol',source:'heritage',filter:['!',['has','point_count']],minzoom:8.3,layout:{'text-field':['get','name'],'text-size':10,'text-offset':[0,1.7],'text-anchor':'top','text-allow-overlap':false},paint:{'text-color':'#4a1730','text-halo-color':'#ffffff','text-halo-width':1.3}});
      map.addSource('roads',{type:'geojson',data:roadsGeoJSON(year)});
      map.addLayer({id:'roads-history',type:'line',source:'roads',layout:{visibility:showRoads?'visible':'none'},paint:{'line-color':['case',['<',['get','year'],2000],'#d3a65d','#8a1538'],'line-width':4,'line-opacity':0.88}});
      map.on('click','heritage-points',e=>{const p=e.features?.[0]?.properties;if(p)onSelect(p.id);});
      map.on('click','clusters',e=>{const f=e.features?.[0];if(!f)return;const id=f.properties.cluster_id;map.getSource('heritage').getClusterExpansionZoom(id).then(z=>map.easeTo({center:f.geometry.coordinates,zoom:z}));});
      map.on('mouseenter','heritage-points',()=>map.getCanvas().style.cursor='pointer'); map.on('mouseleave','heritage-points',()=>map.getCanvas().style.cursor='');
      onReady(map);
    });
    return()=>map.remove();
  },[]);
  useEffect(()=>{const map=mapRef.current;if(!map)return;const s=map.getSource('heritage');if(s)s.setData(siteGeoJSON(sites));},[sites]);
  useEffect(()=>{const map=mapRef.current;if(!map)return;const s=map.getSource('roads');if(s)s.setData(roadsGeoJSON(year));},[year]);
  useEffect(()=>{const map=mapRef.current;if(map?.getLayer('roads-history'))map.setLayoutProperty('roads-history','visibility',showRoads?'visible':'none');},[showRoads]);
  useEffect(()=>{const map=mapRef.current;if(!map)return;map.setStyle(baseStyle(mode));map.once('styledata',()=>{});},[mode]);
  return <div ref={el} className="maplibre-map"/>;
}

function App(){
  const [year,setYear]=useState(2026),[playing,setPlaying]=useState(false),[mode,setMode]=useState('road'),[showRoads,setShowRoads]=useState(false);
  const [query,setQuery]=useState(''),[category,setCategory]=useState('All'),[selectedId,setSelectedId]=useState('zubarah'); const mapObj=useRef(null);
  const selected=heritageSites.find(s=>s.id===selectedId)||heritageSites[0];
  const filtered=useMemo(()=>heritageSites.filter(s=>(category==='All'||s.category===category)&&(!query||`${s.name} ${s.ar} ${s.municipality} ${s.category}`.toLowerCase().includes(query.toLowerCase()))),[query,category]);
  useEffect(()=>{if(!playing)return;const t=setInterval(()=>setYear(v=>v>=2026?(setPlaying(false),2026):v+1),120);return()=>clearInterval(t)},[playing]);
  const chooseSite=id=>{setSelectedId(id);const s=heritageSites.find(x=>x.id===id);if(s&&mapObj.current)mapObj.current.flyTo({center:[s.lng,s.lat],zoom:12,duration:900});};
  const resetQatar=()=>mapObj.current?.flyTo({center:[51.18,25.52],zoom:7.55,duration:900});

  return <div className="app-shell heritage-app">
    <header className="topbar">
      <div className="brand-lockup"><img src={LOGO_URL} alt="Ministry of Municipality - State of Qatar"/></div>
      <div className="title-lockup"><span>INTERACTIVE HERITAGE & URBAN HISTORY</span><h1>Qatar Historical Places <b>& Development Timeline</b></h1></div>
      <div className="header-stat"><strong>{heritageSites.length}</strong><span>Historical places</span></div>
    </header>

    <main className="heritage-grid">
      <aside className="heritage-sidebar">
        <div className="searchbox"><Search size={15}/><input placeholder="Search historical places…" value={query} onChange={e=>setQuery(e.target.value)}/>{query&&<button onClick={()=>setQuery('')}><X size={14}/></button>}</div>
        <div className="category-scroll">{categories.map(c=><button key={c} className={category===c?'active':''} onClick={()=>setCategory(c)}>{c}</button>)}</div>
        <div className="result-head"><span>{filtered.length} places</span><b>Across Qatar</b></div>
        <div className="site-list">{filtered.map(s=><button key={s.id} className={selectedId===s.id?'selected':''} onClick={()=>chooseSite(s.id)}><i><Landmark size={14}/></i><div><b>{s.name}</b><span>{s.municipality} · {s.category}</span></div></button>)}</div>
      </aside>

      <section className="map-panel">
        <HeritageMap sites={filtered} year={year} mode={mode} showRoads={showRoads} selectedId={selectedId} onSelect={chooseSite} onReady={m=>mapObj.current=m}/>
        <div className="map-overlay-title"><span>QATAR HERITAGE MAP</span><strong>{filtered.length}</strong><em>visible places</em></div>
        <div className="map-switch"><button className={mode==='road'?'active':''} onClick={()=>setMode('road')}><MapIcon size={15}/> Map</button><button className={mode==='dark'?'active':''} onClick={()=>setMode('dark')}><Moon size={15}/> Presentation</button><button className={showRoads?'active':''} onClick={()=>setShowRoads(v=>!v)}><Route size={15}/> Road history</button><button onClick={resetQatar}><LocateFixed size={15}/> Qatar</button></div>
        <div className="map-help"><Layers3 size={13}/> Click any heritage marker to explore the place. Cluster circles expand as you zoom in.</div>
      </section>

      <aside className="detail-panel">
        <span className="detail-kicker">{selected.category}</span><h2>{selected.name}</h2><h3>{selected.ar}</h3>
        <div className="detail-meta"><span><b>Municipality</b>{selected.municipality}</span><span><b>Period</b>{selected.period}</span></div>
        <p>{selected.summary}</p>
        <button className="locate-btn" onClick={()=>chooseSite(selected.id)}><LocateFixed size={15}/> Locate on map</button>
        <div className="detail-note">Historical-site descriptions are curated from Qatar Museums / heritage references. The database can be expanded with official Ministry GIS and archive records.</div>
      </aside>
    </main>

    <footer className="timeline-dock heritage-timeline">
      <button className="play" onClick={()=>setPlaying(v=>!v)}>{playing?<Pause size={19}/>:<Play size={19} fill="currentColor"/>}</button>
      <button className="reset" onClick={()=>{setPlaying(false);setYear(1939)}}><RotateCcw size={16}/></button>
      <div className="slider"><div className="edge"><span>1939</span><span>2026</span></div><input type="range" min="1939" max="2026" value={year} onChange={e=>{setPlaying(false);setYear(Number(e.target.value))}} style={{'--p':`${((year-1939)/87)*100}%`}}/></div>
      <div className="phase"><span>ROAD DEVELOPMENT YEAR</span><b>{year}</b></div>
    </footer>
  </div>;
}

createRoot(document.getElementById('root')).render(<App/>);
