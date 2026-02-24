import { useMemo, useState } from 'react';
import { TimelineGrid } from './components/TimelineGrid';

export function App() {
  const [groups, setGroups] = useState<TimelineGroup[]>([]);
  const [folderPath, setFolderPath] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const isEmpty = useMemo(() => groups.length === 0, [groups.length]);

  const onAddFolder = async () => {
    const selectedPath = await window.albumApi.pickFolder();
    if (!selectedPath) {
      return;
    }

    setLoading(true);
    setFolderPath(selectedPath);

    try {
      const nextGroups = await window.albumApi.scanFolder(selectedPath);
      setGroups(nextGroups);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <h1>本地相册</h1>
          <p>{folderPath ? `当前目录：${folderPath}` : '请选择一个图片目录开始浏览'}</p>
        </div>
        <button type="button" onClick={onAddFolder} disabled={loading}>
          {loading ? '扫描中...' : '添加文件夹'}
        </button>
      </header>

      {isEmpty ? (
        <section className="empty-state">
          <h2>暂无图片，请导入</h2>
          <p>点击下方按钮选择本地文件夹，应用会自动递归扫描并按时间线展示。</p>
          <button type="button" onClick={onAddFolder} disabled={loading}>
            {loading ? '扫描中...' : '添加文件夹'}
          </button>
        </section>
      ) : (
        <TimelineGrid groups={groups} />
      )}
    </main>
  );
}
