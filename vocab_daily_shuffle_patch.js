window.applyVocabDailyShufflePatch=function(h){
  try{
    // 每次打开页面都重新随机；同一次打开期间保持当前顺序稳定。
    const marker="function vrender(){";
    if(!h.includes(marker)) return h;
    const helper=`const __vShuffleSeen=new WeakSet();\nfunction vOpenShuffle(a){try{if(!Array.isArray(a)||a.length<2)return a;const out=a.slice();let rand;try{const u=new Uint32Array(1);crypto.getRandomValues(u);rand=()=>{crypto.getRandomValues(u);return u[0]/4294967296}}catch(e){rand=Math.random}for(let i=out.length-1;i>0;i--){const j=Math.floor(rand()*(i+1));[out[i],out[j]]=[out[j],out[i]]}return out}catch(e){return a}}\nfunction vEnsureOpenShuffle(){try{if(Array.isArray(V)&&!__vShuffleSeen.has(V)){const old=V;V=vOpenShuffle(V);__vShuffleSeen.add(old);__vShuffleSeen.add(V);if(typeof vi!=='undefined')vi=0}}catch(e){}}\n`;
    h=h.replace(marker,helper+"function vrender(){vEnsureOpenShuffle();");
    return h;
  }catch(e){return h}
};
