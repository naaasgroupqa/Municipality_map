import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Play, Pause, RotateCcw, Search, Landmark, Map as MapIcon, Moon, LocateFixed, Route, Layers3, X, Images } from 'lucide-react';
import './styles.css';

const LOGO_URL = '/ministry-logo.png?v=20260906b';
const QATAR_BOUNDS = [[50.68,24.45],[51.68,26.22]];

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

const roadMilestones=[
{year:1939,name:'Doha–Dukhan oil-era road',coords:[[51.531,25.285],[51.425,25.292],[51.23,25.35],[50.79,25.43]]},
{year:1948,name:'Dukhan–Umm Bab–Mesaieed industrial corridor',coords:[[50.79,25.43],[50.81,25.21],[51.10,25.08],[51.55,24.99]]},
{year:1970,name:'Salwa regional corridor',coords:[[51.49,25.27],[51.34,25.19],[51.10,25.03],[50.84,24.75]]},
{year:2012,name:'North Road enhancement',coords:[[51.45,25.33],[51.40,25.42],[51.38,25.62],[51.30,25.88],[51.20,26.10]]},
{year:2017,name:'Modern expressway programme',coords:[[51.58,25.12],[51.45,25.15],[51.30,25.20],[51.19,25.29],[51.22,25.38]]}
];
const categories=['All','Archaeological Site','Fort','Tower','Rock Art','Historic Village','Heritage District','Historic House','Archaeological Landscape'];

function baseStyle(mode){return {version:8,sources:{base:{type:'raster',tiles:['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],tileSize:256,attribution:'© OpenStreetMap contributors'}},layers:[{id:'base',type:'raster',source:'base',paint:{'raster-brightness-max':mode==='dark'?0.46:1,'raster-saturation':mode==='dark'?-0.85:0,'raster-contrast':mode==='dark'?0.22:0}}]};}
const siteGeoJSON=sites=>({type:'FeatureCollection',features:sites.map(s=>({type:'Feature',properties:{id:s.id,name:s.name},geometry:{type:'Point',coordinates:[s.lng,s.lat]}}))});
const roadsGeoJSON=year=>({type:'FeatureCollection',features:roadMilestones.filter(r=>r.year<=year).map(r=>({type:'Feature',properties:{year:r.year,name:r.name},geometry:{type:'LineString',coordinates:r.coords}}))});
const emptyPoint=()=>({type:'FeatureCollection',features:[]});
const pointGeoJSON=coord=>({type:'FeatureCollection',features:coord?[{type:'Feature',properties:{},geometry:{type:'Point',coordinates:coord}}]:[]});
function pointAlongRoute(coords,t){if(!coords?.length)return null;const seg=[];let total=0;for(let i=0;i<coords.length-1;i++){const a=coords[i],b=coords[i+1],d=Math.hypot((b[0]-a[0])*Math.cos((a[1]+b[1])*Math.PI/360),b[1]-a[1]);seg.push(d);total+=d;}let target=(t%1)*total;for(let i=0;i<seg.length;i++){if(target<=seg[i]){const f=seg[i]?target/seg[i]:0;return [coords[i][0]+(coords[i+1][0]-coords[i][0])*f,coords[i][1]+(coords[i+1][1]-coords[i][1])*f];}target-=seg[i];}return coords.at(-1);}
function fitQatar(map,duration=0){map.resize();map.fitBounds(QATAR_BOUNDS,{padding:{top:26,bottom:26,left:26,right:26},duration,maxZoom:8.15});}

function HeritageMap({sites,year,mode,showRoads,onSelect,onReady,selectedId}){
 const el=useRef(null),mapRef=useRef(null),rafRef=useRef(null),stateRef=useRef({year,showRoads});
 useEffect(()=>{stateRef.current={year,showRoads};},[year,showRoads]);
 useEffect(()=>{
  const map=new maplibregl.Map({container:el.current,style:baseStyle(mode),center:[51.18,25.35],zoom:6.6,minZoom:4,maxZoom:19,attributionControl:true});
  map.addControl(new maplibregl.NavigationControl({showCompass:false}),'bottom-right');mapRef.current=map;
  map.on('load',()=>{
   fitQatar(map,0);setTimeout(()=>fitQatar(map,0),180);
   map.addSource('heritage',{type:'geojson',data:siteGeoJSON(sites),cluster:true,clusterMaxZoom:11,clusterRadius:48});
   map.addLayer({id:'clusters',type:'circle',source:'heritage',filter:['has','point_count'],paint:{'circle-color':'#8a1538','circle-radius':['step',['get','point_count'],18,5,23,10,28],'circle-stroke-color':'#fff','circle-stroke-width':2}});
   map.addLayer({id:'cluster-count',type:'symbol',source:'heritage',filter:['has','point_count'],layout:{'text-field':['get','point_count_abbreviated'],'text-size':12},paint:{'text-color':'#fff'}});
   map.addLayer({id:'heritage-points',type:'circle',source:'heritage',filter:['!',['has','point_count']],paint:{'circle-radius':9,'circle-color':'#8a1538','circle-stroke-color':'#fff','circle-stroke-width':2.5}});
   map.addLayer({id:'heritage-labels',type:'symbol',source:'heritage',filter:['!',['has','point_count']],minzoom:8.5,layout:{'text-field':['get','name'],'text-size':10,'text-offset':[0,1.7],'text-anchor':'top'},paint:{'text-color':'#4a1730','text-halo-color':'#fff','text-halo-width':1.3}});
   map.addSource('roads',{type:'geojson',data:roadsGeoJSON(year)});
   map.addLayer({id:'roads-history-glow',type:'line',source:'roads',layout:{visibility:showRoads?'visible':'none'},paint:{'line-color':'#b31649','line-width':8,'line-opacity':0.12}});
   map.addLayer({id:'roads-history',type:'line',source:'roads',layout:{visibility:showRoads?'visible':'none'},paint:{'line-color':['case',['<',['get','year'],2000],'#d3a65d','#8a1538'],'line-width':3.2,'line-opacity':0.72}});
   map.addSource('gps',{type:'geojson',data:emptyPoint()});
   map.addLayer({id:'gps-halo',type:'circle',source:'gps',layout:{visibility:showRoads?'visible':'none'},paint:{'circle-radius':13,'circle-color':'#fff','circle-opacity':0.18,'circle-blur':0.3}});
   map.addLayer({id:'gps-core',type:'circle',source:'gps',layout:{visibility:showRoads?'visible':'none'},paint:{'circle-radius':5,'circle-color':'#fff','circle-stroke-color':'#8a1538','circle-stroke-width':3}});
   map.on('click','heritage-points',e=>{const id=e.features?.[0]?.properties?.id;if(id)onSelect(id);});
   map.on('click','clusters',e=>{const f=e.features?.[0];if(!f)return;map.getSource('heritage').getClusterExpansionZoom(f.properties.cluster_id).then(z=>map.easeTo({center:f.geometry.coordinates,zoom:z}));});
   const started=performance.now();const animate=now=>{const {year:y,showRoads:v}=stateRef.current,active=roadMilestones.filter(r=>r.year<=y).at(-1),src=map.getSource('gps');if(src)src.setData(v&&active?pointGeoJSON(pointAlongRoute(active.coords,((now-started)%5200)/5200)):emptyPoint());rafRef.current=requestAnimationFrame(animate);};rafRef.current=requestAnimationFrame(animate);
   onReady(map);
  });
  const refit=()=>fitQatar(map,0);window.addEventListener('pageshow',refit);window.addEventListener('load',refit);
  const ro=new ResizeObserver(()=>map.resize());ro.observe(el.current);
  return()=>{window.removeEventListener('pageshow',refit);window.removeEventListener('load',refit);ro.disconnect();if(rafRef.current)cancelAnimationFrame(rafRef.current);map.remove();};
 },[]);
 useEffect(()=>{const m=mapRef.current,s=m?.getSource('heritage');if(s)s.setData(siteGeoJSON(sites));},[sites]);
 useEffect(()=>{const m=mapRef.current,s=m?.getSource('roads');if(s)s.setData(roadsGeoJSON(year));},[year]);
 useEffect(()=>{const m=mapRef.current;if(!m)return;['roads-history-glow','roads-history','gps-halo','gps-core'].forEach(id=>m.getLayer(id)&&m.setLayoutProperty(id,'visibility',showRoads?'visible':'none'));},[showRoads]);
 useEffect(()=>{const m=mapRef.current;if(!m?.getLayer('base'))return;m.setPaintProperty('base','raster-brightness-max',mode==='dark'?0.46:1);m.setPaintProperty('base','raster-saturation',mode==='dark'?-0.85:0);m.setPaintProperty('base','raster-contrast',mode==='dark'?0.22:0);},[mode]);
 useEffect(()=>{const m=mapRef.current;if(!m?.getLayer('heritage-points'))return;m.setPaintProperty('heritage-points','circle-color',['case',['==',['get','id'],selectedId||'__none__'],'#d6aa58','#8a1538']);},[selectedId]);
 return <div ref={el} className="maplibre-map"/>;
}

const photoCache=new Map();
async function fetchCommonsPhotos(site){if(photoCache.has(site.id))return photoCache.get(site.id);const q=`${site.name} Qatar`;const url=`https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(q)}&gsrnamespace=6&gsrlimit=10&prop=imageinfo&iiprop=url|mime&iiurlwidth=1000&format=json&origin=*`;try{const r=await fetch(url);const j=await r.json();const imgs=Object.values(j.query?.pages||{}).map(p=>p.imageinfo?.[0]).filter(x=>x&&/^image\/(jpeg|png|webp)$/i.test(x.mime||'')).map(x=>x.thumburl||x.url).filter(Boolean).slice(0,3);photoCache.set(site.id,imgs);return imgs;}catch{photoCache.set(site.id,[]);return[];}}
function PhotoPopup({site,onClose}){const [images,setImages]=useState([]),[loading,setLoading]=useState(true),[active,setActive]=useState(0);useEffect(()=>{let ok=true;setLoading(true);setActive(0);fetchCommonsPhotos(site).then(v=>{if(ok){setImages(v);setLoading(false);}});return()=>{ok=false};},[site.id]);return <div className="photo-popup"><button className="photo-close" onClick={onClose}><X size={18}/></button>{loading?<div className="photo-loading">Loading place photos…</div>:images.length?<><img className="photo-main" src={images[active]} alt={site.name}/><div className="photo-thumbs">{images.map((src,i)=><button key={src} className={i===active?'active':''} onClick={()=>setActive(i)}><img src={src} alt={`${site.name} ${i+1}`}/></button>)}</div></>:<div className="photo-empty"><Images size={28}/><b>No verified Commons photos found</b><span>We can add official Ministry/Qatar Museums images later.</span></div>}<div className="photo-caption"><span>{site.category}</span><h3>{site.name}</h3><p>{site.municipality} · {site.period}</p><small>Photos: Wikimedia Commons search results for this place</small></div></div>}

function App(){
 const [year,setYear]=useState(2026),[playing,setPlaying]=useState(false),[mode,setMode]=useState('road'),[showRoads,setShowRoads]=useState(true),[query,setQuery]=useState(''),[category,setCategory]=useState('All'),[selectedId,setSelectedId]=useState(null),[photoSite,setPhotoSite]=useState(null);const mapObj=useRef(null);
 const filtered=useMemo(()=>heritageSites.filter(s=>(category==='All'||s.category===category)&&(!query||`${s.name} ${s.ar} ${s.municipality} ${s.category}`.toLowerCase().includes(query.toLowerCase()))),[query,category]);
 const selected=heritageSites.find(s=>s.id===selectedId)||null;
 useEffect(()=>{if(!playing)return;const t=setInterval(()=>setYear(v=>v>=2026?(setPlaying(false),2026):v+1),120);return()=>clearInterval(t)},[playing]);
 const chooseSite=id=>{const s=heritageSites.find(x=>x.id===id);if(!s)return;setSelectedId(id);setPhotoSite(s);mapObj.current?.flyTo({center:[s.lng,s.lat],zoom:12,duration:900});};
 const resetQatar=()=>{setSelectedId(null);setPhotoSite(null);const m=mapObj.current;if(m)fitQatar(m,900);};
 return <div className="app-shell heritage-app">
  <header className="topbar"><div className="brand-lockup"><img src={LOGO_URL} alt="Ministry of Municipality - State of Qatar"/></div><div className="title-lockup"><span>INTERACTIVE HERITAGE & URBAN HISTORY</span><h1>Qatar Historical Places <b>& Development Timeline</b></h1></div><div className="header-stat"><strong>{heritageSites.length}</strong><span>Historical places</span></div></header>
  <main className="heritage-grid">
   <aside className="heritage-sidebar"><div className="searchbox"><Search size={15}/><input placeholder="Search historical places…" value={query} onChange={e=>setQuery(e.target.value)}/>{query&&<button onClick={()=>setQuery('')}><X size={14}/></button>}</div><div className="category-scroll">{categories.map(c=><button key={c} className={category===c?'active':''} onClick={()=>setCategory(c)}>{c}</button>)}</div><div className="result-head"><span>{filtered.length} places</span><b>Across Qatar</b></div><div className="site-list">{filtered.map(s=><button key={s.id} className={selectedId===s.id?'selected':''} onClick={()=>chooseSite(s.id)}><i><Landmark size={14}/></i><div><b>{s.name}</b><span>{s.municipality} · {s.category}</span></div></button>)}</div></aside>
   <section className="map-panel"><HeritageMap sites={filtered} year={year} mode={mode} showRoads={showRoads} selectedId={selectedId} onSelect={chooseSite} onReady={m=>{mapObj.current=m;fitQatar(m,0)}}/><div className="map-overlay-title"><span>QATAR HERITAGE MAP</span><strong>{filtered.length}</strong><em>visible places</em></div><div className="map-switch"><button className={mode==='road'?'active':''} onClick={()=>setMode('road')}><MapIcon size={15}/> Map</button><button className={mode==='dark'?'active':''} onClick={()=>setMode('dark')}><Moon size={15}/> Presentation</button><button className={showRoads?'active':''} onClick={()=>setShowRoads(v=>!v)}><Route size={15}/> Road history</button><button onClick={resetQatar}><LocateFixed size={15}/> Full Qatar</button></div><div className="map-help"><Layers3 size={13}/> Click any heritage dot to open a 3-photo place preview.</div>{photoSite&&<PhotoPopup site={photoSite} onClose={()=>setPhotoSite(null)}/>}</section>
   <aside className="detail-panel">{selected?<><span className="detail-kicker">{selected.category}</span><h2>{selected.name}</h2><h3>{selected.ar}</h3><div className="detail-meta"><span><b>Municipality</b>{selected.municipality}</span><span><b>Period</b>{selected.period}</span></div><p>{selected.summary}</p><button className="locate-btn" onClick={()=>chooseSite(selected.id)}><Images size={15}/> View photos</button></>:<div className="detail-placeholder"><Landmark size={30}/><h2>Select a historical place</h2><p>Click a marker on the map to view its details and photos.</p></div>}<div className="detail-note">The photo preview searches Wikimedia Commons for images matching each place. Official archive images can be substituted later.</div></aside>
  </main>
  <footer className="timeline-dock heritage-timeline"><button className="play" onClick={()=>setPlaying(v=>!v)}>{playing?<Pause size={19}/>:<Play size={19} fill="currentColor"/>}</button><button className="reset" onClick={()=>{setPlaying(false);setYear(1939)}}><RotateCcw size={16}/></button><div className="slider"><div className="edge"><span>1939</span><span>2026</span></div><input type="range" min="1939" max="2026" value={year} onChange={e=>{setPlaying(false);setYear(Number(e.target.value))}} style={{'--p':`${((year-1939)/87)*100}%`}}/></div><div className="phase"><span>ROAD DEVELOPMENT YEAR</span><b>{year}</b></div></footer>
 </div>;
}
createRoot(document.getElementById('root')).render(<App/>);
