window.applyDailyPatch=function(html){
  try{
    if(!html||html.includes('data-p="daily"')) return html;
    const btn='<button data-p="daily">💬 日常</button>';
    const section='<section id="daily" class="sec"><div class="card" style="padding:0;overflow:hidden"><iframe src="daily.html?v=1" title="日常日语 10K" loading="lazy" style="display:block;width:100%;height:80vh;min-height:720px;border:0;background:#0b1020"></iframe></div></section>';
    html=html.replace(/(<div class="nav">[\s\S]*?)(<\/div>\s*<section id="vocab")/,'$1'+btn+'$2');
    html=html.replace('<section id="grammar"',section+'<section id="grammar"');
    html=html.replace('N5 → N1｜单词・语法・刷题・听力・播客・阅读','N5 → N1｜单词・语法・刷题・听力・播客・阅读・日常日语');
    html=html.replace('＋语法学习＋10,000 道刷题中心。','＋语法学习＋10,000 道刷题中心＋日常日语 10K。');
    const css='<style>.nav{grid-template-columns:repeat(7,1fr)!important}#daily .card{background:#0b1020}@media(max-width:860px){.nav{grid-template-columns:repeat(4,1fr)!important}}@media(max-width:600px){.nav{grid-template-columns:repeat(3,1fr)!important}#daily iframe{min-height:680px!important;height:82vh!important}}</style>';
    html=html.replace('</head>',css+'</head>');
    return html;
  }catch(e){return html}
};