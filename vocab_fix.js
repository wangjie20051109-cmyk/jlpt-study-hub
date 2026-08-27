window.applyVocabFix=function(h){
  try{
    // 根因修复：页面先显示内置核心词，再异步加载完整词库。
    // 原版只有远程词库加载成功后才 vrender()，网络失败时单词卡会一直空白。
    const initOld="fetchLevel($('vlev').value);";
    const initNew="vrender();fetchLevel($('vlev').value);";
    if(h.includes(initOld))h=h.replace(initOld,initNew);

    // 远程词库两个地址都失败时，也必须回退显示 V_BASE 内置核心词。
    const failOld="$ ('vload')"; // 仅用于避免误匹配旧实验代码
    const failTarget="$('vload').textContent='⚠️ '+lv+' 完整词表暂时加载失败，当前先显示内置核心词。切换等级或刷新会自动重试。'+(last?'（'+last+'）':'');$('vload').className='vstatus err';";
    const failReplacement=failTarget+"vi=0;vrender();";
    if(h.includes(failTarget)&&!h.includes(failReplacement))h=h.replace(failTarget,failReplacement);

    return h;
  }catch(e){return h}
};
