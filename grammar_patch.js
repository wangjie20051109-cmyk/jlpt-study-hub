window.applyJlptPatch=function(h){
h=h.replace('✅ 单词库已接入 N5→N1 完整分级词表（共 8,000+ 词）＋语法学习＋10,000 道刷题中心。按等级加载，支持搜索、已浏览记录和核心精讲优先。','✅ 单词库已接入 N5→N1 完整分级词表（8,000+ 词）＋N5→N1 完整分级语法库＋10,000 道刷题中心。');
const add=`// 完整分级语法库：加载 OpenJLPT N5～N1 语法并与核心精讲去重合并
const GLOADED=new Set();
function gNorm(p=''){return String(p).replace(/[～〜\\s・\\/（）()]/g,'').toLowerCase()}
function gOpenRow(r,lv){if(!r||r.length<5)return null;let p=(r[0]||'').trim(),l=(r[1]||lv).trim();if(!p||!/^N[1-5]$/.test(l))return null;return[l,p,(r[2]||'—').trim(),(r[3]||'—').trim(),(r[4]||p).trim(),'',(r[5]||'').trim(),'开放分级语法；'+(r[6]||''),'openjlpt']}
async function loadGrammar(lv){if(GLOADED.has(lv))return;let urls=[OPENJLPT_BASE+'grammar-'+lv.toLowerCase()+'.csv',OPENJLPT_RAW+'grammar-'+lv.toLowerCase()+'.csv'];for(const url of urls){try{let res=await fetch(url,{mode:'cors',cache:'force-cache'});if(!res.ok)throw 0;let rows=csvParse(await res.text()),hd=rows[0].map(x=>x.trim().toLowerCase()),ix=n=>hd.indexOf(n),data=rows.slice(1).map(r=>gOpenRow([r[ix('pattern')],r[ix('level')],r[ix('meaning')],r[ix('formation')],r[ix('example_ja')],r[ix('example_en')],r[ix('tags')]],lv)).filter(Boolean);let seen=new Set(G.map(x=>x[0]+'|'+gNorm(x[1])));for(const x of data){let k=x[0]+'|'+gNorm(x[1]);if(!seen.has(k)){seen.add(k);G.push(x)}}GLOADED.add(lv);if(typeof grender==='function'&&$('glev').value===lv)grender();return}catch(e){}}}
setTimeout(()=>['N5','N4','N3','N2','N1'].forEach((lv,i)=>setTimeout(()=>loadGrammar(lv),i*350)),500);
`;
h=h.replace('// 语法学习',add+'// 语法学习');
h=h.replace("$('gzh').textContent='中文：'+x[2]","$('gzh').textContent=(x[8]==='openjlpt'?'英文原义：':'中文：')+x[2]");
h=h.replace("$('gexk').textContent='平假名：'+x[5]","$('gexk').textContent=x[5]?'平假名：'+x[5]:(x[8]==='openjlpt'?'平假名：待补充':'')");
h=h.replace("$('gexz').textContent='中文：'+x[6]","$('gexz').textContent=(x[8]==='openjlpt'?'英文例句：':'中文：')+x[6]");
h=h.replace('完整词库约 10,600 词','完整词库约 8,334 词');
return h};