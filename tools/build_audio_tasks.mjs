import fs from 'fs';
import zlib from 'zlib';
import vm from 'vm';
const parts=['s0.txt','s1.txt','s2.txt','s3.txt','s4.txt'].map(f=>fs.readFileSync(f,'utf8').trim()).join('');
const html=zlib.gunzipSync(Buffer.from(parts,'base64')).toString('utf8');
for(const f of ['podcast_themes_1.js','podcast_themes_2.js','podcast_themes_3.js','podcast_catalog.js']){
  vm.runInThisContext(fs.readFileSync(f,'utf8'),{filename:f});
}

function extractArray(name){
  const re=new RegExp('(?:const|let|var)\\s+'+name+'\\s*=\\s*');
  const m=re.exec(html); if(!m) throw new Error('Missing array '+name);
  let i=html.indexOf('[',m.index+m[0].length), depth=0, quote='', esc=false, end=-1;
  for(;i<html.length;i++){
    const c=html[i];
    if(quote){ if(esc){esc=false;continue} if(c==='\\'){esc=true;continue} if(c===quote)quote=''; continue; }
    if(c==='"'||c==="'"||c==='`'){quote=c;continue}
    if(c==='[')depth++; else if(c===']'){depth--; if(depth===0){end=i;break}}
  }
  if(end<0) throw new Error('Unclosed array '+name);
  return vm.runInNewContext('('+html.slice(html.indexOf('[',m.index+m[0].length),end+1)+')',{});
}

const L=extractArray('L');
const P=extractArray('P');
const R=extractArray('R');
const V_BASE=extractArray('V_BASE');
const G_CORE=extractArray('G_CORE');

function fnv1a(s){let h=0x811c9dc5;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,0x01000193)}return (h>>>0).toString(16).padStart(8,'0')}

const tasks=[];
function add(kind,level,title,text,category=''){
  text=String(text||'').trim(); if(!text)return;
  const hash=fnv1a(text), file=`audio/${kind}-${hash}.mp3`;
  const url=`https://cdn.jsdelivr.net/gh/wangjie20051109-cmyk/jlpt-study-hub@main/${file}`;
  if(!tasks.some(x=>x.hash===hash))tasks.push({hash,kind,level,title,category,text,file,url});
}

for(const x of L){ if(Array.isArray(x)) add('listening',x[0]||'',x[1]||'听力',x[2]||'',x[1]||''); }

if(!globalThis.JLPTPodcastCatalog)throw new Error('Missing JLPTPodcastCatalog');
const catalog=globalThis.JLPTPodcastCatalog.build({P,R,V_BASE,G_CORE,L});
for(const x of catalog){
  if(Array.isArray(x))add('podcast',x[0]||'',x[1]||'播客',x[2]||'',x[6]||'综合');
}

fs.mkdirSync('audio',{recursive:true});
fs.writeFileSync('audio_tasks.json',JSON.stringify(tasks,null,2));
const manifest=Object.fromEntries(tasks.map(x=>[x.hash,x.url]));
const meta=Object.fromEntries(tasks.map(x=>[x.hash,{kind:x.kind,level:x.level,title:x.title,category:x.category}]));
fs.writeFileSync('audio_manifest.js','window.STATIC_AUDIO_MANIFEST='+JSON.stringify(manifest)+';\nwindow.STATIC_AUDIO_META='+JSON.stringify(meta)+';\n');

const counts={};
for(const x of catalog)counts[x[0]]=(counts[x[0]]||0)+1;
console.log('Podcast catalog counts:',counts);
console.log(`Prepared ${tasks.length} static audio tasks (${L.length} listening entries + ${catalog.length} podcast entries).`);
