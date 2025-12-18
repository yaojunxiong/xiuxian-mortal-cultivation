# 离线修仙小筑

一个完全静态的修仙主题小站，数据存放在仓库自带的 JSON 文件中，可直接在浏览器打开使用，无需后端与依赖。

## 快速开始
1. 克隆仓库后直接双击 `index.html`，或在本地开启一个静态服务器（如 `npx serve .`）。
2. 所有展示数据位于 `data/` 目录，可按需修改对应的 JSON 文件：
   - `profile.json`：修士档案与境界。
   - `techniques.json`：常用功法列表。
   - `expeditions.json`：游历时间轴。
   - `resources.json`：储物袋物品。
   - `journal.json`：静室日志。
3. 点击「模拟一次闭关」可为当前会话追加一条日志，点击「导出当前记事」会生成 `cultivation-notes.txt` 供备份。

## 目录结构
- `index.html`：页面结构。
- `style.css`：界面样式。
- `main.js`：数据读取与渲染逻辑。
- `data/`：可编辑的数据源。
- `export/`：预留的导出记录目录。

## 贡献
如需提交改动，请先本地预览，确保在离线环境下功能正常，然后提交 Pull Request。
