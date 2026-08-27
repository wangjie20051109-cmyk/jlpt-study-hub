window.applyVocabFix=function(h){
  try{
    // 只修页面初始化：先显示内置核心词，再异步加载完整词库。
    // 用换行锚定，避免误伤 onchange 里的 await fetchLevel(...)
    const initOld="\nfetchLevel($('vlev').value);";
    const initNew="\nvrender();fetchLevel($('vlev').value);";
    if(h.includes(initOld))h=h.replace(initOld,initNew);

    // 两个远程词库地址都失败时，仍然强制显示内置 V_BASE 核心词。
    const failTarget="$('vload').textContent='⚠️ '+lv+' 完整词表暂时加载失败，当前先显示内置核心词。切换等级或刷新会自动重试。'+(last?'（'+last+'）':'');$('vload').className='vstatus err';";
    const failReplacement=failTarget+"vi=0;vrender();";
    if(h.includes(failTarget)&&!h.includes(failReplacement))h=h.replace(failTarget,failReplacement);

    return h;
  }catch(e){return h}
};
