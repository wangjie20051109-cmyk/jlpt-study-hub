# 独立听力网站｜数据、音频和使用许可

本次功能重构：`listening.html` + `listening.js` + `listening_data.js`。

## 训练素材分类

1. **听力考试模拟题（10题）**：直接从本项目早已编写的 `jlpt_listening_exam_patch.js` 提取，保持原先题目ID、答案、题型及原存储键 `jlptListeningExamSeenV1`、`jlptListeningExamWrongV1`。题目为原创风格题，**不是 JLPT 官方历年真题**。
2. **跟读短文/句子（34条）**：直接从本项目旧 `shadowing_patch.js` 迁移，包括原有日语、平假名全文、中文译文与语法提醒。旧站的 `jlptShadowingSessionsV2` 记录不删除；新独立站记录保存在 `jlptListeningShadowV1`，两者不混淆。
3. **精听短句（781条不重复日语原句）**：使用此前已经接入本站的 `word_examples.js`，源自 [OpenJLPT](https://github.com/evanclan/OpenJLPT)，经此站词条ID和已存在的开源词汇表匹配后去除重复日语句子。原始例句采用 OpenJLPT 提供的源数据，遵守 [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) 及相关上游授权。若源数据有英文译文，显示为英文对照，不将英文伪称中文。

## 开源来源与致谢

- OpenJLPT：https://github.com/evanclan/OpenJLPT
- OpenJLPT 上游出处与完整条款：https://github.com/evanclan/OpenJLPT/blob/main/NOTICE.md
- JMdict（日本语词典）：https://www.edrdg.org/wiki/index.php/JMdict-EDICT_Dictionary_Project
- Tatoeba 日语例句及译文：https://tatoeba.org；句子通常按 [CC BY 2.0 FR](https://creativecommons.org/licenses/by/2.0/fr/) 使用。适用逐条原始贡献者署名时，应按 Tatoeba 原始条目补充完整署名。
- 外部延伸资料：[JLPT HVPT Trainer](https://github.com/RIKKA-ZZZ/jlpt-hvpt-trainer)（其 `hvpt_site/data/listening-lessons.json` 为可供了解的延伸数据源，数据含受 CC BY-SA 约束的词典字段；其生成音频使用 VOICEVOX，具有独立人物与声音授权）。**本网站没有复制 HVPT Trainer 音频**，只提供原项目外部入口。

## 音频说明

- 此独立站加载本项目既有 `audio_manifest.js`，若对应原文的哈希有匹配 MP3，则尝试播放已存在的站内 MP3。
- **不存在可匹配的录音时**，浏览器可使用本地 `speechSynthesis` 日语语音合成；此时清楚标记为“设备语音合成（非真人录音、非官方真题）”。浏览器缺少日语语音包时，某些句子可能无法正常朗读。不能把 TTS 视作 JLPT 原版音频。
- 外部仓库只有应用代码采用 MIT，并不意味着其第三方录音/文本可在本项目直接复制。代码许可证不覆盖音频与素材版权。

## 独立站和旧版之间的兼容

不修改或清空原本的本地听力考试错题和已做记录。新精听短句自评保存在 `jlptListeningDeepV1`，新跟读完成次数保存在 `jlptListeningShadowV1`。

这部分新增资源为**听力练习文本**，不代表对应数量的专业录制日语音频。已有文本在前端生成读音练习时不上传用户听写内容。
