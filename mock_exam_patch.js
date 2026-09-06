window.applyMockExamPatch=function(html){
try{
if(!html||html.includes('data-p="mockexam"'))return html;
const btn='<button data-p="mockexam">🧪 模拟题</button>';
const section=`<section id="mockexam" class="sec"><div class="panel"><main class="card"><div class="row"><span class="tag">JLPT 真题风格</span><select id="mxLevel"><option>N2</option><option>N3</option></select><select id="mxType"><option value="all">综合</option><option value="vocab">文字词汇</option><option value="grammar">语法</option><option value="reading">阅读</option></select></div><h2>🧪 N2 / N3 模拟训练</h2><p class="muted">原创 JLPT 风格题。每轮随机抽题，做过的题优先避开；答错自动记入本模块错题记录。</p><div id="mxProgress" class="tiny"></div><div id="mxBox" class="note" style="margin-top:12px"></div><div class="row" style="margin-top:12px"><button class="pri" id="mxNext">下一题 →</button><button id="mxReset">重置本轮</button></div></main><aside class="card"><b>本轮统计</b><div class="grid2" style="margin-top:12px"><div class="statbox"><div class="statnum" id="mxDone">0</div><div class="tiny">已答</div></div><div class="statbox"><div class="statnum" id="mxCorrect">0</div><div class="tiny">答对</div></div></div><div class="note" style="margin-top:12px"><b>题型重点</b><div class="tiny">N2：语境词汇、文法判断、接续、短篇要点理解。<br>N3：基础词汇、近义表达、常用文法、生活阅读。</div></div></aside></div></section>`;
html=html.replace(/(<div class="nav">[\s\S]*?)(<\/div>\s*<section id="vocab")/,'$1'+btn+'$2');
html=html.replace('<div class="foot">',section+'<div class="foot">');
const js=`const MOCK_Q=[
['N2','vocab','この計画は予算の都合で（　）されることになった。',['延期','延長','延ばし','遅刻'],0,'延期（えんき）：原定计划推迟到以后。这里是“计划因预算原因被延期”。'],
['N2','vocab','新しい制度について、社員に十分な説明を（　）必要がある。',['果たす','施す','行う','遂げる'],2,'説明を行う（せつめいをおこなう）＝进行说明，是自然搭配。'],
['N2','vocab','彼の説明は具体性に（　）、説得力がなかった。',['欠けて','抜けて','外れて','離れて'],0,'～に欠ける（かける）＝缺乏……。具体性に欠ける＝缺乏具体性。'],
['N2','vocab','この薬を飲めば、症状が多少（　）されるでしょう。',['解消','軽減','削減','縮小'],1,'症状が軽減される（しょうじょうがけいげんされる）＝症状得到减轻。'],
['N2','grammar','忙しい（　）、食事を抜くのは体によくない。',['からといって','にしては','ばかりに','だけあって'],0,'～からといって＝虽说因为……，也不能因此就……。后面常接否定评价。'],
['N2','grammar','この仕事は経験がある人（　）、簡単にはできない。',['に限って','でさえ','にとって','に応じて'],1,'～でさえ＝甚至……都……。有经验的人都不能轻易完成，强调程度。'],
['N2','grammar','天気予報によると、午後から雨が降る（　）。',['ことになっている','おそれがある','に違いない','わけではない'],1,'～おそれがある＝有……的可能/风险，多用于不好的事情。'],
['N2','grammar','彼は日本に10年住んでいるだけ（　）、日本文化に詳しい。',['あって','して','こそ','ほど'],0,'～だけあって＝不愧是……；正因为有相应经历，所以结果也符合期待。'],
['N2','reading','会社では在宅勤務を週2日まで認めている。しかし、重要な会議がある日は出社を求める場合がある。社員は前日までに勤務場所をシステムへ登録しなければならない。\n\n本文と合うものはどれか。',['在宅勤務は週に何日でもよい','重要な会議の日も必ず在宅勤務する','勤務場所は前日までに登録する','会社は在宅勤務を認めていない'],2,'关键句：社員は前日までに勤務場所をシステムへ登録しなければならない。'],
['N2','reading','図書館では資料整理のため、毎月最終月曜日を休館日としている。ただし、その日が祝日の場合は翌日が休館となる。今月の最終月曜日は祝日である。\n\n今月、図書館が休館するのはいつか。',['最終日曜日','最終月曜日','最終月曜日の翌日','翌月の月曜日'],2,'最終月曜日が祝日なので「翌日が休館」となる。'],
['N3','vocab','電車が事故で（　）いるので、別の路線を使います。',['止まって','閉まって','消えて','落ちて'],0,'電車が止まる（でんしゃがとまる）＝电车停止运行。'],
['N3','vocab','旅行の前にホテルを（　）しておきました。',['予約','予定','約束','用意'],0,'ホテルを予約する（よやくする）＝预订酒店。'],
['N3','vocab','この箱は重いので、一人で（　）のは大変です。',['運ぶ','通う','移る','届く'],0,'運びます（はこびます／運ぶ）＝搬运。'],
['N3','grammar','日本へ来て（　）、毎日日本語を使っています。',['から','まで','ほど','しか'],0,'Vて＋から＝做完A之后/自从A以后。日本へ来てから＝来到日本以后。'],
['N3','grammar','明日は早いから、今日は早く寝る（　）。',['ことにする','ことになる','ようになる','ところだった'],0,'～ことにする＝自己决定做……。'],
['N3','grammar','この料理は辛すぎて、私には食べ（　）。',['にくい','やすい','そうだ','らしい'],0,'Vます去ます＋にくい＝难以……。食べにくい＝难吃/难以下咽。'],
['N3','grammar','忘れない（　）、スマホにメモしておきます。',['ように','ためで','そうに','らしく'],0,'～ように＝为了达到某状态。忘れないように＝为了不忘记。'],
['N3','reading','田中さんは土曜日に友達と映画を見る予定でした。しかし、友達が風邪をひいたので、映画は来週にしました。土曜日は家で日本語の宿題をすることにしました。\n\n田中さんは土曜日に何をしますか。',['映画を見る','友達の家へ行く','日本語の宿題をする','病院へ行く'],2,'电影改到下周，因此周六决定在家做日语作业。'],
['N3','reading','スーパーは通常9時に開店しますが、日曜日だけは10時に開店します。今日は日曜日です。\n\n今日は何時に店が開きますか。',['8時','9時','10時','11時'],2,'日曜日だけ10時開店。今日は日曜日なので10時。'],
['N2','grammar','この問題は専門家（　）簡単に答えられるものではない。',['にしても','にしては','としても','にとっても'],0,'～にしても＝即使是……也……。専門家にしても＝即使是专家。'],
['N2','vocab','売上は予想を大きく（　）、過去最高となった。',['上回り','乗り越え','追い越し','飛び越え'],0,'予想を上回る（うわまわる）＝超过预期。'],
['N3','vocab','先生に作文を（　）もらいました。',['直して','治して','戻して','変えて'],0,'文章的修改用直す（なおす）；治す主要用于治病。'],
['N2','reading','市では自転車利用を増やすため駅前に駐輪場を新設した。利用料金を低く設定した結果、利用者は増えたが、休日には満車になることも多い。市は来年度、収容台数を増やす予定だ。\n\n市が来年度行う予定なのは何か。',['料金を上げる','駐輪場を閉鎖する','収容できる自転車を増やす','休日の利用を禁止する'],2,'最后一句「収容台数を増やす予定」直接对应答案。'],
['N3','reading','アルバイト先では、遅れる場合は仕事が始まる30分前までに店長へ電話することになっています。メールだけではいけません。\n\n遅れるとき、どうしますか。',['仕事の後でメールする','30分前までに店長へ電話する','同僚にだけ連絡する','何もしなくてよい'],1,'规定是开始工作30分钟前给店长打电话，只有邮件不行。']
];
let mxSeen=[];try{mxSeen=JSON.parse(localStorage.getItem('jlptMockSeenV1')||'[]')}catch(e){}let mxDone=0,mxCorrect=0,mxCurrent=null;
function mxPool(){let lv=$('mxLevel').value,t=$('mxType').value;return MOCK_Q.map((q,i)=>({q,i})).filter(x=>x.q[0]===lv&&(t==='all'||x.q[1]===t))}
function mxShow(){let p=mxPool(),fresh=p.filter(x=>!mxSeen.includes(x.i));if(!fresh.length){mxSeen=mxSeen.filter(id=>!p.some(x=>x.i===id));fresh=p}if(!fresh.length){$('mxBox').innerHTML='暂无该分类题目';return}mxCurrent=fresh[Math.floor(Math.random()*fresh.length)];let q=mxCurrent.q;let labels={vocab:'文字・词汇',grammar:'语法',reading:'阅读'};$('mxBox').innerHTML='<div class="row"><span class="tag">'+q[0]+'</span><span class="tag">'+labels[q[1]]+'</span></div><div class="qprompt" style="white-space:pre-wrap;margin-top:10px">'+q[2]+'</div><div class="opts" id="mxOpts"></div><div class="ans" id="mxAns"></div>';q[3].forEach((o,i)=>{let b=document.createElement('button');b.className='opt';b.textContent=(i+1)+'. '+o;b.onclick=()=>mxAnswer(i,b);$('mxOpts').appendChild(b)});$('mxProgress').textContent='题库 '+p.length+' 题｜优先抽取未做题'}
function mxAnswer(i,b){if(!mxCurrent)return;let q=mxCurrent.q;[...$('mxOpts').children].forEach(x=>x.disabled=true);mxDone++;if(i===q[4]){mxCorrect++;b.classList.add('ok')}else{b.classList.add('no');$('mxOpts').children[q[4]].classList.add('ok')}if(!mxSeen.includes(mxCurrent.i))mxSeen.push(mxCurrent.i);localStorage.setItem('jlptMockSeenV1',JSON.stringify(mxSeen));$('mxAns').textContent='解析：'+q[5];$('mxAns').classList.add('show');$('mxDone').textContent=mxDone;$('mxCorrect').textContent=mxCorrect}
$('mxNext').onclick=mxShow;$('mxReset').onclick=()=>{mxDone=mxCorrect=0;$('mxDone').textContent=0;$('mxCorrect').textContent=0;mxShow()};$('mxLevel').onchange=mxShow;$('mxType').onchange=mxShow;mxShow();\n`;
html=html.replace('// 导航和初始化',js+'// 导航和初始化');
return html;
}catch(e){return html}
};