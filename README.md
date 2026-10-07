# 世说新语·名士风云

一个以《世说新语》和魏晋名士文化为主题的纯静态网页小游戏。玩家通过阅读原文、译文和语境提示，完成“隐逸”“官场”两条研学线路。

代码仓库：[github.com/Moogg000/ShiShuo-Game](https://github.com/Moogg000/ShiShuo-Game/)

## 游戏功能

- 首页使用固定的 `assets/images/bg.png` 背景。
- 线路总览页和具体答题页每次打开随机选择一张非首页背景图。
- 游戏只保留两条线路：隐逸、官场；每条线路包含三道题。
- 题目内容（原文、译文、选项、答案、解析、名士建议）统一存放在 `data/routes.json` 中，答题页由 `js/route.js` 读取并动态渲染。
- 提交答案后才显示当前句子的翻译和题目讲解；完成当前题目后，非最后一题显示“下一题”按钮。
- 答对一题增加 6 点风度；答错显示解析，但不增加风度。
- 风度值通过浏览器 `localStorage` 保存，在刷新页面和切换线路后保持一致。
- 每条线路的答题结果通过浏览器 `localStorage` 保存，刷新后会恢复进度，已完成的题目不会重复奖励风度。
- 请教名士每次消耗 3 点风度，并在当前页面即时显示针对当前题目的建议。
- 三道题全部完成后显示答对数量、正确率和“返回首页”链接，不再循环答题。
- 不设战力、排行榜或抽卡，重点是理解文本。

## 页面入口

| 页面 | 说明 |
| --- | --- |
| `index.html` | 固定背景的游戏首页 |
| `start.html` | 随机背景的两条线路总览 |
| `mountain.html` | 隐逸线路，题目由数据文件动态渲染 |
| `court.html` | 官场线路，题目由数据文件动态渲染 |
| `intro.html` | 游戏介绍和代码仓库链接 |

## 项目结构

```text
ShiShuo-Game/
├── index.html                 # 游戏首页
├── start.html                 # 两条线路总览
├── mountain.html              # 隐逸线路题目
├── court.html                 # 官场线路题目
├── intro.html                 # 游戏介绍
├── config.json                # 全局配置（风度数值、背景图片）
├── data/
│   └── routes.json            # 题目数据（原文、译文、选项、答案、解析、名士建议）
├── css/
│   ├── style.css              # 样式入口，按层引入下列文件
│   ├── base.css               # 基础层：字体、变量、重置、按钮基础
│   ├── layout.css             # 布局层：页面骨架与栅格
│   ├── components.css         # 组件层：可复用界面组件
│   └── pages/                 # 页面层：各页面专属样式
│       ├── home.css           # 首页（index.html）
│       ├── start.css          # 线路总览页（start.html）
│       └── route.css          # 研学线路页（mountain/court.html）
├── js/
│   ├── config.js              # 配置加载器（读取 config.json，失败时回退默认值）
│   ├── main.js                # 首页固定背景、加载和入口逻辑
│   ├── state.js               # 跨页面共享的风度值
│   ├── start.js               # 线路总览随机背景
│   └── route.js               # 题目动态渲染、答案、解析、统计和名士请教逻辑
└── assets/
    ├── fonts/
    │   └── ChillJinshuSongRegular.woff   # Chill Jinshu Song 字体
    └── images/                 # 首页、线路和网站图标资源
```

## 预览方式

项目不需要 Node.js、Python、包管理器或其他额外应用，也没有构建步骤。

`config.json` 与 `data/routes.json` 通过 `fetch` 加载，需要通过 HTTP 服务预览：请在 VS Code 中使用 Live Preview 等“本地服务器”类预览功能打开 `index.html`，再从首页进入游戏。若直接以 `file://` 方式打开页面，浏览器会拦截本地数据请求，答题页会提示“题目数据加载失败”（此时游戏配置会回退到内置默认值）。

## 字体

项目使用 `assets/fonts/ChillJinshuSongRegular.woff`，这是 [Chill Jinshu Song](https://github.com/Warren2060/ChillJinshuSong) 字体。若后续增加生僻字，应单独制作或加载对应字体子集，并确认字体授权允许网页分发。

## 维护说明

- 页面文案使用简体中文，文件编码为 UTF-8。
- 首页背景由 `config.json` 的 `backgrounds.title` 控制；线路总览和答题页共享 `backgrounds.pages` 候选列表，不能把首页背景加入列表。
- 修改题目时，编辑 `data/routes.json` 中对应线路的条目即可，页面会自动渲染，无需改动 HTML 和 JS；每题的 `answer` 索引必须落在 `choices` 范围内。
- 修改风度初始值、答对奖励和请教消耗，编辑 `config.json` 的 `grace` 字段。
- 样式按层拆分：设计变量与重置改 `css/base.css`，骨架栅格改 `css/layout.css`，可复用组件改 `css/components.css`，页面专属样式改 `css/pages/`，各层通过 `css/style.css` 统一引入，页面只需引用 `style.css`。
- 修改风度逻辑时，应通过 `js/state.js` 操作，避免不同页面出现独立的风度值。