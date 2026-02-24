# Desktop Photos

技术栈：**Electron + React + TypeScript + CSS**

## 功能
- 首次启动空状态：「暂无图片，请导入」+「添加文件夹」按钮
- Native Folder Picker 选择本地目录
- 递归扫描常见图片格式：jpg/jpeg/png/webp/heic/heif/bmp/gif
- 时间戳提取优先级：EXIF DateTimeOriginal > 文件名正则 > 文件系统创建/修改时间
- 按时间戳降序排序，并按天（YYYY-MM-DD）分组展示时间线网格

## 从 GitHub 克隆到启动（Windows）

### 1. 准备环境
- 安装 [Node.js](https://nodejs.org/)（建议 LTS 18+，推荐 20+）
- 确认 npm 可用：

```bash
node -v
npm -v
```

### 2. 克隆仓库
将下面地址替换为你的实际仓库地址：

```bash
git clone <your-github-repo-url>
cd DesktopPhotos
```

### 3. 安装依赖
```bash
npm install
```

### 4. 启动开发环境
```bash
npm run dev
```

启动后会自动打开 Electron 窗口：
1. 点击「添加文件夹」
2. 选择本地图片目录
3. 应用会递归扫描并按时间线展示

### 5. 代码检查
```bash
npm run lint
```

### 6. 构建生产产物
```bash
npm run build
```

构建后输出：
- 渲染进程静态资源：`dist/`
- Electron 主进程代码：`dist-electron/`

## 常见问题
- **依赖安装失败（网络/权限）**：请检查 npm 源与公司网络策略，必要时配置镜像源。
- **扫描较慢**：首次扫描会递归读取目录并解析 EXIF，图片数量大时耗时会增加。
- **部分图片时间不准确**：应用按 `EXIF -> 文件名 -> 文件系统时间` 的顺序推断时间，若源图片信息缺失会回退。
