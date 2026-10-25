# 世说新语 · 编书人

一个以《世说新语》为底本的纯静态网页游戏。你扮演南朝宋临川王刘义庆的门客，受命编撰一部魏晋轶事集：游历建康—洛阳—山阳—会稽，亲闻九件《世说》轶事，做出**无对错、有立场**的应对，然后落笔——记或不记、记入哪一门。你的书稿由你的取舍而成，而"风声"（政治压力）贯穿全程：有些事，记下是要招祸的。

代码仓库：[github.com/Moogg000/ShiShuo-Game](https://github.com/Moogg000/ShiShuo-Game/)

## 玩法循环

每一件事经历四个阶段：**遇事**（情境叙述）→ **应对**（三选一，三种真实存在的解读立场，无对错）→ **后话**（知音或诤友名士引原典回应你的立场）→ **落笔**（记入《德行》《言语》《方正》《雅量》《任诞》《栖逸》其中一门，或不记）。

- **精神坐标**：开场"三试"把玩家放在三条魏晋轴线上（名教↔自然、情↔理、狂↔慎），依坐标匹配知音与诤友名士，游历中持续演变。
- **风声压力**：违碍条目直书 +2、微词 +1、留白 0。风声决定山阳之后的途中事件，以及书成之日是否被"请删"。
- **双维度结局**：你编成的书（目录 + 门类厚薄 + 编者按文言小传 + 知音诤友赠言），以及这本书的命运（全本呈上 / 有阙呈上 / 藏之名山）。

## 页面入口

| 页面 | 说明 |
| --- | --- |
| `index.html` | 首页（受命编书入口） |
| `origin.html` | 第一章 · 建康受命：问对、三试、定底色 |
| `journey.html` | 第二至五章 · 游历与复命（遇事→应对→后话→落笔、风声事件、终章抉择） |
| `ending.html` | 终章 · 书成：目录、编者按、书的命运 |
| `intro.html` | 游戏介绍 |
| `start.html` / `mountain.html` / `court.html` | 旧版研学答题（保留，数据在 `data/routes.json`） |

## 项目结构

```text
ShiShuo-Game/
├── index.html                 # 首页
├── origin.html                # 编书人 · 第一章（气质测试）
├── journey.html               # 编书人 · 游历主循环
├── ending.html                # 编书人 · 结局
├── intro.html                 # 游戏介绍
├── config.json                # 全局配置（旧玩法风度数值、背景图）
├── data/
│   ├── axes.json              # 三条精神轴线定义
│   ├── origin.json            # 开场问对与三试题
│   ├── sages.json             # 名士库（坐标、小传、言行原文）
│   ├── gates.json             # 门类表（德行…栖逸）
│   ├── events.json            # 事件库（九章、复命终章、落笔配置）
│   ├── pressure.json          # 风声压力配置（阈值、途中事件）
│   └── routes.json            # 旧版答题数据
├── css/
│   ├── style.css              # 样式入口，按层引入下列文件
│   ├── base.css / layout.css / components.css
│   └── pages/
│       ├── home.css / start.css / route.css
│       └── book.css           # 编书人三页样式
├── js/
│   ├── book.js                # 编书人：书稿存档（localStorage）与数据加载
│   ├── origin.js              # 第一章逻辑
│   ├── journey.js             # 游历/落笔/风声/终章逻辑
│   ├── ending.js              # 结局生成逻辑
│   └── main.js / start.js / route.js / state.js / config.js   # 首页与旧版玩法
└── assets/
    ├── fonts/
    │   └── ChillJinshuSongRegular.woff   # Chill Jinshu Song 字体
    └── images/
```

## 预览方式

项目不需要 Node.js、包管理器或构建步骤，但数据经 `fetch` 加载，必须通过本地 HTTP 服务预览：在 VS Code 中用 Live Preview 等方式打开 `index.html`（或 `python -m http.server`）。直接以 `file://` 打开时浏览器会拦截本地数据请求，页面会提示数据加载失败。

## 内容维护

- **加一件事**：在 `data/events.json` 的 `events` 里新增条目（含三种立场选择、各自的名士后话与引文），并在对应 `chapters[].events` 里登记 id，页面自动渲染。`censored: true` 的事件会走"直书/微词/留白"三选项并计入风声。
- **加一位名士**：在 `data/sages.json` 新增条目（三条轴取值 -3..3、小传、言行引文即可），他会自动参与知音/诤友匹配。
- **调风声数值**：`data/pressure.json`（上限、阈值）与 `data/events.json` 的 `record.pressureLabels`。
- 旧版答题玩法仍可用：编辑 `data/routes.json`，入口在 `start.html`。
- 存档 key：`shishuo-book-v1`（新玩法）与 `shishuo-grace` / `shishuo-results-*`（旧玩法）。

## 设计说明

无对错判定是这个游戏的根基：选项是三种学术上各有依据的解读立场，名士后话引的每条原文均注明出处（《世说新语》《晋书》或诗文原篇）。机制尽量从书本身长出来——三十六门类是结局骨架，刘义庆招门客著书以避祸的史实是"风声"主线的出处。

## 字体

项目使用 `assets/fonts/ChillJinshuSongRegular.woff`，即 [Chill Jinshu Song](https://github.com/Warren2060/ChillJinshuSong) 字体。若后续增加生僻字，应单独制作或加载对应字体子集，并确认字体授权允许网页分发。
