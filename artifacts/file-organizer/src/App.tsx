import { useEffect, useMemo, useState } from 'react';
import { 
  AlertTriangle,
  CalendarClock,
  Check,
  ChevronRight,
  CircleHelp,
  Clock3,
  FileArchive,
  FileImage,
  FileText,
  FolderOpen,
  FolderSearch,
  HardDrive,
  LayoutDashboard,
  Menu,
  Play,
  RefreshCw,
  ScanLine,
  Settings2,
  ShieldCheck,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import './index.css';

const API_BASE = '/organizer-api';

type FileItem = {
  path: string;
  name: string;
  size: number;
  modified_at?: string;
  kind?: string;
  planned_folder?: string;
};

type Category = { key: string; label: string; count: number; bytes: number; color?: string };
type DuplicateGroup = { hash: string; files: FileItem[]; wasted_bytes: number };
type ScanResult = {
  folder_path: string;
  scanned_at: string;
  total_files: number;
  total_bytes: number;
  categories: Category[];
  duplicate_groups: DuplicateGroup[];
  name_matches: { pattern: string; folder: string; files: FileItem[] }[];
  sample_files: FileItem[];
};
type OrganizeResult = {
  folder_path: string;
  moved_files: number;
  deleted_duplicates: number;
  skipped_files: number;
  errors: string[];
  summary: unknown;
};
type ScheduleConfig = {
  enabled: boolean;
  frequency: string;
  time: string;
  weekday: string;
  folder_path: string;
  last_run?: string | null;
  next_run?: string | null;
};
type Health = { status: string; service: string };
type BrowseResult = {
  current_path: string;
  parent_path: string | null;
  directories: { name: string; path: string }[];
};

async function api<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options?.headers ?? {}) },
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const message = payload && typeof payload === 'object' && 'detail' in payload
      ? String(payload.detail)
      : `Request failed (${response.status})`;
    throw new Error(message);
  }
  return payload as T;
}

function bytes(value: number = 0): string {
  if (!Number.isFinite(value) || value < 1024) return `${Math.round(value)} B`;
  const units = ['KB', 'MB', 'GB', 'TB'];
  let size = value / 1024;
  let unit = 0;
  while (size >= 1024 && unit < units.length - 1) { size /= 1024; unit += 1; }
  return `${size.toFixed(size >= 10 ? 0 : 1)} ${units[unit]}`;
}

function dateLabel(value?: string | null): string {
  if (!value) return 'Not yet';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(date);
}

function fileIcon(kind?: string) {
  if (kind?.toLowerCase().includes('image')) return <FileImage size={16} />;
  if (kind?.toLowerCase().includes('archive')) return <FileArchive size={16} />;
  return <FileText size={16} />;
}

function initialSchedule(): ScheduleConfig {
  return { enabled: false, frequency: 'weekly', time: '09:00', weekday: 'monday', folder_path: '' };
}

function App() {
  const [folderPath, setFolderPath] = useState('');
  const [recursive, setRecursive] = useState(true);
  const [includeHidden, setIncludeHidden] = useState(false);
  const [scan, setScan] = useState<ScanResult | null>(null);
  const [organizeResult, setOrganizeResult] = useState<OrganizeResult | null>(null);
  const [schedule, setSchedule] = useState<ScheduleConfig>(initialSchedule);
  const [health, setHealth] = useState<Health | null>(null);
  const [scanBusy, setScanBusy] = useState(false);
  const [organizeBusy, setOrganizeBusy] = useState(false);
  const [scheduleBusy, setScheduleBusy] = useState(false);
  const [scheduleLoading, setScheduleLoading] = useState(true);
  const [error, setError] = useState('');
  const [scheduleError, setScheduleError] = useState('');
  const [notice, setNotice] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [browseOpen, setBrowseOpen] = useState(false);
  const [browsePath, setBrowsePath] = useState('');
  const [browseResult, setBrowseResult] = useState<BrowseResult | null>(null);
  const [browseBusy, setBrowseBusy] = useState(false);
  const [browseError, setBrowseError] = useState('');

  useEffect(() => {
    api<Health>('/healthz').then(setHealth).catch(() => setHealth(null));
    api<ScheduleConfig>('/schedule')
      .then((value) => {
        setSchedule({ ...initialSchedule(), ...value });
        if (value.folder_path) setFolderPath(value.folder_path);
      })
      .catch(() => setScheduleError('Schedule settings could not be loaded. You can still scan manually.'))
      .finally(() => setScheduleLoading(false));
  }, []);

  const totalWasted = useMemo(
    () => scan?.duplicate_groups.reduce((sum, group) => sum + (group.wasted_bytes || 0), 0) ?? 0,
    [scan],
  );
  const duplicateFiles = useMemo(
    () => scan?.duplicate_groups.reduce((sum, group) => sum + Math.max(group.files.length - 1, 0), 0) ?? 0,
    [scan],
  );

  const showNotice = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(''), 4200);
  };

  async function openBrowser() {
    setBrowseOpen(true);
    setBrowseError('');
    setBrowseBusy(true);
    const startPath = folderPath.trim() || '/home/runner/workspace';
    try {
      const result = await api<BrowseResult>(`/browse?path=${encodeURIComponent(startPath)}`);
      setBrowsePath(result.current_path);
      setBrowseResult(result);
    } catch (caught) {
      setBrowseError(caught instanceof Error ? caught.message : 'This folder could not be opened.');
    } finally {
      setBrowseBusy(false);
    }
  }

  async function browseTo(path: string) {
    setBrowseBusy(true);
    setBrowseError('');
    try {
      const result = await api<BrowseResult>(`/browse?path=${encodeURIComponent(path)}`);
      setBrowsePath(result.current_path);
      setBrowseResult(result);
    } catch (caught) {
      setBrowseError(caught instanceof Error ? caught.message : 'This folder could not be opened.');
    } finally {
      setBrowseBusy(false);
    }
  }

  async function runScan(event?: { preventDefault: () => void }) {
    event?.preventDefault();
    if (!folderPath.trim()) {
      setError('Choose a folder path before scanning.');
      return;
    }
    setError('');
    setOrganizeResult(null);
    setScanBusy(true);
    try {
      const result = await api<ScanResult>('/scan', {
        method: 'POST',
        body: JSON.stringify({ folder_path: folderPath.trim(), recursive, include_hidden: includeHidden }),
      });
      setScan(result);
      showNotice(`Scan complete. ${result.total_files.toLocaleString()} files checked.`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'The folder could not be scanned.');
    } finally {
      setScanBusy(false);
    }
  }

  async function organize(deleteDuplicates: boolean, dryRun: boolean) {
    if (!folderPath.trim() || !scan) return;
    if (deleteDuplicates && !window.confirm('This will permanently delete duplicate copies after keeping one original per group. Continue?')) return;
    setError('');
    setOrganizeBusy(true);
    try {
      const result = await api<OrganizeResult>('/organize', {
        method: 'POST',
        body: JSON.stringify({
          folder_path: folderPath.trim(),
          recursive,
          include_hidden: includeHidden,
          delete_duplicates: deleteDuplicates,
          dry_run: dryRun,
        }),
      });
      setOrganizeResult(result);
      showNotice(dryRun ? 'Preview ready. No files were changed.' : 'Folder organized successfully.');
      if (!dryRun) await runScan();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'The organize action could not be completed.');
    } finally {
      setOrganizeBusy(false);
    }
  }

  async function saveSchedule(event: { preventDefault: () => void }) {
    event.preventDefault();
    setScheduleBusy(true);
    setScheduleError('');
    try {
      const value = await api<ScheduleConfig>('/schedule', {
        method: 'PUT',
        body: JSON.stringify({
          enabled: schedule.enabled,
          frequency: schedule.frequency,
          time: schedule.time,
          weekday: schedule.weekday,
          folder_path: schedule.folder_path || folderPath.trim(),
        }),
      });
      setSchedule({ ...initialSchedule(), ...value });
      showNotice('Schedule saved.');
    } catch (caught) {
      setScheduleError(caught instanceof Error ? caught.message : 'Schedule could not be saved.');
    } finally {
      setScheduleBusy(false);
    }
  }

  async function runNow() {
    setScheduleBusy(true);
    setScheduleError('');
    try {
      const result = await api<OrganizeResult>('/schedule/run-now', { method: 'POST' });
      setOrganizeResult(result);
      showNotice('Scheduled organization started.');
    } catch (caught) {
      setScheduleError(caught instanceof Error ? caught.message : 'The scheduled run could not start.');
    } finally {
      setScheduleBusy(false);
    }
  }

  function goTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setMobileOpen(false);
  }

  const statusText = health?.status === 'ok' ? 'Organizer connected' : 'Waiting for organizer';

  return (
    <div className="organizer-app">
      <div className="organizer-shell">
        <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
          <div className="flex items-center gap-3 px-2">
            <div className="brand-mark"><Sparkles size={18} strokeWidth={2.5} /></div>
            <span className="brand-name">Tidyline</span>
          </div>
          <div className="sidebar-label">Workspace</div>
          <button className="side-link active" onClick={() => goTo('overview')} data-testid="button-nav-overview">
            <LayoutDashboard size={16} /> Overview
          </button>
          <button className="side-link" onClick={() => goTo('duplicates')} data-testid="button-nav-duplicates">
            <ShieldCheck size={16} /> Duplicate review
            {duplicateFiles > 0 && <span className="ml-auto rounded-full bg-[hsl(var(--sidebar-primary)/.2)] px-2 py-0.5 text-[10px]">{duplicateFiles}</span>}
          </button>
          <button className="side-link" onClick={() => goTo('schedule')} data-testid="button-nav-schedule">
            <CalendarClock size={16} /> Schedule
          </button>
          <div className="sidebar-label">Helpful</div>
          <button className="side-link" onClick={() => showNotice('Scan a folder first to see what Tidyline finds.')} data-testid="button-nav-help">
            <CircleHelp size={16} /> How it works
          </button>
          <div className="side-footer">
            <div className="flex items-center gap-2 mb-2"><span className="status-dot" /> {statusText}</div>
            Tidyline keeps the original file in place, then makes the quiet work visible.
          </div>
        </aside>

        <main className="main">
          <header className="topbar">
            <div className="flex items-start gap-3">
              <button className="mobile-menu" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Open navigation" data-testid="button-mobile-menu">
                {mobileOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
              <div>
                <div className="eyebrow">File organization / Overview</div>
                <h1 className="hero-title">A calmer place<br />for your <em>files.</em></h1>
                <p className="hero-subtitle">See what is taking up space, understand every duplicate, and let the tidy-up happen on your terms.</p>
              </div>
            </div>
            <div className="top-status"><span className="status-dot" /> {statusText}</div>
          </header>

          <section className="workspace" id="overview">
            <div className="workspace-head">
              <div>
                <h2 className="workspace-title">Choose a workspace</h2>
                <p className="workspace-kicker">Start with Downloads, a project folder, or anywhere files tend to gather.</p>
              </div>
              <FolderOpen size={21} className="text-[hsl(var(--accent))]" />
            </div>
            <form className="path-form" onSubmit={runScan}>
              <input
                className="path-input"
                value={folderPath}
                onChange={(event) => setFolderPath(event.target.value)}
                placeholder="/Users/you/Downloads"
                aria-label="Folder path"
                data-testid="input-folder-path"
              />
              <button className="btn btn-quiet" type="button" onClick={openBrowser} data-testid="button-browse-folder">
                <FolderOpen size={16} /> Browse
              </button>
              <button className="btn btn-accent" type="submit" disabled={scanBusy} data-testid="button-scan">
                {scanBusy ? <RefreshCw className="animate-spin" size={16} /> : <ScanLine size={16} />}
                {scanBusy ? 'Scanning' : 'Scan folder'}
              </button>
            </form>
            <div className="controls">
              <label className="check-label"><input type="checkbox" checked={recursive} onChange={(event) => setRecursive(event.target.checked)} data-testid="checkbox-recursive" /> Include subfolders</label>
              <label className="check-label"><input type="checkbox" checked={includeHidden} onChange={(event) => setIncludeHidden(event.target.checked)} data-testid="checkbox-hidden" /> Include hidden files</label>
              <span className="ml-auto text-[11px] text-[hsl(var(--muted-foreground))]">Nothing moves during a scan.</span>
            </div>
            {error && <div className="alert alert-error"><AlertTriangle size={16} /> <span data-testid="status-error">{error}</span></div>}
            {organizeResult && (
              <div className="alert alert-success"><Check size={16} /> <span data-testid="status-organize-result">
                {organizeResult.moved_files} moved, {organizeResult.deleted_duplicates} duplicates removed, {organizeResult.skipped_files} skipped.
                {organizeResult.errors.length > 0 && ` ${organizeResult.errors.length} items need attention.`}
              </span></div>
            )}
            <div className="flex flex-wrap gap-2 px-6 pb-5 pt-4">
              <button className="btn btn-primary" onClick={() => organize(false, true)} disabled={!scan || organizeBusy} data-testid="button-preview-organize">
                <ChevronRight size={15} /> Preview organization
              </button>
              <button className="btn btn-quiet" onClick={() => organize(true, false)} disabled={!scan || organizeBusy} data-testid="button-organize">
                {organizeBusy ? <RefreshCw className="animate-spin" size={15} /> : <FolderSearch size={15} />} Organize &amp; clean duplicates
              </button>
            </div>
          </section>

          {!scan && scanBusy && (
            <div className="stats-grid" aria-label="Loading scan">
              {[1, 2, 3, 4].map((item) => <div className="stat-card" key={item}><div className="skeleton w-20" /><div className="skeleton mt-3 w-28 h-7" /></div>)}
            </div>
          )}

          {!scan && !scanBusy && (
            <div className="panel mt-6"><div className="empty-state">
              <div className="empty-icon"><HardDrive size={20} /></div>
              <h3>Your next tidy-up starts here</h3>
              <p>Enter a folder path above. Tidyline will map the contents before suggesting a single, safe next step.</p>
            </div></div>
          )}

          {scan && (
            <>
              <div className="stats-grid">
                <div className="stat-card"><div className="stat-label">Files found</div><div className="stat-value" data-testid="text-total-files">{scan.total_files.toLocaleString()}</div></div>
                <div className="stat-card"><div className="stat-label">Space mapped</div><div className="stat-value" data-testid="text-total-bytes">{bytes(scan.total_bytes)}</div></div>
                <div className="stat-card"><div className="stat-label">Duplicate groups</div><div className="stat-value" data-testid="text-duplicate-groups">{scan.duplicate_groups.length}</div></div>
                <div className="stat-card"><div className="stat-label">Recoverable space</div><div className="stat-value text-[hsl(var(--destructive))]" data-testid="text-wasted-bytes">{bytes(totalWasted)}</div></div>
              </div>

              <div className="dashboard-grid">
                <section className="panel" id="categories">
                  <div className="panel-head">
                    <div><h2 className="panel-title">What is in this folder?</h2><p className="panel-subtitle">A simple map of the space you are using.</p></div>
                    <HardDrive size={18} className="text-[hsl(var(--muted-foreground))]" />
                  </div>
                  {scan.categories.length > 0 ? <div className="category-list">
                    {scan.categories.map((category) => (
                      <div className="category-row" key={category.key} data-testid={`row-category-${category.key}`}>
                        <span className="category-swatch" style={{ backgroundColor: category.color || 'hsl(var(--accent))' }} />
                        <div><div className="category-name">{category.label}</div><div className="category-meta">{bytes(category.bytes)} in this category</div></div>
                        <div className="category-count">{category.count.toLocaleString()}</div>
                      </div>
                    ))}
                  </div> : <div className="empty-state"><h3>No categories yet</h3><p>This folder did not return categorized files.</p></div>}
                </section>

                <section className="panel" id="duplicates">
                  <div className="panel-head">
                    <div><h2 className="panel-title">Duplicate review</h2><p className="panel-subtitle">A careful look before anything is deleted.</p></div>
                    <ShieldCheck size={18} className="text-[hsl(var(--accent))]" />
                  </div>
                  {scan.duplicate_groups.length > 0 ? <>
                    <div className="duplicate-intro"><strong>{duplicateFiles} extra copies</strong> account for {bytes(totalWasted)}. Tidyline keeps the first file in each group and only deletes copies when you explicitly choose it.</div>
                    <div className="flex flex-wrap items-center gap-3 border-b border-[hsl(var(--border)/.7)] px-5 py-4">
                      <button className="btn btn-danger" onClick={() => organize(true, false)} disabled={organizeBusy} data-testid="button-delete-duplicates">
                        <Trash2 size={14} /> Organize &amp; remove duplicates
                      </button>
                      <span className="text-[10px] leading-4 text-[hsl(var(--muted-foreground))]">Keeps one original per match group. You will be asked to confirm.</span>
                    </div>
                    <div className="duplicate-list">
                      {scan.duplicate_groups.map((group, index) => (
                        <div className="duplicate-group" key={`${group.hash}-${index}`} data-testid={`card-duplicate-${index}`}>
                          <div className="duplicate-group-head"><span>Match group {String(index + 1).padStart(2, '0')}</span><span className="duplicate-space">{bytes(group.wasted_bytes)} recoverable</span></div>
                          {group.files.map((file, fileIndex) => <div className="file-line" key={`${file.path}-${fileIndex}`}><FileText size={13} /><span title={file.path}>{file.name || file.path}</span>{fileIndex === 0 && <span className="pill ml-auto">keep</span>}</div>)}
                        </div>
                      ))}
                    </div>
                  </> : <div className="empty-state"><div className="empty-icon"><ShieldCheck size={20} /></div><h3>No duplicates found</h3><p>Everything in this scan has a single copy. That is a good result.</p></div>}
                </section>
              </div>

              <section className="panel samples" id="sample-files">
                <div className="panel-head">
                  <div><h2 className="panel-title">A few files, thoughtfully sorted</h2><p className="panel-subtitle">A preview of the folders Tidyline would use.</p></div>
                  <span className="eyebrow">{scan.sample_files.length} shown</span>
                </div>
                {scan.sample_files.length > 0 ? <div className="overflow-x-auto">
                  <table className="sample-table">
                    <thead><tr><th>Name</th><th>Type</th><th>Size</th><th>Planned folder</th></tr></thead>
                    <tbody>{scan.sample_files.map((file, index) => <tr key={`${file.path}-${index}`} data-testid={`row-sample-file-${index}`}>
                      <td><div className="sample-name">{fileIcon(file.kind)}<div><div>{file.name}</div><div className="sample-path">{file.path}</div></div></div></td>
                      <td><span className="pill">{file.kind || 'File'}</span></td>
                      <td className="font-mono text-[11px] text-[hsl(var(--muted-foreground))]">{bytes(file.size)}</td>
                      <td className="text-[11px] text-[hsl(var(--muted-foreground))]">{file.planned_folder || 'No change'}</td>
                    </tr>)}</tbody>
                  </table>
                </div> : <div className="empty-state"><h3>No sample files</h3><p>The scan returned no file previews.</p></div>}
              </section>
            </>
          )}

          <section className="panel schedule-panel" id="schedule">
            <div className="panel-head"><div><h2 className="panel-title">Keep it tidy automatically</h2><p className="panel-subtitle">Set a quiet rhythm for a folder you visit often.</p></div><Settings2 size={18} className="text-[hsl(var(--accent))]" /></div>
            {scheduleLoading ? <div className="schedule-body"><div className="skeleton w-48" /><div className="skeleton mt-4 w-full h-10" /></div> : <div className="schedule-body">
              <div className="schedule-toggle">
                <div className="schedule-copy"><h3>Scheduled organization</h3><p>Runs the same cleanup as “Organize &amp; clean duplicates” at your chosen time.</p></div>
                <button className={`switch ${schedule.enabled ? 'on' : ''}`} onClick={() => setSchedule((current) => ({ ...current, enabled: !current.enabled }))} aria-label="Toggle scheduled organization" data-testid="button-toggle-schedule"><span /></button>
              </div>
              <form onSubmit={saveSchedule}>
                <div className="schedule-form">
                  <div className="field full"><label htmlFor="schedule-folder">Folder path</label><input id="schedule-folder" value={schedule.folder_path} onChange={(event) => setSchedule({ ...schedule, folder_path: event.target.value })} placeholder={folderPath || '/Users/you/Downloads'} data-testid="input-schedule-folder" /></div>
                  <div className="field"><label htmlFor="schedule-frequency">Frequency</label><select id="schedule-frequency" value={schedule.frequency} onChange={(event) => setSchedule({ ...schedule, frequency: event.target.value })} data-testid="select-schedule-frequency"><option value="daily">Daily</option><option value="weekly">Weekly</option></select></div>
                  <div className="field"><label htmlFor="schedule-time">Time</label><input id="schedule-time" type="time" value={schedule.time} onChange={(event) => setSchedule({ ...schedule, time: event.target.value })} data-testid="input-schedule-time" /></div>
                  {schedule.frequency === 'weekly' && <div className="field full"><label htmlFor="schedule-weekday">Day of week</label><select id="schedule-weekday" value={schedule.weekday} onChange={(event) => setSchedule({ ...schedule, weekday: event.target.value })} data-testid="select-schedule-weekday"><option value="monday">Monday</option><option value="tuesday">Tuesday</option><option value="wednesday">Wednesday</option><option value="thursday">Thursday</option><option value="friday">Friday</option><option value="saturday">Saturday</option><option value="sunday">Sunday</option></select></div>}
                </div>
                <div className="schedule-actions">
                  <button className="btn btn-primary" type="submit" disabled={scheduleBusy} data-testid="button-save-schedule">{scheduleBusy ? <RefreshCw className="animate-spin" size={14} /> : <Check size={14} />} Save schedule</button>
                  <button className="btn btn-quiet" type="button" onClick={runNow} disabled={scheduleBusy} data-testid="button-run-now"><Play size={14} /> Run now</button>
                  <div className="schedule-note"><div>Last run: {dateLabel(schedule.last_run)}</div><div>Next run: {dateLabel(schedule.next_run)}</div></div>
                </div>
              </form>
              {scheduleError && <div className="alert alert-error mx-0 mb-0 mt-4"><AlertTriangle size={15} /> <span data-testid="status-schedule-error">{scheduleError}</span></div>}
            </div>}
          </section>

          <footer className="mt-8 flex flex-wrap items-center justify-between gap-3 px-1 text-[11px] text-[hsl(var(--muted-foreground))]">
            <span>Scanned {scan ? dateLabel(scan.scanned_at) : 'when you are ready'}</span>
            <span className="flex items-center gap-1.5"><ShieldCheck size={13} /> Nothing is deleted without a clear confirmation.</span>
          </footer>
        </main>
      </div>
      {notice && <div className="toast-message" role="status" data-testid="status-toast">{notice}</div>}
      {browseOpen && (
        <div className="browse-overlay" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) setBrowseOpen(false); }}>
          <section className="browse-dialog" role="dialog" aria-modal="true" aria-labelledby="browse-title">
            <div className="browse-dialog-head">
              <div><div className="eyebrow">Folder browser</div><h2 id="browse-title">Choose a workspace</h2></div>
              <button className="mobile-menu" onClick={() => setBrowseOpen(false)} aria-label="Close folder browser"><X size={18} /></button>
            </div>
            <div className="browse-path">{browsePath || 'Loading folders…'}</div>
            {browseError && <div className="alert alert-error browse-alert"><AlertTriangle size={15} /> {browseError}</div>}
            <div className="browse-actions">
              <button className="btn btn-primary" onClick={() => { setFolderPath(browsePath); setBrowseOpen(false); showNotice('Folder selected. Scan when you are ready.'); }} disabled={!browsePath || browseBusy}>Use this folder</button>
              <button className="btn btn-quiet" onClick={() => browseTo(browsePath)} disabled={browseBusy}><RefreshCw size={14} className={browseBusy ? 'animate-spin' : ''} /> Refresh</button>
            </div>
            <div className="browse-list">
              {browseResult?.parent_path && <button className="browse-row parent" onClick={() => browseTo(browseResult.parent_path!)}><ChevronRight size={16} className="rotate-180" /> <span>Parent folder</span></button>}
              {browseResult?.directories.map((directory) => <button className="browse-row" key={directory.path} onClick={() => browseTo(directory.path)}><FolderOpen size={16} /> <span>{directory.name}</span><ChevronRight size={15} className="ml-auto" /></button>)}
              {!browseBusy && browseResult?.directories.length === 0 && <div className="browse-empty">No visible subfolders here.</div>}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

export default App;