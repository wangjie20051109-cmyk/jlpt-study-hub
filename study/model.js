import { words, listeningItems, readingItems } from './content.js?v=1';

const H = window.JLPT_STUDY;
const base = path => new URL('../' + path, import.meta.url).href;
const loads = new Map();
function script(path) {
  if (!loads.has(path)) {
    loads.set(path, new Promise((resolve, reject) => {
      const element = document.createElement('script');
      element.src = base(path);
      element.onload = resolve;
      element.onerror = () => reject(new Error(path));
      document.head.append(element);
    }).catch(error => { loads.delete(path); throw error; }));
  }
  return loads.get(path);
}

const oralKey = text => H.plain(text).replace(/[。！？!?\s～〜]/g, '').normalize('NFKC');
export const types = {
  vocab: '词汇', grammar: '语法', listening: '听力', reading: '阅读', kana: '汉字读音', writing: '汉字书写'
};
const practiceType = { reading: 'kana', writing: 'writing', grammar: 'grammar', vocab: 'vocab' };
const fromPractice = (q, source) => ({
  id: source + ':' + q.id, raw: q.id, source, type: practiceType[q.t] || 'grammar', level: q.l,
  question: q.q, translation: q.zh, answer: q.a, options: q.o,
  tip: q.tip, pattern: q.t === 'grammar' || source === 'grammar' ? q.o[q.a][0] : '',
  example: q.ex, exampleTranslation: q.exzh, mix: q.mix
});

const simpleGrammarIds = ['n2-01', 'n2-02', 'n2-03', 'n2-04', 'n2-05', 'n2-06', 'n2-07', 'n2-08', 'n2-09', 'n2-10'];
let grammar = [], youth = [], reviewReady = false;
const bank = new Map([...listeningItems, ...readingItems].map(question => [question.id, question]));
export async function prepareDaily() {
  if (grammar.length && youth.length) return;
  await Promise.all([script('grammar_data.js?v=20261019'), script('study/youth-data.js?v=1')]);
  const original = window.JLPT_GRAMMAR_BANK || [];
  for (const q of original) bank.set('grammar:' + q.id, fromPractice(q, 'grammar'));
  grammar = simpleGrammarIds.map(id => bank.get('grammar:' + id)).filter(Boolean);
  const groups = new Map();
  for (const item of window.JLPT_YOUTH_DATA || []) {
    const key = oralKey(item.jp);
    if (!groups.has(key)) groups.set(key, { ...item, ids: [] });
    groups.get(key).ids.push(item.id);
  }
  youth = [...groups.values()];
}

export async function prepareReview() {
  if (reviewReady) return;
  await prepareDaily();
  await Promise.all([
    script('practice_data_n2.js?v=20261016a'), script('practice_data_n3.js?v=20261016a'),
    script('practice_bulk_runtime.js?v=20261104zh1'), script('grammar_source_n2.js'),
    script('grammar_source_n3.js'), script('listening_data.js'), script('study/practice-original.js?v=1')
  ]);
  await script('grammar_bulk_runtime.js?v=20261104zh1');
  const practice = (window.JLPT_PRACTICE_ORIGINAL || []).slice();
  window.addJLPTBulkQuiz(practice);
  for (const q of practice) bank.set('practice:' + q.id, fromPractice(q, 'practice'));
  for (const q of window.buildJLPTGrammarBank()) bank.set('grammar:' + q.id, fromPractice(q, 'grammar'));
  for (const level of ['N2', 'N3']) {
    const rows = window['JLPT_BULK_' + level] || [];
    rows.forEach((row, index) => {
      const raw = level + '-' + index, id = 'audio-word:' + raw;
      const options = row[4].map(i => [rows[i][0], '', '', '[' + rows[i][0] + '|' + rows[i][1] + ']']);
      bank.set(id, { id, raw, source: 'audio-word', level, type: 'listening', question: '听音选词',
        options, answer: row[5], text: [['[' + row[0] + '|' + row[1] + ']']],
        speech: row[1], tip: '对照目标读音和每个选项的假名。' });
    });
  }
  for (const q of window.JLPT_LISTENING_QUESTIONS || []) {
    const id = 'listening:' + q.id;
    bank.set(id, {
      id, raw: q.id, source: 'listening', type: 'listening', level: q.l,
      question: q.ask, answer: q.a, options: q.opts.map(option => [option]),
      text: [[q.text]], tip: q.why
    });
  }
  reviewReady = true;
}
export const getQuestion = id => bank.get(id);

export function dailyPack(date = H.day()) {
  const index = Math.round(Date.parse(date + 'T00:00Z') / 86400000);
  const item = list => list[index % list.length];
  return {
    words: Array.from({ length: 3 }, (_, i) => words[(index * 3 + i) % words.length]),
    grammar: item(grammar), listening: item(listeningItems), reading: item(readingItems), speaking: item(youth)
  };
}

const wordKey = 'jlptWordsModuleV1', youthKey = 'jlptYouthV1';
export function wordProgress(id, rating, date) {
  const data = H.read(wordKey, { items: {}, days: {} });
  data.items ||= {};
  data.days ||= {};
  const old = data.items[id] || {};
  const intervals = { again: 10 / 1440, good: 3 };
  const goodCount = rating === 'good' ? (old.goodCount || 0) + 1 : 0;
  data.items[id] = { ...old, seen: true, mastered: goodCount >= 3, rating, goodCount, updatedAt: Date.now(),
    nextReview: Date.now() + intervals[rating] * 86400000 };
  data.days[date] = (data.days[date] || 0) + 1;
  return H.write(wordKey, data);
}
export function youthProgress(item, change) {
  const saved = H.read(youthKey, {});
  const records = item.ids.map(id => saved[id]).filter(Boolean);
  const latest = records.slice().sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')))[0];
  const current = {
    ...latest, seen: records.some(record => record.seen), fav: records.some(record => record.fav),
    reviewCount: Math.max(0, ...records.map(record => Number(record.reviewCount) || 0))
  };
  if (!change) return current;
  change(current);
  for (const id of item.ids) saved[id] = current;
  return H.write(youthKey, saved);
}

const keys = { grammar: 'jlptGrammarPracticeV1', practice: 'jlptPracticeV2State' };
function questionKey(source, id) {
  return (source === 'practice' && bank.has('grammar:' + id) ? 'grammar' : source) + ':' + id;
}
function positiveKeys(record) { return Object.keys(record || {}).filter(id => record[id]); }
export function legacyWrong() {
  const result = new Set();
  for (const [source, key] of Object.entries(keys)) {
    for (const id of positiveKeys(H.read(key, {}).wrong)) result.add(questionKey(source, id));
  }
  for (const id of H.read('jlptListeningExamWrongV1', [])) result.add('listening:' + id);
  for (const id of H.read('jlptListening1000V1', {}).wrong || []) result.add('audio-word:' + id);
  return result;
}
export function syncAnswer(question, selected) {
  const correct = selected === question.answer;
  if (question.source === 'listening' || question.source === 'audio-word') {
    const seenKey = 'jlptListeningExamSeenV1', wrongKey = 'jlptListeningExamWrongV1';
    const wordKey = 'jlptListening1000V1';
    const isWord = question.source === 'audio-word';
    const data = isWord ? H.read(wordKey, {}) : { seen: H.read(seenKey, []), wrong: H.read(wrongKey, []) };
    data.seen = [...new Set([...(data.seen || []), question.raw])];
    data.wrong = (data.wrong || []).filter(id => id !== question.raw);
    if (!correct) data.wrong.push(question.raw);
    return isWord ? H.write(wordKey, data) : H.write(seenKey, data.seen) && H.write(wrongKey, data.wrong);
  }
  if (question.source !== 'grammar' && question.source !== 'practice') return true;
  const data = H.read(keys[question.source], {});
  data.answers ||= {};
  data.wrong ||= {};
  data.answers[question.raw] = { selected, correct, at: Date.now() };
  if (correct) delete data.wrong[question.raw];
  else data.wrong[question.raw] = true;
  const saved = H.write(keys[question.source], data);
  if (!saved || question.source !== 'grammar' || !/^n[23]-\d{2}$/.test(question.raw)) return saved;
  const legacy = H.read(keys.practice, {});
  legacy.answers ||= {};
  legacy.wrong ||= {};
  legacy.answers[question.raw] = data.answers[question.raw];
  legacy.wrong[question.raw] = !correct;
  return H.write(keys.practice, legacy);
}
export function savedQuestion(q) {
  if (!q) return false;
  if (!keys[q.source]) return !!H.state().favorites[q.id];
  const data = H.read(keys[q.source], {});
  return !!data[q.source === 'grammar' ? 'favorites' : 'star']?.[q.raw] ||
    (q.source === 'grammar' && !!H.read(keys.practice, {}).star?.[q.raw]);
}
export function saveQuestion(q) {
  const favorited = savedQuestion(q);
  if (!keys[q.source]) return H.update(data => {
    if (favorited) delete data.favorites[q.id];
    else data.favorites[q.id] = true;
  });
  const key = keys[q.source], field = q.source === 'grammar' ? 'favorites' : 'star';
  const data = H.read(key, {});
  data[field] ||= {};
  data[field][q.raw] = !favorited;
  if (q.source === 'grammar' && favorited) {
    const previous = H.read(keys.practice, {});
    if (previous.star?.[q.raw]) {
      delete previous.star[q.raw];
      if (!H.write(keys.practice, previous)) return false;
    }
  }
  return H.write(key, data);
}
export function favorites() {
  const questions = new Set(positiveKeys(H.state().favorites));
  for (const [source, key] of Object.entries(keys)) {
    const data = H.read(key, {});
    for (const id of positiveKeys(data[source === 'grammar' ? 'favorites' : 'star'])) {
      questions.add(questionKey(source, id));
    }
  }
  return {
    questions: [...questions],
    words: Object.entries(H.read(wordKey, {}).items || {}).filter(([, item]) => item?.starred).map(([id]) => id),
    youth: youth.filter(item => youthProgress(item).fav)
  };
}
export function reviewRows() {
  const records = H.state().review;
  const ids = new Set([...legacyWrong(), ...Object.keys(records)]);
  return [...ids].map(id => ({
    id, question: getQuestion(id), ...records[id],
    due: records[id]?.due ?? 0,
    stage: records[id]?.stage || 0,
    type: getQuestion(id)?.type || (id.startsWith('audio-word:') || id.startsWith('listening:') ? 'listening' : 'vocab')
  })).sort((a, b) => a.due - b.due);
}
export function history() {
  const days = H.state().days;
  const words = H.read(wordKey, {});
  const activity = new Set(Object.keys(days));
  for (const [date, count] of Object.entries(words.days || {})) if (count > 0) activity.add(date);
  for (const source of Object.values(keys)) {
    for (const answer of Object.values(H.read(source, {}).answers || {})) {
      if (answer?.at && Number.isFinite(new Date(answer.at).getTime())) activity.add(H.day(new Date(answer.at)));
    }
  }
  for (const item of Object.values(H.read(youthKey, {}))) if (item?.seen && item.date) activity.add(item.date);
  const today = H.day();
  let cursor = activity.has(today) ? today : H.shift(today, -1), streak = 0;
  while (activity.has(cursor)) { streak++; cursor = H.shift(cursor, -1); }
  return {
    days, activity, streak,
    wordCount: Object.values(words.items || {}).filter(item => item?.seen).length,
    answers: Object.values(days).reduce((n, row) => n + (row.answers || 0), 0),
    correct: Object.values(days).reduce((n, row) => n + (row.correct || 0), 0),
    reviewed: Object.values(days).reduce((n, row) => n + (row.reviewed || 0), 0)
  };
}
