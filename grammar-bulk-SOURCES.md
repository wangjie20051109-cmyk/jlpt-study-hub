# 语法模块新增 1000 道开源数据衍生练习 — 来源及许可

## 题量与练习类型

此版本在原有 **25 道有完整中文精讲的语法题**之外新增 **1000 道**，现共 **1025 道**。

| 等级 | 例句语法辨认 | 语法含义辨析 | 新增总计 | 含原有精讲 |
| --- | ---: | ---: | ---: | ---: |
| N2 | 447 | 53 | 500 | 513 |
| N3 | 390 | 110 | 500 | 512 |
| 合计 | 837 | 163 | 1000 | 1025 |

新增练习依据 **279 个不同语法点（N2 149 / N3 130）**、**837 个互不重复的例句**制作。

- **例句语法辨认**：使用原资料例句，判断句子中对应的主要语法表达；部分可精准匹配的重点短语会以【】标示。因题型是辨认表达，难度与官方四选一填空题并不相同。
- **语法含义辨析**：从四个日语语法表达中，选出与给定中文简释最相符的一项；该题型不同于普通的句子填空。
- 四项均有对应的简明中文含义和模板化的选择理由，原数据另提供语法接续与原日语例句／英文参考译文。新增 **1000 题并不等于 1000 套完整人工审订的 JLPT 模拟听力／语法真题**。
- 原始语法数据明确标注 `review_status: draft`，**没有经过母语者逐条审核**，因此新生成的模拟题、语法等级与中文简释均有可能存在个别问题。原站右上角的「标记题目问题」可以保存反馈文本；标记不会自动发送给作者。
- 这批批量题暂未逐句加入中文翻译及每个汉字的假名；对应的英文翻译明确标示为「英文译文」。老的25道精讲题仍保留原有假名、中文译文、逐项精解格式。

## GitHub 来源和授权

原项目：**Japanese Language Data**，作者 Justin Kindrix 及贡献者。

- 代码仓库：https://github.com/jkindrix/japanese-language-data
- 数据源：https://github.com/jkindrix/japanese-language-data/tree/main/grammar-curated
- N2 原始 JSON：https://github.com/jkindrix/japanese-language-data/blob/main/grammar-curated/n2.json
- N3 原始 JSON：https://github.com/jkindrix/japanese-language-data/blob/main/grammar-curated/n3.json
- 原始许可：https://github.com/jkindrix/japanese-language-data/blob/main/LICENSE
- **Creative Commons Attribution-ShareAlike 4.0 International（CC BY-SA 4.0）**：https://creativecommons.org/licenses/by-sa/4.0/

## 本网站作出的修改

1. 从两份原始 JSON 中选取语法 ID、表达形式、语法含义、接续和三条原创例句，以及其原始英文译文。
2. 给279个语法点新增项目编写的 **简明中文用法**，作为四选项的中文说明；并将部分英文接续名词改写成中文描述。
3. 根据原语法点与例句，程序化组合为837道例句辨认题以及163道语法含义题，添加中文排除理由和本地学习进度支持。
4. 为确保不是靠复制同一题干凑题，837条辨认题均采用不同源例句，163条含义题采用不同的目标语法点；两种题型的提问目的不同。
5. 增加了新题优先练习的分组策略，以支持按等级逐步完成题库。

**署名与相同方式共享声明：** `grammar_source_n2.js`、`grammar_source_n3.js` 中的编排、中文简释及相关衍生练习数据按 **CC BY-SA 4.0** 与上游兼容的条款发布；复用这些数据或再创作时需继续保留上述署名、许可链接及修改说明。网页交互代码不因数据许可而自动更改自身既有授权。

## 与原学习数据兼容

- 原有 25 道题的 ID 保持不变，旧答题、收藏、错题和个人笔记不清除。
- 新增题使用 `bulk-grammar-n2-...` 和 `bulk-grammar-n3-...` 前缀的稳定 ID，并写入同一浏览器本地数据键 `jlptGrammarPracticeV1`。
- 「我的学习」页面现有的备份功能会同时导出本语法模块的数据。
