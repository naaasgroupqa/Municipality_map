import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Search, Landmark, Sun, Moon, LocateFixed, X, Images, Eye, Globe2, Youtube, ExternalLink } from 'lucide-react';
import './styles.css';

const LOGO_URL = '/ministry-logo.png?v=20260906e';
const QATAR_BOUNDS = [[50.67, 24.42], [51.72, 26.24]];

const heritageSites = [
  {id:'zubarah',name:'Al Zubarah Archaeological Site',ar:'موقع الزبارة الأثري',municipality:'Al Shamal',category:'Archaeological Site',period:'18th–19th century',lng:51.0297,lat:25.9781,summary:'UNESCO World Heritage site and Qatar’s best-preserved historic pearl-fishing and trading town.'},
  {id:'zubarah-fort',name:'Al Zubarah Fort',ar:'قلعة الزبارة',municipality:'Al Shamal',category:'Fort',period:'1938',lng:51.0455,lat:25.9769,summary:'Fort overlooking the archaeological town of Al Zubarah and now a major heritage landmark.'},
  {id:'murair',name:'Qal’at Murair',ar:'قلعة مرير',municipality:'Al Shamal',category:'Fort',period:'18th–20th century',lng:51.0365,lat:25.9708,summary:'Historic fortified enclosure linked to Al Zubarah.'},
  {id:'freiha',name:'Freiha Archaeological Site',ar:'موقع فريحة الأثري',municipality:'Al Shamal',category:'Archaeological Site',period:'18th–mid 19th century',lng:51.0417,lat:26.0152,summary:'Coastal archaeological settlement associated with the pearling era.'},
  {id:'ruwaida',name:'Al Ruwaida Archaeological Site',ar:'موقع الرويضة الأثري',municipality:'Al Shamal',category:'Archaeological Site',period:'16th–18th century',lng:51.1472,lat:26.0836,summary:'Northern coastal settlement containing archaeological remains from Qatar’s maritime past.'},
  {id:'rekayat',name:'Al Rekayat Fort',ar:'قلعة الركيات',municipality:'Al Shamal',category:'Fort',period:'19th century',lng:51.1304,lat:26.0513,summary:'Traditional desert fort built to protect water sources and nearby settlements.'},
  {id:'jassasiya',name:'Al Jassasiya Rock Art Site',ar:'موقع الجساسية للنقوش الصخرية',municipality:'Al Shamal',category:'Rock Art',period:'Historic / pre-modern',lng:51.4015,lat:25.9545,summary:'Qatar’s largest concentration of petroglyphs.'},
  {id:'jumail',name:'Al Jumail Heritage Village',ar:'قرية الجميل التراثية',municipality:'Al Shamal',category:'Historic Village',period:'19th century',lng:51.1665,lat:26.0978,summary:'Abandoned northern coastal village preserving traces of traditional Qatari settlement life.'},
  {id:'murwab',name:'Murwab Archaeological Site',ar:'موقع مروب الأثري',municipality:'Al Shamal',category:'Archaeological Site',period:'Early Islamic period',lng:51.0212,lat:25.8591,summary:'Important inland archaeological settlement with fortified remains from the early Islamic period.'},
  {id:'barzan',name:'Barzan Towers',ar:'أبراج برزان',municipality:'Umm Salal',category:'Tower',period:'1910–1916',lng:51.4132,lat:25.4181,summary:'Historic watchtowers at Umm Salal Mohammed.'},
  {id:'zekreet',name:'Zekreet Fort & Mosque',ar:'قلعة ومسجد زكريت',municipality:'Al Shahaniya',category:'Fort',period:'1809–1812',lng:50.8446,lat:25.4901,summary:'Western Qatar fort built from local beach rock, with a nearby historic mosque.'},
  {id:'bin-ghannam',name:'Jazirat Bin Ghannam',ar:'جزيرة بن غنام',municipality:'Al Khor & Al Thakhira',category:'Archaeological Landscape',period:'2nd millennium BCE onward',lng:51.5491,lat:25.6928,summary:'Coastal island with archaeological evidence of long-term human activity, trade and dye production.'},
  {id:'alkhor-towers',name:'Al Khor Historic Towers',ar:'أبراج الخور التاريخية',municipality:'Al Khor & Al Thakhira',category:'Tower',period:'Early 20th century',lng:51.5048,lat:25.6839,summary:'Traditional watchtower remains associated with Al Khor’s historic coastal settlement.'},
  {id:'souq-waqif',name:'Souq Waqif',ar:'سوق واقف',municipality:'Doha',category:'Heritage District',period:'Late 19th–early 20th century',lng:51.5332,lat:25.2883,summary:'Doha’s historic marketplace, closely linked to the city’s old shoreline and trade.'},
  {id:'alkoot',name:'Al Koot Fort',ar:'قلعة الكوت',municipality:'Doha',category:'Fort',period:'Early 20th century',lng:51.5320,lat:25.2860,summary:'Historic fort in central Doha near Souq Waqif.'},
  {id:'old-palace',name:'Old Palace of Sheikh Abdullah bin Jassim',ar:'القصر القديم للشيخ عبدالله بن جاسم',municipality:'Doha',category:'Historic House',period:'Early 20th century',lng:51.5493,lat:25.2867,summary:'Historic palace integrated into the National Museum of Qatar complex.'},
  {id:'bayt-zaman',name:'Bayt Al Zaman',ar:'بيت الزمان',municipality:'Doha',category:'Historic House',period:'1950s',lng:51.5380,lat:25.2815,summary:'A 1950s family home in Old Al Ghanim illustrating Doha’s residential history.'},
  {id:'fahd-palace',name:'Fahd bin Ali Palace',ar:'قصر فهد بن علي',municipality:'Doha',category:'Historic House',period:'1953',lng:51.5288,lat:25.2934,summary:'Mid-20th-century palace near the Amiri Diwan.'},
  {id:'msheireb',name:'Msheireb Heritage Houses',ar:'بيوت مشيرب التراثية',municipality:'Doha',category:'Heritage District',period:'20th century',lng:51.5265,lat:25.2866,summary:'Restored heritage houses documenting domestic life, social change, education and the oil era.'},
  {id:'wakrah-souq',name:'Old Al Wakrah Heritage District',ar:'منطقة الوكرة التراثية',municipality:'Al Wakrah',category:'Heritage District',period:'19th–20th century',lng:51.6080,lat:25.1719,summary:'Historic coastal settlement area reflecting Al Wakrah’s fishing, pearling and trading past.'}
];

const categories=['All','Archaeological Site','Fort','Tower','Rock Art','Historic Village','Heritage District','Historic House','Archaeological Landscape'];

function baseStyle(theme, opacity){
  return {
    version:8,
    sources:{base:{type:'raster',tiles:['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],tileSize:256,attribution:'© OpenStreetMap contributors'}},
    layers:[{id:'base',type:'raster',source:'base',paint:{
      'raster-brightness-max':theme==='dark'?0.5:1,
      'raster-saturation':theme==='dark'?-0.82:0,
      'raster-contrast':theme==='dark'?0.18:0,
      'raster-opacity':opacity
    }}]
  };
}

const siteGeoJSON = sites => ({type:'FeatureCollection',features:sites.map(s=>({type:'Feature',properties:{id:s.id,name:s.name},geometry:{type:'Point',coordinates:[s.lng,s.lat]}}))});

function fitQatar(map,duration=0){
  map.resize();
  map.fitBounds(QATAR_BOUNDS,{padding:{top:38,bottom:38,left:70,right:70},duration,maxZoom:7.8});
}

function HeritageMap({sites,theme,mapOpacity,onSelect,onReady,selectedId}){
  const el=useRef(null);
  const mapRef=useRef(null);

  useEffect(()=>{
    const map=new maplibregl.Map({
      container:el.current,
      style:baseStyle(theme,mapOpacity),
      center:[51.18,25.35],
      zoom:6.4,
      minZoom:3.3,
      maxZoom:19,
      attributionControl:true
    });
    map.addControl(new maplibregl.NavigationControl({showCompass:false}),'bottom-right');
    mapRef.current=map;

    map.on('load',()=>{
      fitQatar(map,0);
      setTimeout(()=>fitQatar(map,0),220);
      map.addSource('heritage',{type:'geojson',data:siteGeoJSON(sites),cluster:true,clusterMaxZoom:11,clusterRadius:48});
      map.addLayer({id:'clusters',type:'circle',source:'heritage',filter:['has','point_count'],paint:{'circle-color':'#8a1538','circle-radius':['step',['get','point_count'],18,5,23,10,28],'circle-stroke-color':'#fff','circle-stroke-width':2}});
      map.addLayer({id:'cluster-count',type:'symbol',source:'heritage',filter:['has','point_count'],layout:{'text-field':['get','point_count_abbreviated'],'text-size':12},paint:{'text-color':'#fff'}});
      map.addLayer({id:'heritage-points',type:'circle',source:'heritage',filter:['!',['has','point_count']],paint:{'circle-radius':9,'circle-color':'#8a1538','circle-stroke-color':'#fff','circle-stroke-width':2.5}});
      map.addLayer({id:'heritage-labels',type:'symbol',source:'heritage',filter:['!',['has','point_count']],minzoom:8.5,layout:{'text-field':['get','name'],'text-size':10,'text-offset':[0,1.7],'text-anchor':'top'},paint:{'text-color':'#4a1730','text-halo-color':'#fff','text-halo-width':1.3}});
      map.on('click','heritage-points',e=>{const id=e.features?.[0]?.properties?.id;if(id)onSelect(id);});
      map.on('click','clusters',e=>{const f=e.features?.[0];if(!f)return;map.getSource('heritage').getClusterExpansionZoom(f.properties.cluster_id).then(z=>map.easeTo({center:f.geometry.coordinates,zoom:z}));});
      onReady(map);
    });

    const refit=()=>fitQatar(map,0);
    window.addEventListener('pageshow',refit);
    const ro=new ResizeObserver(()=>map.resize());
    ro.observe(el.current);
    return()=>{window.removeEventListener('pageshow',refit);ro.disconnect();map.remove();};
  },[]);

  useEffect(()=>{const m=mapRef.current,s=m?.getSource('heritage');if(s)s.setData(siteGeoJSON(sites));},[sites]);
  useEffect(()=>{const m=mapRef.current;if(!m?.getLayer('base'))return;m.setPaintProperty('base','raster-brightness-max',theme==='dark'?0.5:1);m.setPaintProperty('base','raster-saturation',theme==='dark'?-0.82:0);m.setPaintProperty('base','raster-contrast',theme==='dark'?0.18:0);},[theme]);
  useEffect(()=>{const m=mapRef.current;if(m?.getLayer('base'))m.setPaintProperty('base','raster-opacity',mapOpacity);},[mapOpacity]);
  useEffect(()=>{const m=mapRef.current;if(!m?.getLayer('heritage-points'))return;m.setPaintProperty('heritage-points','circle-color',['case',['==',['get','id'],selectedId||'__none__'],'#d6aa58','#8a1538']);},[selectedId]);

  return <div ref={el} className="maplibre-map"/>;
}

const photoCache=new Map();
async function fetchCommonsPhotos(site){
  if(photoCache.has(site.id))return photoCache.get(site.id);
  const q=`${site.name} Qatar`;
  const url=`https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(q)}&gsrnamespace=6&gsrlimit=10&prop=imageinfo&iiprop=url|mime&iiurlwidth=1000&format=json&origin=*`;
  try{
    const r=await fetch(url);const j=await r.json();
    const imgs=Object.values(j.query?.pages||{}).map(p=>p.imageinfo?.[0]).filter(x=>x&&/^image\/(jpeg|png|webp)$/i.test(x.mime||'')).map(x=>x.thumburl||x.url).filter(Boolean).slice(0,3);
    photoCache.set(site.id,imgs);return imgs;
  }catch{photoCache.set(site.id,[]);return[];}
}

function PhotoPopup({site,onClose}){
  const [images,setImages]=useState([]),[loading,setLoading]=useState(true),[active,setActive]=useState(0);
  useEffect(()=>{let ok=true;setLoading(true);setActive(0);fetchCommonsPhotos(site).then(v=>{if(ok){setImages(v);setLoading(false);}});return()=>{ok=false};},[site.id]);
  return <div className="photo-popup">
    <button className="photo-close" onClick={onClose}><X size={18}/></button>
    {loading?<div className="photo-loading">Loading place photos…</div>:images.length?<><img className="photo-main" src={images[active]} alt={site.name}/><div className="photo-thumbs">{images.map((src,i)=><button key={src} className={i===active?'active':''} onClick={()=>setActive(i)}><img src={src} alt={`${site.name} ${i+1}`}/></button>)}</div></>:<div className="photo-empty"><Images size={28}/><b>No verified Commons photos found</b><span>Official Ministry/Qatar Museums images can be added later.</span></div>}
    <div className="photo-caption"><span>{site.category}</span><h3>{site.name}</h3><p>{site.municipality} · {site.period}</p></div>
  </div>;
}

function HeaderLogo(){
  const [failed,setFailed]=useState(false);
  return <div className="brand-lockup">{failed?<div className="logo-fallback"><b>وزارة البلدية</b><span>Ministry of Municipality</span><small>State of Qatar</small></div>:<img src={LOGO_URL} alt="Ministry of Municipality - State of Qatar" onError={()=>setFailed(true)}/>}</div>;
}

function App(){
  const [theme,setTheme]=useState('light');
  const [mapOpacity,setMapOpacity]=useState(0.72);
  const [query,setQuery]=useState('');
  const [category,setCategory]=useState('All');
  const [selectedId,setSelectedId]=useState(null);
  const [photoSite,setPhotoSite]=useState(null);
  const mapObj=useRef(null);

  const filtered=useMemo(()=>heritageSites.filter(s=>(category==='All'||s.category===category)&&(!query||`${s.name} ${s.ar} ${s.municipality} ${s.category}`.toLowerCase().includes(query.toLowerCase()))),[query,category]);
  const selected=heritageSites.find(s=>s.id===selectedId)||null;

  const chooseSite=id=>{
    const s=heritageSites.find(x=>x.id===id);if(!s)return;
    setSelectedId(id);setPhotoSite(s);
    mapObj.current?.flyTo({center:[s.lng,s.lat],zoom:12,duration:900});
  };
  const resetQatar=()=>{setSelectedId(null);setPhotoSite(null);if(mapObj.current)fitQatar(mapObj.current,800);};

  return <div className={`app-shell theme-${theme}`}>
    <header className="topbar">
      <HeaderLogo/>
      <div className="title-lockup"><span>INTERACTIVE HERITAGE MAP</span><h1>Qatar Historical Places</h1></div>
      <div className="header-actions">
        <button className="theme-btn" onClick={()=>setTheme(v=>v==='light'?'dark':'light')}>{theme==='light'?<Moon size={16}/>:<Sun size={16}/>} {theme==='light'?'Dark':'Light'} mode</button>
        <div className="header-stat"><strong>{heritageSites.length}</strong><span>Historical places</span></div>
      </div>
    </header>

    <main className="heritage-grid">
      <aside className="heritage-sidebar">
        <div className="searchbox"><Search size={15}/><input placeholder="Search historical places…" value={query} onChange={e=>setQuery(e.target.value)}/>{query&&<button onClick={()=>setQuery('')}><X size={14}/></button>}</div>
        <div className="category-scroll">{categories.map(c=><button key={c} className={category===c?'active':''} onClick={()=>setCategory(c)}>{c}</button>)}</div>
        <div className="result-head"><span>{filtered.length} places</span><b>Across Qatar</b></div>
        <div className="site-list">{filtered.map(s=><button key={s.id} className={selectedId===s.id?'selected':''} onClick={()=>chooseSite(s.id)}><i><Landmark size={14}/></i><div><b>{s.name}</b><span>{s.municipality} · {s.category}</span></div></button>)}</div>
      </aside>

      <section className="map-panel">
        <HeritageMap sites={filtered} theme={theme} mapOpacity={mapOpacity} selectedId={selectedId} onSelect={chooseSite} onReady={m=>{mapObj.current=m;fitQatar(m,0)}}/>
        <div className="map-overlay-title"><span>QATAR HERITAGE MAP</span><strong>{filtered.length}</strong><em>visible places</em></div>
        <div className="map-switch"><button onClick={resetQatar}><LocateFixed size={15}/> Full Qatar</button></div>
        <div className="opacity-control"><div><Eye size={15}/><span>Map opacity</span><b>{Math.round(mapOpacity*100)}%</b></div><input aria-label="Map opacity" type="range" min="0.15" max="1" step="0.05" value={mapOpacity} onChange={e=>setMapOpacity(Number(e.target.value))}/></div>
        {photoSite&&<PhotoPopup site={photoSite} onClose={()=>setPhotoSite(null)}/>} 
      </section>

      <aside className="detail-panel">
        {selected?<><span className="detail-kicker">{selected.category}</span><h2>{selected.name}</h2><h3>{selected.ar}</h3><div className="detail-meta"><span><b>Municipality</b>{selected.municipality}</span><span><b>Period</b>{selected.period}</span></div><p>{selected.summary}</p><button className="locate-btn" onClick={()=>setPhotoSite(selected)}><Images size={15}/> View photos</button></>:<div className="detail-placeholder"><Landmark size={30}/><h2>Select a historical place</h2><p>Click a marker on the map to view its details and photos.</p></div>}
      </aside>
    </main>

    <footer className="site-footer">
      <div className="footer-copy">Ministry of Municipality · Qatar Heritage Map</div>
      <div className="footer-links">
        <a href="https://www.baladiya.gov.qa/" target="_blank" rel="noreferrer"><Globe2 size={15}/> Ministry Website <ExternalLink size={12}/></a>
        <a href="https://x.com/albaladiya" target="_blank" rel="noreferrer">X · @albaladiya <ExternalLink size={12}/></a>
        <a href="https://www.youtube.com/@albaladiya" target="_blank" rel="noreferrer"><Youtube size={15}/> YouTube <ExternalLink size={12}/></a>
      </div>
    </footer>
  </div>;
}

createRoot(document.getElementById('root')).render(<App/>);
