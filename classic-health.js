/* Diagnostic / failure containment for the legacy JLPT hub. Does not change learning keys. */
(function () {
'use strict';
if (window.ClassicHealth) return;
const registry = [
 ['applyVocabFix','vocab_fix.js'],['applyVocabDailyShufflePatch','vocab_daily_shuffle_patch.js'],
 ['applyVocabRecognitionPatch','vocab_recognition_patch.js'],
 ['applyLongPodcastPatch','long_podcast_patch.js'],['applyBackgroundAudioPatch','background_audio_patch.js'],
 ['applyPodcastSelectorPatch','podcast_selector_patch.js'],['applyShadowingPatch','shadowing_patch.js'],
 ['applyJlptListeningExamPatch','jlpt_listening_exam_patch.js'],['applyDynamicContentPatch','dynamic_content_patch.js'],
 ['applyGrammarQualityPatch','grammar_quality_patch.js'],['applyGrammarQualityMore','grammar_quality_more.js'],
 ['applyGrammarQuality0901','grammar_quality_0901.js'],['applyGrammarQuality0906','grammar_quality_0906.js'],
 ['applyGrammarQuality0907','grammar_quality_0907.js'],['applyGrammarQuality0908','grammar_quality_0908.js'],
 ['applyGrammarQuality0910','grammar_quality_0910.js'],['applyGrammarQuality0911','grammar_quality_0911.js'],
 ['applyGrammarQuality0912','grammar_quality_0912.js'],['applyGrammarQuality0913','grammar_quality_0913.js'],
 ['applyGrammarQuality0914','grammar_quality_0914.js'],['applyGrammarQuality0915','grammar_quality_0915.js'],
 ['applyGrammarQuality0917','grammar_quality_0917.js'],['applyGrammarQuality0919','grammar_quality_0919.js'],
 ['applyGrammarQuality0929','grammar_quality_0929.js'],['applyGrammarCatalogCore','grammar_catalog_core.js'],
 ['applyGrammarCatalogUi','grammar_catalog_ui.js'],['applyGrammarCatalogStatusPatch','grammar_catalog_status_patch.js'],
 ['applyGrammarCatalogFilterPatch','grammar_catalog_filter_patch.js'],['applyGrammarProgressPatch','grammar_progress_patch.js'],
 ['applyGrammarReadingPatch','grammar_reading_patch.js'],['applyLongReadingPatch','long_reading_patch.js'],
 ['applyReviewPatch','review_patch.js'],['applyMatureModulesPatch','mature_modules_patch.js'],
 ['applyDailyPatch','daily_patch.js'],['applyTextbookVocabPatch','textbook_vocab_patch.js'],
 ['applyUiButtonFix','ui_button_fix.js'],['applyStudyCardsUiPatch','study_cards_ui_patch.js']
];
const state={missing:[],recovered:[],errors:[],noop:[],applied:[],fatal:null,sections:[],navigation:null};
const label={
 vocab:'单词',grammar:'语法',reading:'阅读',listening:'听力',review:'复习',
 podcast:'播客',shadowing:'跟读',daily:'每日学习'
};
function escaped(s){return String(s).replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]))}
function runExtraScript(src){
 return new Promise(resolve=>{
  let finished=false;
  const script=document.createElement('script');
  script.src=src+(src.includes('?')?'&':'?')+'recover='+Date.now();
  script.async=true;
  const finish=ok=>{if(finished)return;finished=true;script.onload=null;script.onerror=null;resolve(ok)};
  script.onload=()=>finish(true);script.onerror=()=>finish(false);
  document.head.appendChild(script);
  setTimeout(()=>finish(false),6500);
 });
}
async function ensure(){
 const pending=registry.filter(([fun])=>typeof window[fun]!=='function');
 await Promise.all(pending.map(async ([fun,src])=>{
   const ok=await runExtraScript(src);
   if(ok&&typeof window[fun]==='function')state.recovered.push(fun);
   else if(!state.missing.includes(fun))state.missing.push(fun);
 }));
 return state.missing.length===0;
}
function apply(name,html){
 const fn=window[name];
 if(typeof fn!=='function'){if(!state.missing.includes(name))state.missing.push(name);return html}
 try {
   const result=fn(html);
   if(typeof result!=='string'||!result.includes('</body>')){
    state.errors.push(name+': 未返回完整HTML，已跳过该补丁');return html;
   }
   (result===html?state.noop:state.applied).push(name);
   return result;
 }catch(e){state.errors.push(name+': '+String(e?.message||e));return html}
}
function sectionButton(section){
 return [...document.querySelectorAll('[data-p]')].find(b=>b.getAttribute('data-p')===section)||null;
}
function navigate(){
 const section=new URLSearchParams(location.search).get('section');
 if(!section||state.navigation===section)return;
 const btn=sectionButton(section),node=document.getElementById(section);
 if(btn){btn.click();state.navigation=section;return}
 if(node){node.scrollIntoView({block:'start'});state.navigation=section}
}
function summarize(){
 const sections=['vocab','grammar','reading','review']; // 听力已独立迁移
 const entries=sections.map(s=>({key:s,exists:!!document.getElementById(s),nav:!!sectionButton(s)}));
 state.sections=entries;
 return entries;
}
function draw(){
 if(!document.body)return;
 let root=document.getElementById('classicCheck');
 if(!root){
  root=document.createElement('div');root.id='classicCheck';
  root.style.cssText='position:fixed;right:12px;top:12px;z-index:999998;font-family:system-ui,Arial,sans-serif';
  root.innerHTML='<button id="classicHealthToggle" type="button" style="border:1px solid #356678;border-radius:13px;padding:7px 12px;background:#133a49;color:white;font-size:12px;font-weight:750;box-shadow:0 4px 15px #0005">🩺 功能检查</button><section id="classicHealthPanel" hidden style="display:none;position:absolute;top:40px;right:0;width:min(370px,calc(100vw - 24px));max-height:78vh;overflow:auto;background:#111e2a;color:white;padding:17px;border:1px solid #456;box-shadow:0 12px 40px #0009;border-radius:16px;font-size:13px;line-height:1.65"></section>';
  document.body.appendChild(root);
  root.querySelector('#classicHealthToggle').onclick=()=>{
    const panel=root.querySelector('#classicHealthPanel');
    panel.hidden=!panel.hidden;panel.style.display=panel.hidden?'none':'block';updatePanel();
  };
 }
 updatePanel();
}
function updatePanel(){
 const el=document.getElementById('classicHealthPanel');if(!el)return;
 const checks=summarize(), healthy=checks.filter(x=>x.exists).length;
 const problem=[...state.errors,...state.missing.map(x=>'未加载：'+x)];
 let html='<strong style="font-size:17px">旧站功能检测</strong><p>已检测主要模块：'+healthy+'/'+checks.length+'；已加载补丁：'+state.applied.length+'；无改动补丁：'+state.noop.length+'</p>';
 html+='<div>'+checks.map(x=>'<div style="padding:3px 0">'+(x.exists?'✓':'!')+' '+escaped(label[x.key]||x.key)+(x.nav?'（导航可用）':x.exists?'（无导航按钮）':'（未找到模块）')+'</div>').join('')+'</div>';
 if(state.recovered.length)html+='<p>已自动重试恢复 '+state.recovered.length+' 个加载失败的脚本。</p>';
 if(state.fatal)problem.unshift('加载异常：'+state.fatal);
 if(problem.length)html+='<hr style="border-color:#456"><strong>异常记录（'+problem.length+'）</strong><div style="max-height:130px;overflow:auto">'+problem.slice(0,18).map(x=>'<div>• '+escaped(x)+'</div>').join('')+'</div>';
 else html+='<p style="color:#a2ebce">当前未检测到加载错误。注意：此检查无法验证每一道题或每段音频。</p>';
 html+='<div style="display:flex;gap:7px;flex-wrap:wrap;margin-top:14px"><a href="./" style="color:#a8d9ff">返回新版首页</a><a href="./practice.html" style="color:#a8d9ff">打开刷题</a><a href="./words.html" style="color:#a8d9ff">打开背词</a></div>';
 el.innerHTML=html;
}
function mount(){
 const work=()=>{draw();navigate()};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',work,{once:true});
 else work();
 [450,1400,3200].forEach(ms=>setTimeout(work,ms));
}
function fatal(err){
 state.fatal=String(err?.message||err||'unknown');
 if(document.getElementById('load')){
  document.getElementById('load').innerHTML='<h2>旧站加载失败</h2><p style="font-size:14px;opacity:.85">'+escaped(state.fatal)+'</p><p>如果某个脚本或网络请求没有成功，请刷新后重试。</p><button onclick="location.reload()" style="padding:12px;border:0;border-radius:12px">重新加载</button> <a style="color:#a8d9ff" href="./">返回首页</a>';
 } else if(document.body){
  const note=document.createElement('p');note.style.cssText='background:#642d30;color:white;padding:16px;border-radius:12px;margin:12px';
  note.textContent='经典学习站遇到加载异常：'+state.fatal;document.body.prepend(note);
 }
 mount();
}
window.ClassicHealth={state,ensure,apply,mount,fatal};
})();