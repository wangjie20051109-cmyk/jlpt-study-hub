/* Standalone vocabulary detail. Preserves jlptWordsModuleV1, jlptPracticeV2State.
 * Example metadata credited in word-examples-NOTICE.md (CC BY-SA 4.0). */
(function(){
'use strict';
const $=id=>document.getElementById(id);
const levelArrays={N2:window.JLPT_BULK_N2||[],N3:window.JLPT_BULK_N3||[]};
const EXAMPLES=window.JLPT_WORD_EXAMPLES||{};
const KEY='jlptWordsModuleV1',NOTES='jlptWordNotesV1';
const MS=86400000;
const ZH={
'手首':'手腕','初歩':'初步；入门','絵の具':'颜料；绘画颜料','紙幣':'纸币','梯子':'梯子','比較的':'比较；相对而言','水平':'水平','洒落':'俏皮话；玩笑','郵送':'邮寄','終了':'结束；终止',
'周辺':'周边；附近','重力':'重力','熟語':'熟语；固定词组','重要':'重要','資料':'资料','現実':'现实','雰囲気':'氛围','会議':'会议','参加':'参加','試験':'考试',
'修飾':'修饰','剥く':'剥皮；削皮','捕まる':'被抓住；抓牢','冗談':'玩笑','問い':'问题；提问','進歩':'进步；发展','借金':'借款；负债','狂う':'失常；错乱','哲学':'哲学',
'刺激':'刺激','生活':'生活','予算':'预算','予定':'预定；计划','状況':'情况；状况','理由':'理由','無理':'勉强；不可能','必要':'必要','忘れる':'忘记','覚える':'记住',
'相手':'对方；伙伴','経験':'经验；经历','対応':'应对','感情':'感情','安心':'放心','心配':'担心','関係':'关系','年齢':'年龄','表現':'表达；表现','目標':'目标',
'表情':'表情','印象':'印象','環境':'环境','接客':'待客服务','技術':'技术','解決':'解决','機会':'机会','相談':'商量；咨询','助ける':'帮助','説明':'说明',
'通勤':'通勤','交通':'交通','比較':'比较','選択':'选择','努力':'努力','勉強':'学习','練習':'练习','経営':'经营；运营','請求':'请求；账单','取り入れる':'引进；采用',
'占める':'占据；占有','憎らしい':'可恨的；讨厌的','緩い':'松的；不紧的','釣り合う':'平衡；相称','改めて':'重新；再次','いらいら':'烦躁；焦急；心烦'
};
const curated={
 'いらいら':[
 {ja:'いらいらしたようすで。',zh:'一副焦躁不安的样子。'},
 {ja:'いらいらしながら、電車(でんしゃ)を待(ま)つ。',zh:'一边心烦意乱，一边等电车。'},
 {ja:'そんなにいらいらしないで。',zh:'别那么烦躁。'}
 ],
 '手首':[
 {ja:'転(ころ)んで手首(てくび)を痛(いた)めました。',zh:'摔倒后伤到了手腕。'},
 {ja:'手首(てくび)をゆっくり回(まわ)してください。',zh:'请慢慢转动手腕。'}
 ],
 '借金':[
 {ja:'借金(しゃっきん)を返(かえ)すために働(はたら)いています。',zh:'为了还债而工作。'},
 {ja:'借金(しゃっきん)で首(くび)が回(まわ)らない。',zh:'债务缠身，周转不开。'}
 ],
 '冗談':[{ja:'それは冗談(じょうだん)でしょう。',zh:'那是在开玩笑吧。'}],
 '進歩':[{ja:'日本語(にほんご)が少(すこ)しずつ進歩(しんぽ)しています。',zh:'日语正在一点一点进步。'}],
 '紙幣':[{ja:'一万円(いちまんえん)紙幣(しへい)で払(はら)いました。',zh:'用一万日元纸币付款了。'}],
 '比較的':[{ja:'この問題(もんだい)は比較的(ひかくてき)簡単(かんたん)です。',zh:'这道题相对简单。'}],
 '捕まる':[{ja:'手(て)すりにしっかり捕(つか)まってください。',zh:'请牢牢抓住扶手。'}],
 '刺激':[{ja:'日本(にほん)での生活(せいかつ)は刺激(しげき)が多(おお)いです。',zh:'在日本的生活充满刺激。'}]
};
const demo={id:'demo-iraira',level:'N2',word:'いらいら',kana:'いらいら',meaning:'irritated; impatient; nervous; fretful',demo:true};
const arr={N2:levelArrays.N2.map((v,i)=>({id:'n2-'+i,level:'N2',index:i,word:v[0],kana:v[1],meaning:v[2],type:v[3]?'writing':'reading'})),N3:levelArrays.N3.map((v,i)=>({id:'n3-'+i,level:'N3',index:i,word:v[0],kana:v[1],meaning:v[2],type:v[3]?'writing':'reading'}))};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function read(key,fallback){try{return JSON.parse(localStorage.getItem(key)||'null')??fallback}catch(e){return fallback}}
function save(key,value){try{localStorage.setItem(key,JSON.stringify(value));return true}catch(e){alert('保存失败：请检查当前浏览器的储存权限');return false}}
let words=read(KEY,{items:{},days:{}}),notes=read(NOTES,{});words.items=words.items||{};words.days=words.days||{};
const params=new URLSearchParams(location.search),origin=params.get('from')==='study'?'study':'list';
let detail=null,level='N2',index=0,playing=false;
const posName=s=>{
 const raw=(s||'').split(';').map(x=>x.trim());
 const k={n:'名词',adv:'副词','adj-na':'形容动词','adj-i':'い形容词',v1:'一段动词',v5u:'五段动词',v5r:'五段动词',v5k:'五段动词',v5g:'五段动词',v5s:'五段动词',v5t:'五段动词',v5m:'五段动词',vs:'サ变动词','vs-s':'サ变动词',vi:'自动词',vt:'他动词',exp:'固定表达',int:'感叹词','adj-no':'连体修饰',suf:'接尾词',pref:'接头词'};
 return raw.map(x=>k[x]||'').filter(Boolean).slice(0,3).join(' · ')||'词汇';
};
const basics={あ:'a',い:'i',う:'u',え:'e',お:'o',か:'ka',き:'ki',く:'ku',け:'ke',こ:'ko',さ:'sa',し:'shi',す:'su',せ:'se',そ:'so',た:'ta',ち:'chi',つ:'tsu',て:'te',と:'to',な:'na',に:'ni',ぬ:'nu',ね:'ne',の:'no',は:'ha',ひ:'hi',ふ:'fu',へ:'he',ほ:'ho',ま:'ma',み:'mi',む:'mu',め:'me',も:'mo',や:'ya',ゆ:'yu',よ:'yo',ら:'ra',り:'ri',る:'ru',れ:'re',ろ:'ro',わ:'wa',を:'o',ん:'n',が:'ga',ぎ:'gi',ぐ:'gu',げ:'ge',ご:'go',ざ:'za',じ:'ji',ず:'zu',ぜ:'ze',ぞ:'zo',だ:'da',ぢ:'ji',づ:'zu',で:'de',ど:'do',ば:'ba',び:'bi',ぶ:'bu',べ:'be',ぼ:'bo',ぱ:'pa',ぴ:'pi',ぷ:'pu',ぺ:'pe',ぽ:'po',ゔ:'vu',きゃ:'kya',きゅ:'kyu',きょ:'kyo',しゃ:'sha',しゅ:'shu',しょ:'sho',ちゃ:'cha',ちゅ:'chu',ちょ:'cho',にゃ:'nya',にゅ:'nyu',にょ:'nyo',ひゃ:'hya',ひゅ:'hyu',ひょ:'hyo',みゃ:'mya',みゅ:'myu',みょ:'myo',りゃ:'rya',りゅ:'ryu',りょ:'ryo',ぎゃ:'gya',ぎゅ:'gyu',ぎょ:'gyo',じゃ:'ja',じゅ:'ju',じょ:'jo',びゃ:'bya',びゅ:'byu',びょ:'byo',ぴゃ:'pya',ぴゅ:'pyu',ぴょ:'pyo'};
function romaji(kana){const s=String(kana||'').replace(/[\u30a1-\u30f6]/g,c=>String.fromCharCode(c.charCodeAt(0)-96));let out='';for(let i=0;i<s.length;i++){const c=s[i];if(c==='っ'){let next=basics[s.slice(i+1,i+3)]||basics[s[i+1]]||'';out+=next.startsWith('ch')?'t':next[0]||'';continue}if(c==='ー'){const v=[...out].reverse().find(x=>'aeiou'.includes(x));if(v)out+=v;continue}const dig=s.slice(i,i+2);if(basics[dig]){out+=basics[dig];i++;continue}out+=basics[c]||c}return out}
function withMarkings(text){
 // Hand-curated example sentences mark kanji words as 漢字(かな). Escape each segment before rendering.
 let str=String(text||''),out='',last=0,re=/([\u3400-\u9fff々ヶ]+)\(([ぁ-ゖー]+)\)/g,m;
 while((m=re.exec(str))){out+=esc(str.slice(last,m.index));out+='<ruby>'+esc(m[1])+'<rt>'+esc(m[2])+'</rt></ruby>';last=re.lastIndex}
 return out+esc(str.slice(last));
}
function targetRuby(sentence,word,kana){
 let s=String(sentence||'');if(!s.includes(word))return esc(s);
 return s.split(word).map(esc).join('<ruby>'+esc(word)+'<rt>'+esc(kana)+'</rt></ruby>');
}
function showWord(w,update=true){
 if(!w)return;
 detail=w;level=w.level;index=w.index??0;
 if(playing)stop();
 const extra=EXAMPLES[w.id]||{},cn=ZH[w.word],extraText=extra.gloss||w.meaning;
 $('word').textContent=w.word;
 const r=extra.romaji||romaji(w.kana);
 $('romaji').textContent=r;
 $('pos').textContent=w.demo?'拟态词 · 副词 · サ变动词':posName(extra.pos);
 $('level').textContent=w.level+(w.demo?' · N3也常见':' · 核心词汇');
 $('brief').textContent=cn||extraText||'词义待补充';
 $('meaningTag').textContent=cn?'中文释义':'英文释义';
 $('definitions').innerHTML=(cn?'<div class="meaning" style="background:#f1f2f4"><b style="color:#8e99a4;font-size:12px">中</b>　'+esc(cn)+'</div>':'<p class="muted">当前词条暂无核对过的中文释义，先显示开源英文词义。</p>')+'<div class="meaning secondary" style="margin-top:12px"><b style="color:#8f969e;font-size:12px">EN</b>　'+esc(extraText||w.meaning)+'</div>';
 const examples=curated[w.word]||(extra.ja?[{ja:extra.ja,en:extra.en,fromSource:true}]:[]);
 $('examplesCount').textContent=examples.length?examples.length+' 句':'待补充';
 if(examples.length){
 $('examples').innerHTML=examples.map((ex,i)=>{
 const phrase=ex.fromSource?targetRuby(ex.ja,w.word,w.kana):withMarkings(ex.ja);
 const trans=ex.zh?'中文：'+ex.zh:ex.en?'English: '+ex.en:'';
 return '<div class="exblock"><div class="extext"><div class="jp">'+phrase+'</div><div class="cn">'+esc(trans)+'</div></div><button type="button" class="sound exsound" data-ex="'+i+'" aria-label="播放第'+(i+1)+'条例句">◖))</button></div>';
 }).join('');
 $('examples').querySelectorAll('[data-ex]').forEach(b=>b.onclick=()=>speak(examples[Number(b.dataset.ex)].ja));
 }else $('examples').innerHTML='<div class="empty">这条词目前没有经过核对的完整例句。可以先听发音、学习词义，例句会继续补充。</div>';
 const state=(words.items||{})[w.id]||{};
 $('starIcon').textContent=state.starred?'★':'☆';$('star').classList.toggle('active',!!state.starred);
 $('note').classList.toggle('active',!!notes[w.id]);
 $('moreinfo').innerHTML='<div>学习状态：'+(state.mastered?'已掌握':state.seen?'已学习':'未学习')+'</div><div>词汇编号：'+esc(w.id)+'</div><div>来源：'+(extra.ja?'OpenJLPT/Tatoeba 例句':'公开词表')+'</div>'+(w.demo?'':'<button type="button" id="markKnown" style="margin-top:9px;padding:7px 10px;border-radius:9px;border:1px solid #badccc;background:#effaf5;color:#15795e">✓ 标记为已掌握</button>');
 $('moreinfo').classList.remove('visible');
 if($('markKnown'))$('markKnown').onclick=()=>{
 const old=words.items[w.id]||{};words.items[w.id]={...old,seen:true,mastered:true,goodCount:3,rating:'easy',updatedAt:Date.now(),nextReview:Date.now()+7*MS};
 const t=new Date(),key=[t.getFullYear(),String(t.getMonth()+1).padStart(2,'0'),String(t.getDate()).padStart(2,'0')].join('-');words.days[key]=(words.days[key]||0)+1;
 save(KEY,words);showWord(w,false);
 };
 $('position').textContent=w.demo?'示例卡':' '+(index+1)+' / '+arr[level].length+' ';
 $('prev').disabled=!!w.demo||index<=0;$('next').disabled=!!w.demo||index>=arr[level].length-1;
 $('exam').disabled=!!w.demo;
 document.title=w.word+'（'+w.kana+'）· 单词详情';
 if(update){const u=new URL(location.href);u.searchParams.set('id',w.id);history.replaceState(null,'',u.pathname+u.search);}
 window.scrollTo({top:0,behavior:'instant'});
}
function navigate(delta){if(!detail||detail.demo)return;const n=index+delta;if(n<0||n>=arr[level].length)return;showWord(arr[level][n]);}
function speak(text){
 if(!('speechSynthesis' in window))return alert('当前浏览器不支持语音朗读');
 speechSynthesis.cancel();const utterance=new SpeechSynthesisUtterance(String(text||'').replace(/([\u3400-\u9fff々ヶ]+)\(([ぁ-ゖー]+)\)/g,'$1'));
 utterance.lang='ja-JP';utterance.rate=.86;window.speechSynthesis.speak(utterance);
}
function stop(){playing=false;if('speechSynthesis' in window)speechSynthesis.cancel();$('listenIcon').textContent='▷';$('listen').classList.remove('active')}
function listen(){
 if(playing){stop();return}
 if(!('speechSynthesis' in window))return alert('浏览器未提供语音朗读功能');
 const w=detail;if(!w)return;
 playing=true;$('listenIcon').textContent='▮▮';$('listen').classList.add('active');
 const extra=EXAMPLES[w.id]||{},examples=curated[w.word]||[];
 const targets=[w.word,examples[0]?.ja||extra.ja||'',w.word].filter(Boolean);
 let p=0;
 function run(){if(!playing||detail!==w)return;if(p>=targets.length){stop();return}
  const u=new SpeechSynthesisUtterance(targets[p++].replace(/([\u3400-\u9fff々ヶ]+)\(([ぁ-ゖー]+)\)/g,'$1'));u.lang='ja-JP';u.rate=.83;u.onend=run;u.onerror=()=>stop();speechSynthesis.speak(u);
 }
 speechSynthesis.cancel();run();
}
const requested=params.get('id'),found=requested==='demo-iraira'?demo:[...arr.N2,...arr.N3].find(x=>x.id===requested);
showWord(found||arr.N2[0],false);
$('back').onclick=()=>{stop();location.href='./words.html?level='+level+'#wordList'};
$('mainSpeak').onclick=()=>detail&&speak(detail.word);
$('more').onclick=()=>$('moreinfo').classList.toggle('visible');
$('prev').onclick=()=>navigate(-1);$('next').onclick=()=>navigate(1);
$('star').onclick=()=>{if(!detail)return;const v=words.items[detail.id]||{};words.items[detail.id]={...v,starred:!v.starred};save(KEY,words);$('starIcon').textContent=words.items[detail.id].starred?'★':'☆';$('star').classList.toggle('active',words.items[detail.id].starred)};
$('exam').onclick=()=>{if(!detail||detail.demo)return;const examId='bulk-'+detail.level.toLowerCase()+'-'+String(detail.index+1).padStart(3,'0');location.href='./practice.html?level='+detail.level+'&type='+detail.type+'&mode=all&focus='+examId};
$('listen').onclick=listen;
$('note').onclick=()=>{if(!detail)return;$('noteWord').textContent=detail.word+' · '+detail.kana;$('noteText').value=notes[detail.id]||'';$('noteDialog').hidden=false;$('noteDialog').style.display='grid';$('noteText').focus()};
function closeNote(){$('noteDialog').hidden=true;$('noteDialog').style.display='none'}
$('noteCancel').onclick=closeNote;$('noteDialog').onclick=e=>{if(e.target===$('noteDialog'))closeNote()};
$('noteSave').onclick=()=>{if(!detail)return;notes[detail.id]=$('noteText').value.trim();save(NOTES,notes);$('note').classList.toggle('active',!!notes[detail.id]);closeNote()};
document.addEventListener('keydown',e=>{if(!$('noteDialog').hidden){if(e.key==='Escape')closeNote();return}if(e.key==='ArrowRight')navigate(1);if(e.key==='ArrowLeft')navigate(-1);if(e.key==='Escape')$('back').click()});
let touch=null;
document.addEventListener('touchstart',e=>{if(e.touches.length!==1||e.target.closest('button,textarea'))return;touch={x:e.touches[0].clientX,y:e.touches[0].clientY}},{passive:true});
document.addEventListener('touchend',e=>{if(!touch)return;const t=e.changedTouches[0];const dx=t.clientX-touch.x,dy=t.clientY-touch.y;touch=null;if(Math.abs(dx)>85&&Math.abs(dx)>Math.abs(dy)*1.5)navigate(dx<0?1:-1)},{passive:true});
})();