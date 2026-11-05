import { dailyPack, prepareDaily, prepareReview, getQuestion, types, wordProgress, youthProgress,
  syncAnswer, savedQuestion, saveQuestion, reviewRows, favorites, history } from './model.js?v=1';

const H = window.JLPT_STUDY, $ = id => document.getElementById(id);
const { safe, rich } = H;
const tasks = [
  ['words', '词汇', 'あ', 'red', '学习 3 个 N2 单词'],
  ['grammar', '语法', '文', 'purple', '做 1 题，核对四个选项'],
  ['listening', '听力', '耳', 'blue', '先听再答，最后核对原文'],
  ['reading', '阅读', '読', 'green', '读 1 篇短文，定位关键句'],
  ['speaking', '今日好き口语', '話', 'pink', '听一句、跟读、换场景说'],
  ['review', '错题复习', '↻', 'gold', '重做已到期的错题']
];
const links = {
  words: ['./words.html', '打开完整词库'], grammar: ['./grammar.html', '打开完整语法练习'],
  listening: ['./listening.html', '打开完整听力练习'], reading: ['./classic.html?section=read', '打开经典阅读题库'],
  speaking: ['./youth-notebook.html', '打开口语摘抄本']
};
const titles = Object.fromEntries(tasks.map(([id, title]) => [id, title]));
const home = $('study-home'), view = $('study-view'), error = $('study-error');
let date, pack, route = '', round = null, selected = null, submitted = false, wordIndex = 0;
let queue = [], queueIndex = 0, reviewed = 0;
const filters = { type: '', pattern: '', status: 'due' };
const intervals = [0, 1, 3, 7, 14, 30];
const readProgress = () => H.state().days[date] || { done: {}, wordIds: [] };
const maxStage = 6;
const isDue = row => row.stage < maxStage && row.due <= Date.now();
const dayFormat = value => new Intl.DateTimeFormat('zh-CN', {
  month: 'long', day: 'numeric', weekday: 'long', timeZone: 'Asia/Tokyo'
}).format(new Date(value + 'T12:00:00+09:00'));
const questionURL = id => '#question-' + encodeURIComponent(id);
function notice(message = '浏览器保存失败。请检查存储权限后再试。') {
  error.textContent = message;
  error.hidden = false;
}
function button(label, action, classes = '', attrs = '') {
  return '<button type="button" class="btn ' + classes + '" data-action="' + action + '" ' + attrs + '>' + label + '</button>';
}
function renderHome() {
  const result = history(), completed = readProgress().done, due = reviewRows().filter(isDue).length;
  const reviewToday = due > 0 || readProgress().reviewed > 0;
  const isDone = id => id === 'review' ? reviewToday && due === 0 : !!completed[id];
  const next = tasks.find(([id]) => (id !== 'review' || reviewToday) && !isDone(id));
  const count = tasks.filter(([id]) => isDone(id)).length;
  $('study-date').textContent = 'JLPT N2 · ' + dayFormat(date) + ' · 日本时间';
  const total = reviewToday ? tasks.length : tasks.length - 1;
  $('study-progress').textContent = count + ' / ' + total;
  $('study-bar').max = total;
  $('study-bar').value = count;
  $('study-streak').textContent = '连续学习 ' + result.streak + ' 天';
  $('study-next').href = next ? (next[0] === 'review' ? '#review' : '#learn-' + next[0]) : '#review';
  $('study-next').textContent = next ? (count > 0 || Object.keys(completed).length ? '继续今日学习 →' : '开始今日学习 →') : '今日任务已完成 · 查看错题 →';
  $('study-tasks').innerHTML = tasks.map(([id, title, icon, color, description]) => {
    const done = isDone(id), link = id === 'review' ? '#review' : '#learn-' + id;
    const remaining = id === 'words' && !done && readProgress().wordIds?.length
      ? '已学 ' + readProgress().wordIds.length + ' / 3 词' : description;
    const label = id === 'review' ? (due ? '到期 ' + due + ' 题' : '暂无到期') : done ? '✓ 完成' : '开始 ›';
    return '<a class="card study-task" href="' + link + '" aria-label="' + title + ' · ' + (id === 'review' && !reviewToday ? '暂无到期' : done ? '已完成' : '待完成') +
      '"><span aria-hidden="true" class="study-icon tone-' + color + '">' + icon + '</span><span><strong>' + title +
      '</strong><small>' + remaining + '</small></span><span>' + label + '</span></a>';
  }).join('');
  const stat = (number, label) => '<div class="stat"><strong>' + number + '</strong><span>' + label + '</span></div>';
  $('study-stats').innerHTML = '<div class="card study-stat-card"><div class="stats-grid">' +
    stat(result.wordCount, '已学词汇') + stat(result.reviewed, '累计复习次数') +
    stat(result.answers ? Math.round(result.correct / result.answers * 100) + '%' : '—', '新记录正确率') +
    '</div><div><strong>最近 7 天</strong><div class="study-calendar">' +
    Array.from({ length: 7 }, (_, i) => H.shift(date, i - 6)).map(key => '<span class="' +
      (result.activity.has(key) ? 'active' : '') + '" aria-label="' + key + (result.activity.has(key) ? ' 有学习' : ' 无学习') +
      '">' + key.slice(5).replace('-', '/') + '</span>').join('') + '</div></div></div>';
}
function heading(title, subtitle = '') {
  return '<div class="study-view-head"><a class="btn ghost" href="#">‹ 今日任务</a><h1 tabindex="-1">' +
    title + '</h1>' + (subtitle ? '<p class="muted">' + subtitle + '</p>' : '') + '</div>';
}
function more(type) {
  const [path, label] = links[type] || [];
  return path ? '<a class="btn ghost" href="' + path + '">' + label + ' ↗</a>' : '';
}
function pronunciation(label = '▶ 播放发音', action = 'play') {
  return '<div class="actions">' + button(label, action) + button('停止', 'stop') +
    '</div><p class="study-audio-status" role="status" aria-live="polite"></p>';
}
function translation(text) { return text ? '<p>' + safe(text) + '</p>' : ''; }
function passage(text, translate) {
  return text.map(([jp, zh]) => '<div><p lang="ja">' + rich(jp) + '</p>' + (translate ? translation(zh) : '') + '</div>').join('');
}
function renderWords() {
  const row = readProgress(), word = pack.words[wordIndex];
  const complete = row.done.words || !word;
  view.innerHTML = heading('每日词汇', '先听词和例句，再选熟悉程度。学习状态同步到原词库。') +
    '<article class="card study-study-card">' + (complete
      ? '<h2>今天的 3 个词已学完</h2><div class="actions"><a class="btn primary" href="#">返回今日任务</a>' + more('words') + '</div>'
      : '<p class="study-count">第 ' + (wordIndex + 1) + ' / 3 词</p><h2 lang="ja">' + rich(word[1]) + '</h2>' +
        translation(word[2]) + '<div class="study-paper"><p lang="ja">' + rich(word[3]) + '</p>' + translation(word[4]) + '</div>' +
        '<div class="actions">' + button('▶ 单词', 'play-word') + button('▶ 例句', 'play-example') + button('停止', 'stop') +
        '<a class="btn" href="./word-detail.html?id=n2-' + word[0] + '">词条与收藏</a></div><p class="study-audio-status" role="status"></p>' +
        '<div class="actions">' + button('再练一次', 'word-again') + button('记住了', 'word-good', 'primary') + '</div>') + '</article>';
}
function renderSpeaking() {
  const item = pack.speaking, progress = youthProgress(item);
  const source = /^https:\/\//.test(item.src || '') ? '<a class="btn" href="' + safe(item.src) + '">查看出处 ↗</a>' : '';
  view.innerHTML = heading('<span lang="ja">' + rich('[今日|きょう]、[好|す]きになりました。') + '</span> · 跟读', '听原句，跟读两遍，再试着说出自己的版本。') +
    '<article class="card study-study-card"><p class="study-count">' + safe(item.cat) + ' · ' + safe(item.type) +
    ' · ' + safe(item.episode) + '</p><h2 lang="ja">' + rich(item.jp) + '</h2>' + translation(item.zh) +
    pronunciation('▶ 播放口语') + '<div class="study-paper"><h3>更礼貌的说法</h3><p lang="ja">' + rich(item.polite) +
    '</p><h3>换一个情境说</h3><p>' + rich(item.practice) + '</p></div><p>' + rich(item.detail) +
    '</p><div class="actions">' + button(progress.fav ? '★ 已收藏' : '☆ 收藏表达', 'save-youth', '', 'aria-pressed="' +
      progress.fav + '"') + source + more('speaking') + '</div><div class="actions" style="margin-top:12px">' +
    (readProgress().done.speaking ? '<a class="btn primary" href="#">已完成 · 返回今日任务</a>' : button('我已完成跟读', 'speaking-done', 'primary')) +
    '</div></article>';
}
function renderQuestion() {
  const q = round;
  const inQueue = route === 'queue';
  const correct = submitted && selected === q.answer;
  const favorited = savedQuestion(q);
  const name = inQueue ? '错题复习' : route.startsWith('learn-') ? '每日' + titles[route.slice(6)] : '题目详情';
  view.innerHTML = heading(name) + (inQueue ? '<p><a class="btn ghost" href="#review">返回错题本</a></p>' : '') + '<article class="card study-study-card">' +
    '<div class="actions"><span class="chip">' + safe(q.level) + ' · ' + types[q.type] + '</span>' +
    (inQueue ? '<span class="chip">第 ' + (queueIndex + 1) + ' / ' + queue.length + ' 题</span>' : '') +
    button(favorited ? '★ 已收藏' : '☆ 收藏', 'save-question', '', 'aria-pressed="' + favorited + '"') + '</div>' +
    (q.type === 'reading' ? '<div class="study-paper">' + passage(q.text, false) + '</div>' : '') +
    '<h2 lang="ja" style="margin-top:14px">' + rich(q.question) + '</h2>' +
    (q.type === 'listening' ? pronunciation('▶ 播放听力') : '') +
    (!submitted && !inQueue && q.translation
      ? '<details class="study-paper"><summary>查看题干中文</summary>' + translation(q.translation) + '</details>' : '') +
    '<div class="study-options" aria-label="选项">' + q.options.map(([jp, zh], i) =>
      '<button type="button" class="study-option' + (submitted ? (i === q.answer ? ' right' : i === selected ? ' wrong' : '') : '') +
      '" data-choice="' + i + '" aria-pressed="' + (i === selected) + '" ' + (submitted ? 'disabled' : '') + '><strong>' + (i + 1) +
      '</strong><span><span lang="ja" class="study-option-jp">' + rich(jp) + '</span>' +
      (submitted && zh ? '<small>' + safe(zh) + '</small>' : '') + '</span></button>').join('') + '</div>' +
    (!submitted ? button('提交答案', 'submit', 'primary', selected === null ? 'disabled' : '') :
      '<div id="study-feedback" class="study-feedback" tabindex="-1" role="status"><strong>' +
      (correct ? '✓ 回答正确' : '✕ 回答错误，已加入复习') + ' · 正确答案 ' + (q.answer + 1) + '</strong>' +
      (q.pattern ? '<p>考点 · <span lang="ja">' + rich(q.pattern) + '</span></p>' : '') +
      (q.translation ? translation(q.translation) : '') + (q.tip ? '<p>' + rich(q.tip) + '</p>' : '') +
      (inQueue ? '<p>下次复习 · ' + safe(dueLabel(H.state().review[q.id])) + '</p>' : '') + '</div>' +
      (q.text ? '<div class="study-paper"><h3>原文与逐句翻译</h3>' + passage(q.text, true) + '</div>' : '') +
      '<h3>逐项解析</h3><ol>' + q.options.map(([jp, zh, why, annotated], i) => '<li><span lang="ja">' + rich(annotated || jp) +
        '</span>' + (zh ? ' · ' + safe(zh) : '') + (why ? '<p>' + rich(why) + '</p>' : '') +
        (i === q.answer ? ' ✓' : '') + '</li>').join('') + '</ol>' +
      (q.example ? '<div class="study-paper"><h3>例句</h3><p lang="ja">' + rich(q.example) + '</p>' +
        translation(q.exampleTranslation) + pronunciation('▶ 朗读例句', 'play-example') + '</div>' : '') +
      (q.mix ? '<p>易混点 · ' + rich(q.mix) + '</p>' : '') +
      (['listening', 'audio-word'].includes(q.source) ? '<p class="notice">原站听力题的中文翻译和注音仍在补充。</p>' : '') +
      '<div class="actions">' + (inQueue ? button('继续复习 →', 'next-review', 'primary')
        : '<a class="btn primary" href="#">返回今日任务</a>' + (route.startsWith('learn-') ? button('再练一次', 'retry') : '<a class="btn ghost" href="#review">返回错题本</a>') + more(route.slice(6))) + '</div>') + '</article>';
}
function dueLabel(row) {
  if (!row || isDue(row)) return '现在可复习';
  if (row.stage >= maxStage) return '已掌握';
  if (!row.stage) return '约 10 分钟后';
  return H.day(new Date(row.due)) + ' · ' + intervals[row.stage] + ' 天间隔';
}
function selector(id, label, options) {
  return '<label>' + label + '<select id="filter-' + id + '" data-filter="' + id + '">' + options.map(([value, name]) =>
    '<option value="' + safe(value) + '" ' + (filters[id] === value ? 'selected' : '') + '>' + safe(name) + '</option>').join('') +
    '</select></label>';
}
function legacyLink(id) {
  const [source, key] = id.split(':');
  if (source === 'audio-word') return './listening.html?tab=dictation';
  const level = /n3/i.test(key || '') ? 'N3' : 'N2';
  return './practice.html?mode=wrong&level=' + level + '&focus=' + encodeURIComponent(key || '');
}
function listrow(id, description) {
  const q = getQuestion(id);
  return '<a class="listrow" href="' + (q ? questionURL(id) : legacyLink(id)) + '"><span style="flex:1;min-width:0">' +
    '<strong class="name">' + (q ? rich(q.question) : '原站记录 · ' + safe(id.split(':').pop())) + '</strong>' +
    '<span class="desc" style="display:block">' + description + '</span></span><span aria-hidden="true">›</span></a>';
}
function reviewSelection(rows) {
  return rows.filter(row => (!filters.type || row.type === filters.type) &&
    (!filters.pattern || H.plain(row.question?.pattern) === filters.pattern) &&
    (filters.status === 'all' || (filters.status === 'due' ? isDue(row) : filters.status === 'planned'
      ? row.stage < maxStage && !isDue(row) : row.stage >= maxStage)));
}
function renderReview() {
  const rows = reviewRows(), filtered = reviewSelection(rows), available = filtered.filter(row => row.question && isDue(row));
  const patterns = [...new Set(rows.map(row => H.plain(row.question?.pattern)).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'ja'));
  const due = rows.filter(isDue).length, mastered = rows.filter(row => row.stage >= maxStage).length;
  view.innerHTML = heading('错题本', '先重做，再看解析。答对后自动安排下次复习，答错约 10 分钟后再出现。') +
    '<article class="card study-study-card"><p><strong>到期 ' + due + ' 题 · 已掌握 ' + mastered + ' / ' + rows.length +
    ' 题</strong>　今天已复习 ' + (readProgress().reviewed || 0) + ' 次</p>' +
    '<div class="study-filters">' + selector('type', '题型', [['', '全部题型'], ...Object.entries(types)]) +
    selector('pattern', '语法点', [['', '全部语法点'], ...patterns.map(pattern => [pattern, pattern])]) +
    selector('status', '复习状态', [['due', '已到期'], ['planned', '已安排'], ['mastered', '已掌握'], ['all', '全部']]) +
    '</div>' + button('开始复习 · ' + available.length + ' 题', 'start-review', 'primary', available.length ? '' : 'disabled') +
    '<div class="list study-review-list">' + (filtered.length ? filtered.map(row => listrow(row.id, types[row.type] +
      ' · ' + dueLabel(row) + (row.stage && row.stage < maxStage ? ' · ' + row.stage + ' / ' + maxStage + ' 次连续答对' : ''))).join('')
      : '<p class="empty">这里暂无匹配的错题。</p>') + '</div><div class="actions">' +
    '<a class="btn ghost" href="./practice.html?mode=wrong">原考试错题</a>' +
    '<a class="btn ghost" href="./listening.html?tab=quiz">原听力练习</a></div></article>';
}
function renderFavorites() {
  const saved = favorites();
  view.innerHTML = heading('我的收藏', '原词库、刷题、语法和口语收藏集中查看。') +
    '<article class="card study-study-card"><h2>试题 · ' + saved.questions.length + '</h2><div class="list">' +
    (saved.questions.map(id => listrow(id, '已收藏 · 点击打开')).join('') || '<p class="muted">暂无收藏试题。</p>') +
    '</div><h2>词汇 · ' + saved.words.length + '</h2><div class="list">' +
    (saved.words.map(id => {
      const [level, index] = id.split('-');
      const word = window['JLPT_BULK_' + level.toUpperCase()]?.[Number(index)];
      return word ? '<a class="listrow" href="./word-detail.html?id=' + encodeURIComponent(id) + '"><span lang="ja">' +
        rich('[' + word[0] + '|' + word[1] + ']') + '</span><span>↗</span></a>' : '';
    }).join('') || '<p class="muted">暂无收藏词汇。</p>') + '</div><h2>口语 · ' + saved.youth.length + '</h2><div class="list">' +
    (saved.youth.map(item => '<a class="listrow" href="./youth-notebook.html?focus=' + encodeURIComponent(item.id) +
      '"><span lang="ja">' + rich(item.jp) + '</span></a>').join('') || '<p class="muted">暂无收藏口语。</p>') + '</div></article>';
}
function resetQuestion(question) {
  round = question;
  selected = null;
  submitted = false;
}
function renderQueue() {
  const question = getQuestion(queue[queueIndex]);
  if (question) { resetQuestion(question); renderQuestion(); return; }
  round = null;
  view.innerHTML = heading('这一轮复习完成') + '<article class="card study-study-card"><h2>完成 ' + reviewed +
    ' / ' + queue.length + ' 题</h2><p>下次复习时间已更新。</p><div class="actions"><a class="btn primary" href="#review">返回错题本</a>' +
    '<a class="btn" href="#">返回今日任务</a></div></article>';
}
function refreshDate() {
  const now = H.day();
  if (date === now) return false;
  date = now;
  pack = dailyPack(date);
  return true;
}
async function navigate() {
  const target = location.hash.slice(1);
  if (target === 'queue' && !queue.length) { location.replace('#review'); return; }
  H.stop();
  refreshDate();
  route = target;
  round = null;
  error.hidden = true;
  home.hidden = Boolean(target);
  view.hidden = !target;
  if (!target) { renderHome(); return; }
  if (target === 'queue') { renderQueue(); window.scrollTo(0, 0); view.querySelector('h1')?.focus(); return; }
  if (target === 'review' || target === 'favorites' || target.startsWith('question-')) {
    view.innerHTML = heading('正在载入学习记录…');
    try { await prepareReview(); }
    catch { notice('原站题库暂时无法载入。每日练习仍可使用。'); }
    if (location.hash.slice(1) !== target) return;
  }
  if (target === 'review') renderReview();
  else if (target === 'favorites') renderFavorites();
  else if (target === 'learn-words') {
    wordIndex = readProgress().wordIds?.length || 0;
    renderWords();
  } else if (target === 'learn-speaking') renderSpeaking();
  else {
    let q;
    try { q = target.startsWith('question-') ? getQuestion(decodeURIComponent(target.slice(9))) : pack[target.slice(6)]; }
    catch { q = null; }
    if (q?.options) {
      resetQuestion(q);
      const dailyTask = target.startsWith('learn-') ? target.slice(6) : null;
      const progress = readProgress();
      const previous = progress.selections?.[dailyTask];
      if (progress.done[dailyTask] === q.id && Number.isInteger(previous) && q.options[previous]) {
        selected = previous;
        submitted = true;
      }
      renderQuestion();
    } else view.innerHTML = heading('这个入口暂时没有题目。');
  }
  window.scrollTo(0, 0);
  view.querySelector('h1')?.focus({ preventScroll: true });
}
function answer() {
  if (submitted || selected === null || !round) return;
  const correct = selected === round.answer;
  const inQueue = route === 'queue';
  const reviewing = inQueue || (route.startsWith('question-') && reviewRows().some(row => row.id === round.id && isDue(row)));
  const task = route.startsWith('learn-') ? route.slice(6) : null;
  if (!H.submit(round.id, correct, { task, selected, review: reviewing, date })) return;
  if (!syncAnswer(round, selected)) notice();
  submitted = true;
  if (inQueue) reviewed++;
  renderQuestion();
  $('study-feedback').focus();
}
function play(action, clicked) {
  const word = pack.words[wordIndex];
  const article = clicked.closest('article');
  const status = clicked.closest('.study-paper')?.querySelector('.study-audio-status') || article?.querySelector('.study-audio-status');
  const report = message => { if (status?.isConnected) status.textContent = message; };
  if (action === 'stop') { H.stop(); report('播放已停止'); return; }
  if (route === 'learn-words') H.play(action === 'play-word' ? word[1] : word[3], { report });
  else if (route === 'learn-speaking') H.play(pack.speaking.jp, { report });
  else if (action === 'play-example') H.play(round.example, { report });
  else if (round?.text) H.play(round.speech || round.text.map(([jp]) => H.plain(jp)).join(' '), { audio: round.audio, rate: 1, report });
}
view.addEventListener('click', event => {
  const option = event.target.closest('[data-choice]');
  if (option && !submitted) {
    selected = Number(option.dataset.choice);
    for (const candidate of view.querySelectorAll('[data-choice]')) candidate.setAttribute('aria-pressed', String(candidate === option));
    view.querySelector('[data-action="submit"]').disabled = false;
    return;
  }
  const clicked = event.target.closest('[data-action]');
  if (!clicked) return;
  const action = clicked.dataset.action;
  if (action === 'submit') answer();
  else if (action === 'retry') { resetQuestion(round); renderQuestion(); view.querySelector('h1')?.focus(); }
  else if (action === 'start-review') {
    queue = reviewSelection(reviewRows()).filter(row => row.question && isDue(row)).map(row => row.id);
    if (!queue.length) { renderReview(); return; }
    queueIndex = reviewed = 0;
    location.hash = 'queue';
  } else if (action === 'next-review') {
    H.stop();
    queueIndex++;
    renderQueue();
    view.querySelector('h1')?.focus();
  } else if (action === 'save-question') {
    if (!saveQuestion(round)) { notice(); return; }
    const saved = savedQuestion(round);
    clicked.textContent = saved ? '★ 已收藏' : '☆ 收藏';
    clicked.setAttribute('aria-pressed', String(saved));
  } else if (action === 'save-youth') {
    const item = pack.speaking, favorite = !youthProgress(item).fav;
    if (!youthProgress(item, value => { value.fav = favorite; })) { notice(); return; }
    clicked.textContent = favorite ? '★ 已收藏' : '☆ 收藏表达';
    clicked.setAttribute('aria-pressed', String(favorite));
  } else if (action === 'speaking-done') {
    const item = pack.speaking;
    if (!youthProgress(item, value => {
      if (value.date !== date && value.nextDue && value.nextDue <= date) value.reviewCount++;
      value.seen = true;
      value.date = date;
      value.nextDue = H.shift(date, [1, 3, 7, 14][Math.min(value.reviewCount, 3)]);
    })) { notice(); return; }
    if (H.done('speaking', item.id, date)) renderSpeaking();
  } else if (action === 'word-again' || action === 'word-good') {
    const word = pack.words[wordIndex], id = 'n2-' + word[0];
    if (!wordProgress(id, action.slice(5), date)) { notice(); return; }
    if (H.update(data => {
      const progress = data.days[date] ||= { done: {}, answers: 0, correct: 0, reviewed: 0 };
      const ids = progress.wordIds ||= [];
      if (!ids.includes(id)) ids.push(id);
      if (ids.length >= pack.words.length) progress.done.words = true;
    })) {
      H.stop();
      wordIndex++;
      renderWords();
      view.querySelector('h1')?.focus({ preventScroll: true });
    }
  } else if (action.startsWith('play') || action === 'stop') play(action, clicked);
});
view.addEventListener('change', event => {
  const id = event.target.dataset.filter;
  if (route !== 'review' || !id) return;
  filters[id] = event.target.value;
  renderReview();
  $('filter-' + id)?.focus({ preventScroll: true });
});
document.addEventListener('jlpt-save-error', () => notice());
H.applyFurigana();
try {
  await prepareDaily();
  await navigate();
  window.addEventListener('hashchange', navigate);
  window.addEventListener('storage', () => { if (!route) renderHome(); });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { H.stop(); return; }
    if (!route || H.day() !== date) navigate();
  });
} catch {
  notice('今日任务加载失败，请刷新重试。四站入口仍可使用。');
}
