window.applyVocabDailyShufflePatch=function(h){
  try{
    // 每个 JLPT 等级每天生成一个稳定随机顺序：当天刷新不乱跳，第二天自动换一批开头词。
    const marker="function vrender(){";
    if(!h.includes(marker)) return h;
    const helper=`function vDailyShuffle(a,lv){try{if(!Array.isArray(a)||a.length<2)return a;const d=new Date(),day=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'),key='jlpt_vocab_daily_order_v1|'+lv+'|'+day;let seed=2166136261;for(const c of key){seed^=c.charCodeAt(0);seed=Math.imul(seed,16777619)}const r=()=>{seed+=0x6D2B79F5;let t=seed;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296};const out=a.slice();for(let i=out.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[out[i],out[j]]=[out[j],out[i]]}return out}catch(e){return a}}\n`;
    h=h.replace(marker,helper+marker);
    // 完整词库加载完成后、渲染前打乱；不改词条本身，也不碰认识/模糊等 localStorage 记录。
    const candidates=[
      "V=await r.json();vi=0;vrender();",
      "V=await r.json(); vi=0; vrender();",
      "V=await r.json();\nvi=0;\nvrender();"
    ];
    for(const old of candidates){if(h.includes(old)){const neu=old.replace("vi=0;","V=vDailyShuffle(V,lv);vi=0;").replace("vi=0;", "V=vDailyShuffle(V,lv);vi=0;");h=h.replace(old,neu)}}
    // 内置核心词的首次显示也按当天稳定顺序处理。
    const init="vrender();fetchLevel($('vlev').value);";
    if(h.includes(init))h=h.replace(init,"V=vDailyShuffle(V,$('vlev').value);vrender();fetchLevel($('vlev').value);");
    return h;
  }catch(e){return h}
};
