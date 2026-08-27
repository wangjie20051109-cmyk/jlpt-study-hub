window.applyLongPodcastPatch=function(h){
try{
if(h.includes('function enrichLongPodcastsOnly('))return h;
const add=`// 独立长播客：只扩充播客数据，不修改单词/语法渲染\nfunction enrichLongPodcastsOnly(){\n try{\n  let old=[...P],levels=['N5','N4','N3','N2','N1','生活'],made=[];\n  for(const lv of levels){\n   let base=old.find(x=>x[0]===lv);if(!base)continue;\n   let chunks=[[base[2],base[3],base[4]]];\n   if(lv!=='生活'){\n    for(const x of R.filter(x=>x[0]===lv))chunks.push([x[3],x[4],x[5]]);\n    for(const x of V_BASE.filter(x=>x[0]===lv))chunks.push([x[6],x[7],x[8]]);\n    for(const x of G_CORE.filter(x=>x[0]===lv))chunks.push([x[4],x[5],x[6]]);\n    for(const x of L.filter(x=>x[0]===lv))chunks.push([x[2],x[3],x[4]]);\n   }else{\n    for(const x of L.filter(x=>x[0]==='生活'))chunks.push([x[2],x[3],x[4]]);\n    for(const x of V_BASE.slice(0,40))chunks.push([x[6],x[7],x[8]]);\n   }\n   chunks=chunks.filter(c=>c&&c[0]);\n   let size=Math.max(1,Math.ceil(chunks.length/3));\n   for(let gi=0;gi<3;gi++){\n    let g=chunks.slice(gi*size,(gi+1)*size);if(!g.length)continue;\n    let head=(gi===0?base[1]:'総合入力')+'・長篇'+(gi+1);\n    let jp='今日は、自然な日本語を長く聞く練習をします。\\n\\n'+g.map((c,n)=>'【場面'+(n+1)+'】 '+c[0]).join('\\n\\n');\n    let ka='きょうは、しぜんな にほんごを ながく きく れんしゅうを します。\\n\\n'+g.map((c,n)=>'【ばめん'+(n+1)+'】 '+(c[1]||'')).join('\\n\\n');\n    let zh='今天进行长时间自然日语输入训练。\\n\\n'+g.map((c,n)=>'【场景'+(n+1)+'】 '+(c[2]||'')).join('\\n\\n');\n    made.push([lv,head,jp,ka,zh,'长篇自然输入｜无题｜适合后台连续听、跟读和熟悉语感']);\n   }\n  }\n  if(made.length)P.splice(0,P.length,...made);\n }catch(e){}\n}\nenrichLongPodcastsOnly();\n`;
if(h.includes('// 播客'))h=h.replace('// 播客',add+'// 播客');
h=h.replace('播客不出题，只负责长一点的自然输入和跟读。','播客不出题，改成长篇自然输入；每个等级提供多篇长篇，适合连续播放和后台听。');
h=h.replace(/语感训练・无题/g,'长篇语感训练・无题');
return h;
}catch(e){return h}
};
