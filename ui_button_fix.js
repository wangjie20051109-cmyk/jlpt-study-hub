window.applyUiButtonFix=function(h){
try{
 if(!h||h.includes('data-ui-button-fix="20260828-1"'))return h;
 const fix=`<script data-ui-button-fix="20260828-1">\n(function(){\n function bindToggle(btnId,panelId,openText,closedText){\n   var b=document.getElementById(btnId),p=document.getElementById(panelId);\n   if(!b||!p||b.dataset.mobileToggleFixed==='1')return;\n   b.dataset.mobileToggleFixed='1';\n   b.type='button';\n   b.onclick=null;\n   b.addEventListener('click',function(ev){\n     ev.preventDefault();ev.stopPropagation();ev.stopImmediatePropagation();\n     var hidden=(window.getComputedStyle(p).display==='none');\n     p.style.setProperty('display',hidden?'block':'none','important');\n     p.hidden=false;\n     b.setAttribute('aria-expanded',hidden?'true':'false');\n     if(openText&&closedText)b.textContent=hidden?closedText:openText;\n   },true);\n }\n function bindAll(){\n   bindToggle('lrKanaBtn','lrKana','あ 平假名辅助','🙈 隐藏平假名');\n   bindToggle('lrZhBtn','lrZh','中文翻译','🙈 隐藏中文');\n   bindToggle('pr','pa','平假名＋中文','🙈 隐藏平假名＋中文');\n }\n if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bindAll,{once:true});\n else bindAll();\n setTimeout(bindAll,50);\n setTimeout(bindAll,500);\n})();\n<\/script>`;
 return h.replace('</body>',fix+'</body>');
}catch(e){return h}
};
