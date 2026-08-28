window.applyLongPodcastPatch=function(h){
try{
if(h.includes('function enrichLongPodcastsOnly('))return h;
const add=`// 独立长播客：保留原 3 篇 MP3 文本不变，再追加 5 篇，避免 hash 变化导致 MP3 失效\nfunction enrichLongPodcastsOnly(){\n try{\n  let old=[...P],levels=['N5','N4','N3','N2','N1','生活'],made=[],EPISODES=8;\n  for(const lv of levels){\n   let base=old.find(x=>x[0]===lv);if(!base)continue;\n   let chunks=[[base[2],base[3],base[4]]];\n   if(lv!=='生活'){\n    for(const x of R.filter(x=>x[0]===lv))chunks.push([x[3],x[4],x[5]]);\n    for(const x of V_BASE.filter(x=>x[0]===lv))chunks.push([x[6],x[7],x[8]]);\n    for(const x of G_CORE.filter(x=>x[0]===lv))chunks.push([x[4],x[5],x[6]]);\n    for(const x of L.filter(x=>x[0]===lv))chunks.push([x[2],x[3],x[4]]);\n   }else{\n    for(const x of L.filter(x=>x[0]==='生活'))chunks.push([x[2],x[3],x[4]]);\n    for(const x of V_BASE.slice(0,40))chunks.push([x[6],x[7],x[8]]);\n   }\n   chunks=chunks.filter(c=>c&&c[0]);if(!chunks.length)continue;\n   const pushEpisode=(g,idx)=>{\n    if(!g.length)return;\n    let head=(idx===0?base[1]:'総合入力')+'・长播客 '+(idx+1)+' / '+EPISODES;\n    let jp='今日は、自然な日本語を長く聞く練習をします。\\n\\n'+g.map((c,n)=>'【場面'+(n+1)+'】 '+c[0]).join('\\n\\n');\n    let ka='きょうは、しぜんな にほんごを ながく きく れんしゅうを します。\\n\\n'+g.map((c,n)=>'【ばめん'+(n+1)+'】 '+(c[1]||'')).join('\\n\\n');\n    let zh='今天进行长时间自然日语输入训练。\\n\\n'+g.map((c,n)=>'【场景'+(n+1)+'】 '+(c[2]||'')).join('\\n\\n');\n    made.push([lv,head,jp,ka,zh,'真实 MP3 长播客｜第 '+(idx+1)+' 篇 / 共 '+EPISODES+' 篇｜无题｜可后台连续听']);\n   };\n   // 前 3 篇严格沿用旧版切分，现有 MP3 可立即继续命中\n   let oldSize=Math.max(1,Math.ceil(chunks.length/3));\n   for(let gi=0;gi<3;gi++)pushEpisode(chunks.slice(gi*oldSize,(gi+1)*oldSize),gi);\n   // 新增 5 篇使用另一组切分，生成新的静态 MP3\n   let extraSize=Math.min(chunks.length,Math.max(12,Math.ceil(chunks.length/5)));\n   for(let ei=0;ei<5;ei++){\n    let start=Math.floor(ei*chunks.length/5),g=[];\n    for(let k=0;k<extraSize;k++)g.push(chunks[(start+k)%chunks.length]);\n    pushEpisode(g,ei+3);\n   }\n  }\n  if(made.length)P.splice(0,P.length,...made);\n }catch(e){}\n}\nenrichLongPodcastsOnly();\n`;
if(h.includes('// 播客'))h=h.replace('// 播客',add+'// 播客');
h=h.replace('播客不出题，只负责长一点的自然输入和跟读。','播客不出题；每个等级 8 篇，统一使用本站真实 MP3，支持后台播放、平假名和中文。');
h=h.replace('播客不出题，改成长篇自然输入；每个等级提供多篇长篇，适合连续播放和后台听。','播客不出题；每个等级 8 篇，统一使用本站真实 MP3，支持后台播放、平假名和中文。');
h=h.replace(/语感训练・无题/g,'真实 MP3 长篇语感训练・无题');
const oldPlay="$ ('pp')";
h=h.replace("$('pp').onclick=()=>sp(cp[2],.86);","$('pp').onclick=()=>{if(typeof playBackgroundJapanese==='function')playBackgroundJapanese(cp[2],.86,cp[1],true);else sp(cp[2],.86)};");
const oldReveal="$('pr').onclick=()=>$('pa').classList.toggle('show');";
const newReveal=`function bindPodcastTranslationButton(){try{const b=document.getElementById('pr'),a=document.getElementById('pa');if(!b||!a)return;b.type='button';b.onclick=function(ev){if(ev)ev.preventDefault();const open=window.getComputedStyle(a).display!=='none';a.classList.toggle('show',!open);a.style.display=open?'none':'block';b.textContent=open?'平假名＋中文':'🙈 隐藏平假名＋中文';};}catch(e){}}bindPodcastTranslationButton();`;
if(h.includes(oldReveal))h=h.replace(oldReveal,newReveal);
else if(h.includes('// 阅读'))h=h.replace('// 阅读',newReveal+'// 阅读');
return h;
}catch(e){return h}
};
