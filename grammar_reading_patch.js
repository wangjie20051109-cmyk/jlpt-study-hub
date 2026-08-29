window.applyGrammarReadingPatch=function(h){
const slot='<div class="study-word" style="text-align:center" id="gpat"></div><div class="study-zh" style="text-align:center" id="gzh"></div>';
const slot2='<div class="study-word" style="text-align:center" id="gpat"></div><div class="kana" style="text-align:center;margin-top:6px;font-size:15px" id="gpatk"></div><div class="study-zh" style="text-align:center" id="gzh"></div>';
if(h.includes(slot))h=h.replace(slot,slot2);
const add=`const GRAMMAR_KANA_FULL={
'～と思います':'～とおもいます','～とは限らない':'～とはかぎらない','～一方で':'～いっぽうで','～に応じて':'～におうじて','～以上':'～いじょう','～に伴って':'～にともなって','～に対して':'～にたいして','～に違いない':'～にちがいない','～ざるを得ない':'～ざるをえない','～に至るまで':'～にいたるまで','～を余儀なくされる':'～をよぎなくされる','～につれて':'～につれて','～に従って':'～にしたがって','～に沿って':'～にそって','～に基づいて':'～にもとづいて','～に関して':'～にかんして','～に先立って':'～にさきだって','～に加えて':'～にくわえて','～に比べて':'～にくらべて','～を通じて':'～をつうじて','～を通して':'～をとおして','～を問わず':'～をとわず','～に限らず':'～にかぎらず','～に限って':'～にかぎって','～に限り':'～にかぎり','～次第':'～しだい','～最中に':'～さいちゅうに','～際に':'～さいに','～反面':'～はんめん','～上で':'～うえで','～上は':'～うえは','～末に':'～すえに','～抜きで':'～ぬきで','～向け':'～むけ','～向き':'～むき','～恐れがある':'～おそれがある','～代わりに':'～かわりに'
};
const GRAMMAR_KANA_PARTS=[
['余儀なく','よぎなく'],['先立って','さきだって'],['基づいて','もとづいて'],['基づく','もとづく'],['関して','かんして'],['関する','かんする'],['応じて','おうじて'],['応じる','おうじる'],['伴って','ともなって'],['伴う','ともなう'],['対して','たいして'],['対する','たいする'],['違いない','ちがいない'],['限らない','かぎらない'],['限らず','かぎらず'],['限って','かぎって'],['限り','かぎり'],['一方','いっぽう'],['以上','いじょう'],['以下','いか'],['以内','いない'],['以外','いがい'],['至る','いたる'],['得ない','えない'],['得る','える'],['次第','しだい'],['最中','さいちゅう'],['際して','さいして'],['際に','さいに'],['反面','はんめん'],['上で','うえで'],['上は','うえは'],['末に','すえに'],['抜き','ぬき'],['向け','むけ'],['向き','むき'],['通じて','つうじて'],['通して','とおして'],['通り','とおり'],['問わず','とわず'],['加えて','くわえて'],['加える','くわえる'],['比べて','くらべて'],['従って','したがって'],['沿って','そって'],['恐れ','おそれ'],['代わり','かわり'],['思います','おもいます'],['思う','おもう'],['場合','ばあい'],['結果','けっか'],['理由','りゆう'],['意味','いみ'],['必要','ひつよう'],['可能','かのう'],['目的','もくてき'],['前に','まえに'],['後で','あとで'],['間に','あいだに'],['間','あいだ'],['時に','ときに'],['時','とき'],['程度','ていど'],['一度','いちど'],['一切','いっさい'],['必ず','かならず'],['全く','まったく'],['決して','けっして'],['逆に','ぎゃくに'],['特に','とくに'],['主に','おもに'],['際','さい']
];
function grammarPatternKana(p=''){
 let src=String(p||'').trim();if(!src)return '';
 if(GRAMMAR_KANA_FULL[src])return GRAMMAR_KANA_FULL[src];
 let out=src;
 for(const [a,b] of GRAMMAR_KANA_PARTS)out=out.split(a).join(b);
 return /[一-龯々]/.test(out)?'':out;
}
`;
if(!h.includes('function grammarPatternKana(')&&h.includes('function gf(){'))h=h.replace('function gf(){',add+'function gf(){');
const emptyOld="if(!a.length){$('gpat').textContent='没有匹配结果';$('gzh').textContent='请调整搜索或学习范围';";
const emptyNew="if(!a.length){$('gpat').textContent='没有匹配结果';$('gpatk').textContent='';$('gzh').textContent='请调整搜索或学习范围';";
if(h.includes(emptyOld))h=h.replace(emptyOld,emptyNew);
const target="$('gl').textContent=x[0];$('gsource').textContent=x[8]==='supp'?'扩展语法库':(remote?'完整语法库':'核心精讲');$('gpat').textContent=x[1];$('gzh').textContent=((remote||x[8]==='supp')?'英文原义：':'中文：')+x[2];";
const replacement="$('gl').textContent=x[0];$('gsource').textContent=x[8]==='supp'?'扩展语法库':(remote?'完整语法库':'核心精讲');$('gpat').textContent=x[1];let gpk=grammarPatternKana(x[1]);$('gpatk').textContent=gpk?'平假名：'+gpk:'';$('gzh').textContent=((remote||x[8]==='supp')?'英文原义：':'中文：')+x[2];";
if(h.includes(target))h=h.replace(target,replacement);
const hideOld="function applyGHide(){['gzh','gconn','gexk','gexz','gtip'].forEach";
const hideNew="function applyGHide(){['gpatk','gzh','gconn','gexk','gexz','gtip'].forEach";
if(h.includes(hideOld))h=h.replace(hideOld,hideNew);
return h;
};