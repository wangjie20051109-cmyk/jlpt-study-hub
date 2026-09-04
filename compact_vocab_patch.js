window.applyCompactVocabPatch=function(html){
  try{
    if(!html||html.includes('data-p="compactvocab"')) return html;
    const btn='<button data-p="compactvocab">📘 精编词汇</button>';
    const section='<section id="compactvocab" class="sec"><div class="card" style="padding:0;overflow:hidden"><iframe src="compact_vocab.html?v=20260904a" title="日本语精编词汇" loading="lazy" style="display:block;width:100%;height:82vh;min-height:720px;border:0;background:#0b1020"></iframe></div></section>';
    html=html.replace(/(<div class="nav">[\s\S]*?)(<\/div>\s*<section id="vocab")/,'$1'+btn+'$2');
    html=html.replace('<section id="grammar"',section+'<section id="grammar"');
    html=html.replace('N5 → N1｜单词・语法・刷题・听力・播客・阅读','N5 → N1｜单词・精编词汇・语法・刷题・听力・播客・阅读');
    const css='<style>#compactvocab .card{background:#0b1020}@media(max-width:600px){#compactvocab iframe{min-height:680px!important;height:82vh!important}}</style>';
    html=html.replace('</head>',css+'</head>');
    return html;
  }catch(e){return html}
};