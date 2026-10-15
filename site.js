/* Shared navigation, persistence and speech helpers for JLPT Study Hub. */
(function(){
'use strict';
const pages=[['index.html','首页','⌂'],['strategy.html','对策','◎'],['words.html','背词','あ'],['practice.html','考试','✓'],['my.html','我的','◇']];
const current=location.pathname.split('/').pop()||'index.html';
const footer=document.createElement('nav');footer.className='bottomnav';footer.setAttribute('aria-label','网站模块导航');
footer.innerHTML='<div>'+pages.map(([href,title,icon])=>'<a href="./'+href+'" class="'+(href===current?'active':'')+'" '+(href===current?'aria-current="page"':'')+'><span class="ico">'+icon+'</span><span>'+title+'</span></a>').join('')+'</div>';
document.body.appendChild(footer);
window.JLPT_SITE={
  pages,
  safe(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))},
  read(key,otherwise){try{const x=JSON.parse(localStorage.getItem(key)||'null');return x==null?otherwise:x}catch(e){return otherwise}},
  write(key,value){try{localStorage.setItem(key,JSON.stringify(value));return true}catch(e){return false}},
  day(date=new Date()){return [date.getFullYear(),String(date.getMonth()+1).padStart(2,'0'),String(date.getDate()).padStart(2,'0')].join('-')},
  speak(value,rate=.88){if(!('speechSynthesis' in window)){alert('当前浏览器不支持语音朗读');return}window.speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(value);u.lang='ja-JP';u.rate=rate;window.speechSynthesis.speak(u)},
  vocab(){return ['N2','N3'].flatMap(level=>{const x=window['JLPT_BULK_'+level];return Array.isArray(x)?x.map((a,i)=>({id:level.toLowerCase()+'-'+i,level,word:a[0],kana:a[1],meaning:a[2]})):[]})},
  ruby(word,kana){return '<ruby>'+this.safe(word)+'<rt>'+this.safe(kana)+'</rt></ruby>'}
};
})();