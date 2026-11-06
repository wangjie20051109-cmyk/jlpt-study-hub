/* Shared Japanese display, audio, and local study events. Loaded before page scripts. */
(function () {
  'use strict';

  const storage = 'jlptStudyLoopV1';
  const preference = 'jlptStudyFuriganaV1';
  const safe = value => String(value ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[c]);
  const day = (date = new Date()) => new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Asia/Tokyo', year: 'numeric', month: '2-digit', day: '2-digit'
  }).format(date);
  const shift = (date, days) => new Date(Date.parse(date + 'T00:00Z') + days * 86400000).toISOString().slice(0, 10);
  function read(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key) ?? 'null') ?? fallback; }
    catch { return fallback; }
  }
  function write(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; }
    catch { return false; }
  }
  function state() {
    const data = read(storage, {});
    return { days: data.days || {}, review: data.review || {}, favorites: data.favorites || {} };
  }
  function update(change) {
    const data = state();
    change(data);
    const saved = write(storage, data);
    if (!saved) document.dispatchEvent(new Event('jlpt-save-error'));
    return saved;
  }
  function entry(data, date) {
    return data.days[date] ||= { done: {}, answers: 0, correct: 0, reviewed: 0 };
  }
  function submit(id, correct, { task, selected, review = false, date = day() } = {}) {
    return update(data => {
      const row = entry(data, date);
      row.answers++;
      row.correct += Number(correct);
      if (task) {
        row.done[task] = id;
        (row.selections ||= {})[task] = selected;
      }
      if (review) row.reviewed++;

      const old = data.review[id];
      if (correct && ((!old && !review) || (old && (old.due > Date.now() || old.stage >= 6)))) return;
      const stage = correct ? (old?.stage || 0) + 1 : 0;
      const interval = [0, 1, 3, 7, 14, 30];
      const due = stage
        ? Date.parse(shift(date, interval[Math.min(stage, 5)]) + 'T00:00:00+09:00')
        : Date.now() + (review ? 10 * 60 * 1000 : 0);
      data.review[id] = { stage, due, last: date, attempts: (old?.attempts || 0) + 1 };
    });
  }
  function done(task, id, date = day()) {
    return update(data => { entry(data, date).done[task] = id; });
  }

  const loans = {
    アイドル: 'idol', アップ: 'up', アプリ: 'application', アルバイト: 'Arbeit（德语） · part-time job',
    イベント: 'event', インスタ: 'Instagram', インターネット: 'Internet', オンライン: 'online', カード: 'card',
    カフェ: 'café（法语） · café', カップル: 'couple', ガラス: 'glas（荷兰语） · glass', クラス: 'class',
    コンビニ: 'convenience store', コーヒー: 'koffie（荷兰语） · coffee', サイズ: 'size',
    サービス: 'service', システム: 'system', シャツ: 'shirt', スタッフ: 'staff',
    スマホ: 'smartphone', スケジュール: 'schedule', タイミング: 'timing', タクシー: 'taxi',
    チーム: 'team', チェック: 'check', チャンス: 'chance', テスト: 'test',
    データ: 'data', デート: 'date', トラブル: 'trouble', ニュース: 'news', バス: 'bus', バイト: 'Arbeit（德语） · part-time job',
    パソコン: 'personal computer', パン: 'pão（葡萄牙语） · bread', ビール: 'bier（荷兰语） · beer',
    プラン: 'plan', プロジェクト: 'project', ホテル: 'hotel', マスク: 'mask', ミス: 'miss',
    モデル: 'model', メール: 'mail', メモ: 'memo', メンバー: 'member', ページ: 'page', プレゼント: 'present',
    レストラン: 'restaurant', レポート: 'report', ボランティア: 'volunteer', ポイント: 'point'
  };
  const annotated = value => String(value ?? '').replace(/([\p{Script=Han}々]+)（([ぁ-ゖー]+)）/gu, '[$1|$2]');
  const plain = value => annotated(value).replace(/\[([^\]|]+)\|[^\]]+\]/g, '$1');
  const kana = value => annotated(value).replace(/\[[^\]|]+\|([^\]]+)\]/g, '$1');
  const loanHtml = value => safe(value).replace(/[ァ-ヺー]+/g, token => loans[token]
    ? token + '<span class="study-loan" lang="en"> (' + safe(loans[token]) + ')</span>' : token);
  function rich(value) {
    return annotated(value).split(/(\[[^\]|]+\|[^\]]+\])/g).map(part => {
      const match = part.match(/^\[([^\]|]+)\|([^\]]+)\]$/);
      return match ? '<ruby>' + loanHtml(match[1]) + '<rt>' + safe(match[2]) + '</rt></ruby>' : loanHtml(part);
    }).join('');
  }
  const hasFurigana = () => read(preference, true) !== false;
  function applyFurigana() {
    document.documentElement.classList.toggle('study-no-furigana', !hasFurigana());
    document.querySelectorAll('[data-furigana-toggle]').forEach(button => {
      button.textContent = hasFurigana() ? '带平假名' : '不带平假名';
      button.setAttribute('aria-pressed', String(hasFurigana()));
    });
  }
  function setFurigana(value) { write(preference, value); applyFurigana(); }
  document.addEventListener('click', event => {
    if (event.target.closest('[data-furigana-toggle]')) setFurigana(!hasFurigana());
  });
  window.addEventListener('storage', event => { if (event.key === preference) applyFurigana(); });
  applyFurigana();
  document.addEventListener('DOMContentLoaded', applyFurigana, { once: true });

  let player, utterance, timeout, generation = 0;
  function stop() {
    generation++;
    clearTimeout(timeout);
    if (player) { player.pause(); player = null; }
    window.speechSynthesis?.cancel();
    utterance = null;
  }
  function play(value, { audio, rate = 0.9, report = () => {} } = {}) {
    stop();
    const token = generation;
    const synth = window.speechSynthesis;
    const text = plain(value).trim();
    function fallback() {
      if (token !== generation) return;
      if (player) { player.pause(); player = null; }
      if (!text || !synth || !window.SpeechSynthesisUtterance) {
        report('此浏览器暂时无法播放。请打开 Safari 或 Chrome 重试。');
        return;
      }
      utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ja-JP';
      utterance.rate = rate;
      const voices = synth.getVoices().filter(voice => /^ja(?:[-_]|$)/i.test(voice.lang));
      if (voices.length) utterance.voice = voices.find(voice => voice.localService) || voices[0];
      utterance.onstart = () => { if (token === generation) { clearTimeout(timeout); report('正在播放设备日语语音'); } };
      utterance.onend = () => { if (token === generation) { clearTimeout(timeout); report('播放完成'); } };
      utterance.onerror = () => { if (token === generation) { clearTimeout(timeout); report('日语朗读失败。请检查设备的日语语音包后再次轻触。'); } };
      report('正在启动日语语音…');
      timeout = setTimeout(() => {
        if (token === generation) {
          stop();
          report('设备语音没有启动。请检查系统日语语音包或在系统浏览器重试。');
        }
      }, 4500);
      try { synth.speak(utterance); }
      catch { clearTimeout(timeout); report('无法启动日语语音，请重试。'); }
    }
    if (!audio) { fallback(); return; }
    const clip = new Audio(audio);
    player = clip;
    clip.playbackRate = rate;
    clip.onplaying = () => { if (token === generation) report('正在播放日语音频'); };
    clip.onended = () => { if (token === generation) report('播放完成'); };
    clip.onerror = () => { if (player === clip) fallback(); };
    report('正在加载日语音频…');
    clip.play().catch(() => { if (player === clip) fallback(); });
  }

  window.JLPT_STUDY = {
    storage, preference, read, write, state, update, day, shift, submit, done,
    safe, rich, plain, kana, hasFurigana, setFurigana, applyFurigana, play, stop
  };
})();
