import fs from 'fs';
import zlib from 'zlib';
import vm from 'vm';
import crypto from 'crypto';

const parts=['s0.txt','s1.txt','s2.txt','s3.txt','s4.txt'].map(f=>fs.readFileSync(f,'utf8').trim()).join('');
const html=zlib.gunzipSync(Buffer.from(parts,'base64')).toString('utf8');

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
function add(kind,level,title,text){
  text=String(text||'').trim(); if(!text)return;
  const hash=fnv1a(text), file=`audio/${kind}-${hash}.mp3`;
  if(!tasks.some(x=>x.hash===hash))tasks.push({hash,kind,level,title,text,file});
}

for(const x of L){ if(Array.isArray(x)) add('listening',x[0]||'',x[1]||'听力',x[2]||''); }

const levels=['N5','N4','N3','N2','N1','生活'];
const EPISODES=8;
for(const lv of levels){
  const base=P.find(x=>x[0]===lv); if(!base)continue;
  let chunks=[[base[2],base[3],base[4]]];
  if(lv!=='生活'){
    for(const x of R.filter(x=>x[0]===lv))chunks.push([x[3],x[4],x[5]]);
    for(const x of V_BASE.filter(x=>x[0]===lv))chunks.push([x[6],x[7],x[8]]);
    for(const x of G_CORE.filter(x=>x[0]===lv))chunks.push([x[4],x[5],x[6]]);
    for(const x of L.filter(x=>x[0]===lv))chunks.push([x[2],x[3],x[4]]);
  }else{
    for(const x of L.filter(x=>x[0]==='生活'))chunks.push([x[2],x[3],x[4]]);
    for(const x of V_BASE.slice(0,80))chunks.push([x[6],x[7],x[8]]);
  }
  chunks=chunks.filter(c=>c&&c[0]);
  if(!chunks.length)continue;
  const windowSize=Math.min(chunks.length,Math.max(18,Math.ceil(chunks.length/3)));
  for(let gi=0;gi<EPISODES;gi++){
    const start=Math.floor(gi*chunks.length/EPISODES),g=[];
    for(let k=0;k<windowSize;k++)g.push(chunks[(start+k)%chunks.length]);
    const head=(gi===0?base[1]:'総合入力')+`・长播客 ${gi+1} / ${EPISODES}`;
    const jp='今日は、自然な日本語を長く聞く練習をします。\n\n'+g.map((c,n)=>`【場面${n+1}】 ${c[0]}`).join('\n\n');
    add('podcast',lv,head,jp);
  }
}

fs.mkdirSync('audio',{recursive:true});
fs.writeFileSync('audio_tasks.json',JSON.stringify(tasks,null,2));
const manifest=Object.fromEntries(tasks.map(x=>[x.hash,x.file]));
const meta=Object.fromEntries(tasks.map(x=>[x.hash,{kind:x.kind,level:x.level,title:x.title}]));
fs.writeFileSync('audio_manifest.js','window.STATIC_AUDIO_MANIFEST='+JSON.stringify(manifest)+';\nwindow.STATIC_AUDIO_META='+JSON.stringify(meta)+';\n');
console.log(`Prepared ${tasks.length} static audio tasks (${L.length} listening entries, ${EPISODES} podcasts per level).`);
