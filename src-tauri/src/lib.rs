mod ai_guide;

use serde::{Deserialize, Serialize};
use std::process::Command;
use std::{
    fs,
    path::{Path, PathBuf},
    time::{SystemTime, UNIX_EPOCH},
};
use tauri::{AppHandle, Manager};
use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers, Shortcut, ShortcutState};
use sysinfo::System;

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
struct DetectedGame {
    id: String,
    title: String,
}

#[tauri::command]
fn detect_running_game(app: AppHandle) -> Result<Option<DetectedGame>, String> {
    let library = read_library(&app)?;
    let system = System::new_all();
    let windows_root = std::env::var("WINDIR")
        .unwrap_or_else(|_| "C:\\Windows".to_string())
        .replace('/', "\\")
        .to_lowercase();
    let desktop_processes = [
        "amazon games.exe", "applicationframehost.exe", "backgroundtaskhost.exe",
        "battle.net.exe", "battlenet.exe", "browser_broker.exe", "cargo.exe", "cmd.exe", "code.exe", "conhost.exe",
        "crashpad_handler.exe", "discord.exe", "dwm.exe", "eaapp.exe",
        "devenv.exe", "epicgameslauncher.exe", "epicwebhelper.exe", "explorer.exe",
        "gamebar.exe", "gamebarftserver.exe", "git.exe", "goggalaxy.exe", "googlechrome.exe",
        "itch.exe", "msedge.exe", "msedgewebview2.exe", "node.exe", "obs64.exe", "onedrive.exe",
        "powershell.exe", "pwsh.exe", "questai.exe", "riotclientservices.exe", "rustc.exe", "searchhost.exe",
        "services.exe", "slack.exe", "startmenuexperiencehost.exe", "steam.exe",
        "steamwebhelper.exe", "taskmgr.exe", "textinputhost.exe", "ubisoftconnect.exe",
        "windowsterminal.exe", "widgets.exe", "widgetservice.exe", "xboxapp.exe",
    ];

    let mut candidates: Vec<_> = system
        .processes()
        .values()
        .filter_map(|process| {
            let path = process.exe()?;
            let path_text = path.to_string_lossy().to_string();
            let normalized = path_text.replace('/', "\\").to_lowercase();
            let filename = path.file_name()?.to_string_lossy().to_string();
            let filename_lower = filename.to_lowercase();

            if desktop_processes.contains(&filename_lower.as_str())
                || filename_lower.contains("crash")
                || filename_lower.contains("unitycrash")
                || filename_lower.starts_with("unins")
            {
                return None;
            }

            let library_match = library.iter().find(|game| {
                game.executable_path.eq_ignore_ascii_case(&path_text)
            });
            let steam_game = normalized.contains("\\steamapps\\common\\");
            let outside_windows = !normalized.starts_with(&windows_root);
            let score = if library_match.is_some() {
                3
            } else if steam_game {
                2
            } else if outside_windows {
                1
            } else {
                return None;
            };
            let (id, title) = if let Some(game) = library_match {
                (game.id.clone(), game.title.clone())
            } else {
                let title = path
                    .parent()
                    .and_then(Path::file_name)
                    .and_then(|name| name.to_str())
                    .filter(|name| !["bin", "binaries", "game", "shipping", "win64", "x64", "x86"].contains(&name.to_lowercase().as_str()))
                    .map(|name| name.replace(['_', '-'], " "))
                    .unwrap_or_else(|| title_from_path(path).unwrap_or_else(|_| "Running game".to_string()));
                (format!("running:{}", normalized), title)
            };
            Some((score, process.start_time(), id, title))
        })
        .collect();

    candidates.sort_by(|left, right| right.0.cmp(&left.0).then_with(|| right.1.cmp(&left.1)));
    Ok(candidates.into_iter().next().map(|(_, _, id, title)| DetectedGame { id, title }))
}

#[tauri::command]
fn hide_guide_overlay(app: AppHandle) -> Result<(), String> {
    app.get_webview_window("guide-overlay")
        .ok_or_else(|| "Guide overlay window is unavailable.".to_string())?
        .hide()
        .map_err(|error| format!("Could not hide guide overlay: {error}"))
}

#[tauri::command]
fn show_guide_overlay(app: AppHandle) -> Result<(), String> {
    let window = app
        .get_webview_window("guide-overlay")
        .ok_or_else(|| "Guide overlay window is unavailable.".to_string())?;
    window
        .show()
        .map_err(|error| format!("Could not show guide overlay: {error}"))?;
    window
        .set_focus()
        .map_err(|error| format!("Could not focus guide overlay: {error}"))
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct ImportedGame {
    id: String,
    title: String,
    executable_path: String,
    executable_filename: String,
    import_date: u64,
    favorite: bool,
    artwork_path: Option<String>,
    description: Option<String>,
    genre: Option<String>,
    last_played: Option<u64>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct GameUpdate {
    title: Option<String>,
    favorite: Option<bool>,
    description: Option<Option<String>>,
    genre: Option<Option<String>>,
}

fn now_millis() -> Result<u64, String> {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|duration| duration.as_millis() as u64)
        .map_err(|_| "System clock is before the Unix epoch.".to_string())
}

fn library_path(app: &AppHandle) -> Result<PathBuf, String> {
    let dir = app
        .path()
        .app_data_dir()
        .map_err(|error| format!("Could not locate QuestAI app data directory: {error}"))?;

    fs::create_dir_all(&dir)
        .map_err(|error| format!("Could not create QuestAI app data directory: {error}"))?;

    Ok(dir.join("games.json"))
}

fn read_library(app: &AppHandle) -> Result<Vec<ImportedGame>, String> {
    let path = library_path(app)?;

    if !path.exists() {
        return Ok(Vec::new());
    }

    let content = fs::read_to_string(&path)
        .map_err(|error| format!("Could not read game library: {error}"))?;

    if content.trim().is_empty() {
        return Ok(Vec::new());
    }

    serde_json::from_str(&content)
        .map_err(|error| format!("Could not parse game library data: {error}"))
}

fn write_library(app: &AppHandle, games: &[ImportedGame]) -> Result<(), String> {
    let path = library_path(app)?;
    let content = serde_json::to_string_pretty(games)
        .map_err(|error| format!("Could not serialize game library: {error}"))?;

    fs::write(&path, content).map_err(|error| format!("Could not save game library: {error}"))
}

fn validate_executable(path: &Path) -> Result<PathBuf, String> {
    if !path.exists() {
        return Err("The selected file does not exist.".to_string());
    }

    if !path.is_file() {
        return Err("Please select a game executable file, not a folder.".to_string());
    }

    let extension = path
        .extension()
        .and_then(|value| value.to_str())
        .unwrap_or_default();

    if !extension.eq_ignore_ascii_case("exe") {
        return Err("QuestAI can only import Windows .exe files.".to_string());
    }

    path.canonicalize()
        .map_err(|error| format!("Could not access the selected executable: {error}"))
}

fn title_from_path(path: &Path) -> Result<String, String> {
    let stem = path
        .file_stem()
        .and_then(|value| value.to_str())
        .ok_or_else(|| "Could not derive a title from the executable filename.".to_string())?;

    let title = stem.replace(['_', '-'], " ");
    Ok(title.trim().to_string())
}

fn id_from_title(title: &str, timestamp: u64) -> String {
    let slug: String = title
        .chars()
        .filter_map(|character| {
            if character.is_ascii_alphanumeric() {
                Some(character.to_ascii_lowercase())
            } else if character.is_whitespace() {
                Some('-')
            } else {
                None
            }
        })
        .collect();

    format!("{}-{timestamp}", slug.trim_matches('-'))
}

fn steam_install_paths() -> Vec<PathBuf> {
    let mut paths = Vec::new();

    if let Ok(program_files) = std::env::var("ProgramFiles(x86)") {
        paths.push(PathBuf::from(program_files).join("Steam"));
    }
    if let Ok(program_files) = std::env::var("ProgramFiles") {
        paths.push(PathBuf::from(program_files).join("Steam"));
    }
    if let Ok(local_app_data) = std::env::var("LOCALAPPDATA") {
        paths.push(PathBuf::from(local_app_data).join("Steam"));
    }

    paths.sort();
    paths.dedup();
    paths
}

fn quoted_vdf_value(content: &str, key: &str) -> Option<String> {
    let marker = format!("\"{key}\"");
    let start = content.find(&marker)? + marker.len();
    let remainder = &content[start..];
    let value_start = remainder.find('"')? + 1;
    let value_end = remainder[value_start..].find('"')? + value_start;
    Some(remainder[value_start..value_end].replace("\\\\", "\\"))
}

fn steam_library_paths(steam_root: &Path) -> Vec<PathBuf> {
    let mut libraries = vec![steam_root.to_path_buf()];
    let path = steam_root.join("steamapps").join("libraryfolders.vdf");
    let Ok(content) = fs::read_to_string(path) else {
        return libraries;
    };

    for line in content.lines() {
        if let Some(value) = quoted_vdf_value(line, "path") {
            let library = PathBuf::from(value);
            if !libraries.iter().any(|existing| existing == &library) {
                libraries.push(library);
            }
        }
    }

    libraries
}

#[tauri::command]
fn import_steam_games(app: AppHandle) -> Result<Vec<ImportedGame>, String> {
    let mut games = read_library(&app)?;
    let mut imported = Vec::new();

    for steam_root in steam_install_paths() {
        for library in steam_library_paths(&steam_root) {
            let steamapps = library.join("steamapps");
            let Ok(entries) = fs::read_dir(&steamapps) else {
                continue;
            };

            for entry in entries.flatten() {
                let filename = entry.file_name();
                let filename = filename.to_string_lossy();
                if !filename.starts_with("appmanifest_") || !filename.ends_with(".acf") {
                    continue;
                }

                let Ok(content) = fs::read_to_string(entry.path()) else {
                    continue;
                };
                let (Some(app_id), Some(title)) = (
                    quoted_vdf_value(&content, "appid"),
                    quoted_vdf_value(&content, "name"),
                ) else {
                    continue;
                };

                let id = format!("steam-{app_id}");
                let executable_path = format!("steam://rungameid/{app_id}");
                if games
                    .iter()
                    .any(|game| game.id == id || game.executable_path == executable_path)
                {
                    continue;
                }

                let game = ImportedGame {
                    id,
                    title,
                    executable_path,
                    executable_filename: format!("Steam app {app_id}"),
                    import_date: now_millis()?,
                    favorite: false,
                    artwork_path: Some(format!(
                        "https://cdn.cloudflare.steamstatic.com/steam/apps/{app_id}/header.jpg"
                    )),
                    description: None,
                    genre: Some("Steam".to_string()),
                    last_played: None,
                };

                games.push(game.clone());
                imported.push(game);
            }
        }
    }

    games.sort_by(|left, right| left.title.to_lowercase().cmp(&right.title.to_lowercase()));
    if !imported.is_empty() {
        write_library(&app, &games)?;
    }

    Ok(imported)
}

#[tauri::command]
fn list_games(app: AppHandle) -> Result<Vec<ImportedGame>, String> {
    read_library(&app)
}

#[tauri::command]
fn import_game(app: AppHandle, path: String) -> Result<ImportedGame, String> {
    let canonical_path = validate_executable(Path::new(&path))?;
    let canonical_path_string = canonical_path.to_string_lossy().to_string();
    let mut games = read_library(&app)?;

    if games.iter().any(|game| {
        game.executable_path
            .eq_ignore_ascii_case(&canonical_path_string)
    }) {
        return Err("This executable is already in your QuestAI library.".to_string());
    }

    let title = title_from_path(&canonical_path)?;
    let timestamp = now_millis()?;
    let executable_filename = canonical_path
        .file_name()
        .and_then(|value| value.to_str())
        .ok_or_else(|| "Could not read the executable filename.".to_string())?
        .to_string();

    let game = ImportedGame {
        id: id_from_title(&title, timestamp),
        title,
        executable_path: canonical_path_string,
        executable_filename,
        import_date: timestamp,
        favorite: false,
        artwork_path: None,
        description: None,
        genre: None,
        last_played: None,
    };

    games.push(game.clone());
    games.sort_by(|left, right| left.title.to_lowercase().cmp(&right.title.to_lowercase()));
    write_library(&app, &games)?;

    Ok(game)
}

#[tauri::command]
fn remove_game(app: AppHandle, id: String) -> Result<Vec<ImportedGame>, String> {
    let mut games = read_library(&app)?;
    let original_len = games.len();
    games.retain(|game| game.id != id);

    if games.len() == original_len {
        return Err("That game is no longer in your library.".to_string());
    }

    write_library(&app, &games)?;
    Ok(games)
}

#[tauri::command]
fn update_game(
    app: AppHandle,
    id: String,
    updates: GameUpdate,
) -> Result<ImportedGame, String> {
    let mut games = read_library(&app)?;
    let game = games
        .iter_mut()
        .find(|game| game.id == id)
        .ok_or_else(|| "That game is no longer in your library.".to_string())?;

    if let Some(title) = updates.title {
        let trimmed = title.trim();
        if trimmed.is_empty() {
            return Err("Game title cannot be empty.".to_string());
        }
        game.title = trimmed.to_string();
    }

    if let Some(favorite) = updates.favorite {
        game.favorite = favorite;
    }

    if let Some(description) = updates.description {
        game.description = description.map(|value| value.trim().to_string());
    }

    if let Some(genre) = updates.genre {
        game.genre = genre.map(|value| value.trim().to_string());
    }

    let updated = game.clone();
    games.sort_by(|left, right| left.title.to_lowercase().cmp(&right.title.to_lowercase()));
    write_library(&app, &games)?;

    Ok(updated)
}

#[tauri::command]
fn launch_game(_app: AppHandle, path: String) -> Result<u32, String> {
    if path.starts_with("steam://") {
        #[cfg(target_os = "windows")]
        {
            let child = Command::new("cmd")
                .args(["/C", "start", "", &path])
                .spawn()
                .map_err(|error| format!("Could not launch the Steam game: {error}"))?;
            return Ok(child.id());
        }
        #[cfg(not(target_os = "windows"))]
        {
            return Err("Steam launch URLs are currently supported on Windows only.".to_string());
        }
    }

    let path = PathBuf::from(path);

    if !path.exists() {
        return Err("The executable path does not exist.".to_string());
    }

    // Attempt to spawn the executable with its parent folder as the current
    // working directory. Some games expect the working directory to be the
    // game folder (assets, dlls, steam wrappers, etc.). Returning the child
    // PID for diagnostics.
    let parent = path
        .parent()
        .ok_or_else(|| "Could not determine executable parent directory.".to_string())?;

    // First try to spawn normally. On Windows, set creation flags to detach
    // so GUI apps are not tied to the Tauri process. If the child exits
    // immediately we will fallback to using `cmd /C start` to ensure the
    // system shell starts the app.
    #[cfg(target_os = "windows")]
    use std::os::windows::process::CommandExt;

    match {
        #[cfg(target_os = "windows")]
        {
            // DETACHED_PROCESS | CREATE_NEW_PROCESS_GROUP
            const CREATE_FLAGS: u32 = 0x00000008 | 0x00000200;
            Command::new(&path).current_dir(parent).creation_flags(CREATE_FLAGS).spawn()
        }
        #[cfg(not(target_os = "windows"))]
        {
            Command::new(&path).current_dir(parent).spawn()
        }
    } {
        Ok(mut child) => {
            let pid = child.id();
            // Give the child a short moment; if it exits immediately it might
            // be a launcher that failed to start the actual game window.
            std::thread::sleep(std::time::Duration::from_millis(500));
            match child.try_wait() {
                Ok(Some(status)) => {
                    eprintln!("launched child exited immediately: {:?}", status);
                    // Fallback to shell start on Windows
                    #[cfg(target_os = "windows")]
                    {
                        let path_str = path.to_string_lossy().replace('"', "\"");
                        let start = Command::new("cmd")
                            .args(&["/C", "start", "", &path_str])
                            .spawn()
                            .map_err(|e| format!("Could not start via shell: {e}"))?;
                        let spid = start.id();
                        println!("launched via shell path={:?} pid={}", path, spid);
                        return Ok(spid);
                    }
                    // On non-windows, just return the original child's pid
                    return Ok(pid);
                }
                Ok(None) => {
                    println!("launched game path={:?} pid={}", path, pid);
                    return Ok(pid);
                }
                Err(e) => {
                    eprintln!("error waiting for child: {e}");
                    return Ok(pid);
                }
            }
        }
        Err(err) => {
            // If the error indicates elevation is required (Windows error 740),
            // attempt to re-launch via PowerShell Start-Process -Verb RunAs
            // which will show a UAC prompt.
            if let Some(code) = err.raw_os_error() {
                if code == 740 {
                    #[cfg(target_os = "windows")]
                    {
                        let path_str = path.to_string_lossy().replace('"', "\"");
                        let ps_cmd = format!(
                            "Start-Process -FilePath \"{}\" -Verb RunAs",
                            path_str
                        );

                        let elevated = Command::new("powershell")
                            .args(&["-NoProfile", "-Command", &ps_cmd])
                            .spawn()
                            .map_err(|e| format!("Could not elevate process: {e}"))?;

                        let pid = elevated.id();
                        println!("launched (elevated) game path={:?} pid={}", path, pid);
                        return Ok(pid);
                    }
                }
            }

            return Err(format!("Could not launch the selected game: {err}"));
        }
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(
            tauri_plugin_global_shortcut::Builder::new()
                .with_handler(|app, shortcut, event| {
                    if shortcut.matches(Modifiers::ALT | Modifiers::SHIFT, Code::KeyQ)
                        && event.state() == ShortcutState::Pressed
                    {
                        if let Some(window) = app.get_webview_window("guide-overlay") {
                            if window.is_visible().unwrap_or(false) {
                                let _ = window.hide();
                            } else {
                                let _ = window.show();
                                let _ = window.set_focus();
                            }
                        }
                    }
                })
                .build(),
        )
        .setup(|app| {
            let shortcut = Shortcut::new(Some(Modifiers::ALT | Modifiers::SHIFT), Code::KeyQ);
            app.global_shortcut().register(shortcut)?;
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            list_games,
            import_game,
            import_steam_games,
            remove_game,
            update_game,
            ai_guide::ask_game_guide,
            detect_running_game,
            launch_game,
            show_guide_overlay,
            hide_guide_overlay
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
