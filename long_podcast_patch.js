window.applyLongPodcastPatch=function(h){
try{
if(h.includes('function enrichLongPodcastsOnly('))return h;
const add=`// 播客目录：N1/N2/N3/N4 各 100 篇；N5/生活保留现有 8 篇。前 8 篇文本保持不变以继续命中旧 MP3。\nfunction enrichLongPodcastsOnly(){\n try{\n  if(!window.JLPTPodcastCatalog||typeof JLPTPodcastCatalog.build!=='function')return;\n  const made=JLPTPodcastCatalog.build({P,R,V_BASE,G_CORE,L});\n  if(made&&made.length)P.splice(0,P.length,...made);\n }catch(e){console.warn('podcast catalog',e)}\n}\nenrichLongPodcastsOnly();\n`;
if(h.includes('// 播客'))h=h.replace('// 播客',add+'// 播客');
h=h.replace('播客不出题，只负责长一点的自然输入和跟读。','播客不出题；N1 / N2 / N3 / N4 各 100 篇，支持分类、分页、已听记录、平假名、中文和本站 MP3。');
h=h.replace('播客不出题，改成长篇自然输入；每个等级提供多篇长篇，适合连续播放和后台听。','播客不出题；N1 / N2 / N3 / N4 各 100 篇，支持分类、分页、已听记录、平假名、中文和本站 MP3。');
h=h.replace('播客不出题；每个等级 8 篇，统一使用本站真实 MP3，支持后台播放、平假名和中文。','播客不出题；N1 / N2 / N3 / N4 各 100 篇，支持分类、分页、已听记录、平假名、中文和本站 MP3。');
h=h.replace(/语感训练・无题/g,'真实 MP3 长篇语感训练・无题');
const oldPlay="$ ('pp')";
if(h.includes("$('pp').onclick=()=>sp(cp[2],.86);"))h=h.replace("$('pp').onclick=()=>sp(cp[2],.86);","$('pp').onclick=()=>{if(typeof playBackgroundJapanese==='function')playBackgroundJapanese(cp[2],.86,cp[1],true);else sp(cp[2],.86)};");
const oldReveal="$('pr').onclick=()=>$('pa').classList.toggle('show');";
const newReveal=`function bindPodcastTranslationButton(){try{const b=document.getElementById('pr'),a=document.getElementById('pa');if(!b||!a)return;b.type='button';b.onclick=function(ev){if(ev)ev.preventDefault();const open=window.getComputedStyle(a).display!=='none';a.classList.toggle('show',!open);a.style.display=open?'none':'block';b.textContent=open?'平假名＋中文':'🙈 隐藏平假名＋中文';};}catch(e){}}bindPodcastTranslationButton();`;
if(h.includes(oldReveal))h=h.replace(oldReveal,newReveal);
else if(h.includes('// 阅读'))h=h.replace('// 阅读',newReveal+'// 阅读');
return h;
}catch(e){return h}
};
