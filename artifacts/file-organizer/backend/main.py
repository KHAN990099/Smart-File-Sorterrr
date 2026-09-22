from __future__ import annotations

import asyncio
import hashlib
import json
import os
import re
from collections import defaultdict
from contextlib import asynccontextmanager
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any, Literal

from fastapi import APIRouter, FastAPI, HTTPException, Query
from pydantic import BaseModel, Field, field_validator


API_PREFIX = "/organizer-api"
STATE_FILE = Path(__file__).with_name("organizer_state.json")
CHUNK_SIZE = 1024 * 1024

CATEGORY_DEFINITIONS: tuple[tuple[str, str, set[str], str], ...] = (
    ("images", "Images", {".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg", ".heic", ".bmp", ".tif", ".tiff"}, "#d8a11d"),
    ("pdfs", "PDFs", {".pdf"}, "#bd5b4b"),
    ("documents", "Documents", {".doc", ".docx", ".odt", ".rtf", ".txt", ".md"}, "#4f8c83"),
    ("spreadsheets", "Spreadsheets", {".xls", ".xlsx", ".csv", ".ods"}, "#438a68"),
    ("presentations", "Presentations", {".ppt", ".pptx", ".odp", ".key"}, "#b7713d"),
    ("videos", "Videos", {".mp4", ".mov", ".avi", ".mkv", ".webm", ".m4v"}, "#6f76aa"),
    ("audio", "Audio", {".mp3", ".wav", ".m4a", ".flac", ".aac", ".ogg"}, "#8a5f99"),
    ("archives", "Archives", {".zip", ".tar", ".gz", ".rar", ".7z", ".bz2"}, "#6f6b5b"),
    ("code", "Code", {".py", ".js", ".ts", ".tsx", ".jsx", ".html", ".css", ".json", ".yaml", ".yml", ".sql", ".sh"}, "#3e748d"),
)

NAME_PATTERNS: tuple[tuple[str, str, re.Pattern[str]], ...] = (
    ("screenshots", "Screenshots", re.compile(r"(screenshot|screen[-_ ]?shot|snip)", re.IGNORECASE)),
    ("invoices", "Invoices", re.compile(r"(invoice|inv[-_ ]?\d+|bill|receipt)", re.IGNORECASE)),
    ("resumes", "Resumes", re.compile(r"(resume|curriculum[-_ ]?vitae|\bcv\b)", re.IGNORECASE)),
    ("contracts", "Contracts", re.compile(r"(contract|agreement|nda)", re.IGNORECASE)),
    ("meeting-notes", "Meeting Notes", re.compile(r"(meeting|minutes|stand[-_ ]?up|1[-_ ]?on[-_ ]?1)", re.IGNORECASE)),
)

DESTINATION_FOLDER_NAMES = {
    folder_name
    for _, folder_name, _, _ in CATEGORY_DEFINITIONS
}.union(folder_name for _, folder_name, _ in NAME_PATTERNS)


def now_iso() -> str:
    return datetime.now().astimezone().isoformat(timespec="seconds")


def bytes_label(value: int) -> str:
    return str(value)


def safe_path(value: str) -> Path:
    path = Path(value).expanduser()
    if not path.exists():
        raise HTTPException(status_code=404, detail=f"Folder not found: {value}")
    if not path.is_dir():
        raise HTTPException(status_code=400, detail="The selected path is not a folder.")
    return path.resolve()


def is_hidden(path: Path) -> bool:
    return any(part.startswith(".") for part in path.parts if part not in (".", ".."))


def category_for(path: Path) -> tuple[str, str, str]:
    extension = path.suffix.lower()
    for key, label, extensions, color in CATEGORY_DEFINITIONS:
        if extension in extensions:
            return key, label, color
    return "other", "Other", "#9a8f75"


def planned_folder(path: Path) -> tuple[str, str]:
    for key, folder_name, pattern in NAME_PATTERNS:
        if pattern.search(path.stem):
            return key, folder_name
    return category_for(path)[0], category_for(path)[1]


def iter_files(root: Path, recursive: bool, include_hidden: bool) -> list[Path]:
    files: list[Path] = []
    pending = [root]
    while pending:
        current = pending.pop()
        try:
            entries = sorted(current.iterdir(), key=lambda item: item.name.lower())
        except OSError:
            continue
        for entry in entries:
            if entry.is_symlink():
                continue
            if not include_hidden and entry.name.startswith("."):
                continue
            if entry.is_dir():
                if recursive and entry.name not in DESTINATION_FOLDER_NAMES:
                    pending.append(entry)
                continue
            if entry.is_file() and entry.name != STATE_FILE.name:
                files.append(entry)
    return sorted(files, key=lambda item: str(item).lower())


def file_info(path: Path, root: Path) -> dict[str, Any]:
    stat = path.stat()
    _, category, _ = category_for(path)
    _, target_folder = planned_folder(path)
    return {
        "path": str(path),
        "name": path.name,
        "kind": category,
        "size": stat.st_size,
        "modified_at": datetime.fromtimestamp(stat.st_mtime).astimezone().isoformat(timespec="seconds"),
        "planned_folder": str(root / target_folder),
    }


def hash_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        while chunk := handle.read(CHUNK_SIZE):
            digest.update(chunk)
    return digest.hexdigest()


def duplicate_groups(files: list[Path], root: Path) -> list[dict[str, Any]]:
    by_size: dict[int, list[Path]] = defaultdict(list)
    for path in files:
        try:
            by_size[path.stat().st_size].append(path)
        except OSError:
            continue

    by_hash: dict[str, list[Path]] = defaultdict(list)
    for same_size_files in by_size.values():
        if len(same_size_files) < 2:
            continue
        for path in same_size_files:
            try:
                by_hash[hash_file(path)].append(path)
            except OSError:
                continue

    groups: list[dict[str, Any]] = []
    for digest, matches in sorted(by_hash.items()):
        if len(matches) < 2:
            continue
        matches = sorted(matches, key=lambda item: str(item).lower())
        size = matches[0].stat().st_size
        groups.append({
            "hash": digest,
            "files": [file_info(path, root) for path in matches],
            "wasted_bytes": size * (len(matches) - 1),
        })
    return groups


def build_scan(folder_path: str, recursive: bool, include_hidden: bool) -> dict[str, Any]:
    root = safe_path(folder_path)
    files = iter_files(root, recursive, include_hidden)

    category_totals: dict[str, dict[str, Any]] = {}
    for path in files:
        key, label, color = category_for(path)
        if key not in category_totals:
            category_totals[key] = {"key": key, "label": label, "count": 0, "bytes": 0, "color": color}
        try:
            size = path.stat().st_size
        except OSError:
            continue
        category_totals[key]["count"] += 1
        category_totals[key]["bytes"] += size

    name_match_totals: dict[tuple[str, str], list[Path]] = defaultdict(list)
    for path in files:
        key, folder_name = planned_folder(path)
        if key in {pattern_key for pattern_key, _, _ in NAME_PATTERNS}:
            name_match_totals[(key, folder_name)].append(path)

    return {
        "folder_path": str(root),
        "scanned_at": now_iso(),
        "total_files": len(files),
        "total_bytes": sum(path.stat().st_size for path in files if path.exists()),
        "categories": sorted(category_totals.values(), key=lambda item: item["bytes"], reverse=True),
        "duplicate_groups": duplicate_groups(files, root),
        "name_matches": [
            {
                "pattern": key,
                "folder": folder_name,
                "files": [file_info(path, root) for path in matches],
            }
            for (key, folder_name), matches in sorted(name_match_totals.items())
        ],
        "sample_files": [file_info(path, root) for path in files[:18]],
    }


def is_inside(path: Path, root: Path) -> bool:
    try:
        path.resolve().relative_to(root.resolve())
        return True
    except ValueError:
        return False


def available_destination(destination: Path) -> Path:
    if not destination.exists():
        return destination
    stem, suffix = destination.stem, destination.suffix
    index = 1
    while True:
        candidate = destination.with_name(f"{stem} ({index}){suffix}")
        if not candidate.exists():
            return candidate
        index += 1


def organize_folder(
    folder_path: str,
    recursive: bool,
    include_hidden: bool,
    delete_duplicates: bool,
    dry_run: bool,
) -> dict[str, Any]:
    root = safe_path(folder_path)
    files = iter_files(root, recursive, include_hidden)
    groups = duplicate_groups(files, root)
    duplicate_paths = {
        Path(item["path"])
        for group in groups
        for item in group["files"][1:]
    }

    moved_files = 0
    deleted_duplicates = 0
    skipped_files = 0
    errors: list[str] = []

    for path in files:
        if delete_duplicates and path in duplicate_paths:
            if dry_run:
                deleted_duplicates += 1
                continue
            try:
                if is_inside(path, root):
                    path.unlink()
                    deleted_duplicates += 1
                else:
                    errors.append(f"Skipped unsafe duplicate path: {path}")
            except OSError as exc:
                errors.append(f"Could not delete {path.name}: {exc}")
            continue

        try:
            _, target_folder = planned_folder(path)
            destination_dir = root / target_folder
            destination = destination_dir / path.name
            if path.parent.resolve() == destination_dir.resolve():
                skipped_files += 1
                continue
            if not is_inside(destination_dir, root):
                errors.append(f"Skipped unsafe destination: {destination_dir}")
                continue
            destination = available_destination(destination)
            if not dry_run:
                destination_dir.mkdir(parents=True, exist_ok=True)
                path.replace(destination)
            moved_files += 1
        except OSError as exc:
            errors.append(f"Could not move {path.name}: {exc}")

    summary = {
        "planned_files": len(files),
        "duplicate_groups": len(groups),
        "delete_duplicates": delete_duplicates,
        "dry_run": dry_run,
    }
    return {
        "folder_path": str(root),
        "moved_files": moved_files,
        "deleted_duplicates": deleted_duplicates,
        "skipped_files": skipped_files,
        "errors": errors,
        "summary": summary,
    }


class ScanRequest(BaseModel):
    folder_path: str = Field(min_length=1)
    recursive: bool = True
    include_hidden: bool = False


class OrganizeRequest(ScanRequest):
    delete_duplicates: bool = True
    dry_run: bool = False


class ScheduleConfig(BaseModel):
    enabled: bool = False
    frequency: Literal["daily", "weekly"] = "weekly"
    time: str = "09:00"
    weekday: str = "monday"
    folder_path: str = ""
    last_run: str | None = None
    next_run: str | None = None

    @field_validator("time")
    @classmethod
    def valid_time(cls, value: str) -> str:
        try:
            datetime.strptime(value, "%H:%M")
        except ValueError as exc:
            raise ValueError("time must use HH:MM format") from exc
        return value

    @field_validator("weekday")
    @classmethod
    def valid_weekday(cls, value: str) -> str:
        if value.lower() not in {"monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"}:
            raise ValueError("weekday must be a valid day name")
        return value.lower()


schedule_lock = asyncio.Lock()


def load_schedule() -> ScheduleConfig:
    try:
        return ScheduleConfig.model_validate(json.loads(STATE_FILE.read_text()))
    except (OSError, ValueError, TypeError):
        return ScheduleConfig()


schedule_config = load_schedule()


def save_schedule() -> None:
    STATE_FILE.write_text(json.dumps(schedule_config.model_dump(), indent=2))


def calculate_next_run(config: ScheduleConfig, from_time: datetime | None = None) -> str | None:
    if not config.enabled or not config.folder_path:
        return None
    current = from_time or datetime.now().astimezone()
    hour, minute = (int(part) for part in config.time.split(":"))
    candidate = current.replace(hour=hour, minute=minute, second=0, microsecond=0)
    if config.frequency == "daily":
        if candidate <= current:
            candidate += timedelta(days=1)
    else:
        weekday_index = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].index(config.weekday)
        days_ahead = (weekday_index - current.weekday()) % 7
        candidate += timedelta(days=days_ahead)
        if candidate <= current:
            candidate += timedelta(days=7)
    return candidate.isoformat(timespec="seconds")


async def run_scheduled_organization() -> dict[str, Any]:
    async with schedule_lock:
        if not schedule_config.folder_path:
            raise HTTPException(status_code=400, detail="Add a folder path to the schedule first.")
        result = await asyncio.to_thread(
            organize_folder,
            schedule_config.folder_path,
            True,
            False,
            True,
            False,
        )
        schedule_config.last_run = now_iso()
        schedule_config.next_run = calculate_next_run(schedule_config)
        save_schedule()
        return result


async def scheduler_loop() -> None:
    while True:
        await asyncio.sleep(30)
        if not schedule_config.enabled or not schedule_config.next_run:
            continue
        try:
            if datetime.now().astimezone() >= datetime.fromisoformat(schedule_config.next_run):
                await run_scheduled_organization()
        except (OSError, ValueError, HTTPException):
            schedule_config.last_run = now_iso()
            schedule_config.next_run = calculate_next_run(schedule_config)
            save_schedule()


@asynccontextmanager
async def lifespan(_: FastAPI):
    global schedule_config
    schedule_config = load_schedule()
    if schedule_config.enabled:
        schedule_config.next_run = calculate_next_run(schedule_config)
        save_schedule()
    task = asyncio.create_task(scheduler_loop())
    yield
    task.cancel()
    try:
        await task
    except asyncio.CancelledError:
        pass


app = FastAPI(
    title="Tidyline File Organizer API",
    description="A small FastAPI service for organizing a server-side folder by file type and name pattern.",
    version="1.0.0",
    lifespan=lifespan,
)
router = APIRouter(prefix=API_PREFIX)


@router.get("/healthz")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "file-organizer"}


@router.post("/scan")
def scan(request: ScanRequest) -> dict[str, Any]:
    return build_scan(request.folder_path, request.recursive, request.include_hidden)


@router.get("/browse")
def browse(path: str = Query(default="")) -> dict[str, Any]:
    root = safe_path(path or "/home/runner/workspace")
    directories: list[dict[str, str]] = []
    try:
        for entry in sorted(root.iterdir(), key=lambda item: item.name.lower()):
            if entry.is_dir() and not entry.is_symlink() and not entry.name.startswith("."):
                directories.append({"name": entry.name, "path": str(entry)})
    except OSError as exc:
        raise HTTPException(status_code=400, detail=f"Could not read this folder: {exc}") from exc
    return {
        "current_path": str(root),
        "parent_path": str(root.parent) if root.parent != root else None,
        "directories": directories,
    }


@router.post("/organize")
def organize(request: OrganizeRequest) -> dict[str, Any]:
    return organize_folder(
        request.folder_path,
        request.recursive,
        request.include_hidden,
        request.delete_duplicates,
        request.dry_run,
    )


@router.get("/schedule")
def get_schedule() -> ScheduleConfig:
    schedule_config.next_run = calculate_next_run(schedule_config)
    return schedule_config


@router.put("/schedule")
def update_schedule(config: ScheduleConfig) -> ScheduleConfig:
    global schedule_config
    folder_path = config.folder_path.strip()
    if config.enabled:
        if not folder_path:
            raise HTTPException(status_code=400, detail="Add a folder path before enabling the schedule.")
        safe_path(folder_path)
    schedule_config = config.model_copy(update={"folder_path": folder_path})
    schedule_config.next_run = calculate_next_run(schedule_config)
    save_schedule()
    return schedule_config


@router.post("/schedule/run-now")
async def run_now() -> dict[str, Any]:
    return await run_scheduled_organization()


app.include_router(router)


@app.get("/healthz", include_in_schema=False)
def root_health() -> dict[str, str]:
    return health()


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=int(os.environ.get("PORT", "8000")))