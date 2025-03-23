use tauri::AppHandle;
use tauri_plugin_store::{JsonValue, StoreExt};

use models::Settings;

static SETTINGS_FILE_NAME: &str = "settings.json";
static RECENTS_FILE_NAME: &str = "recents.json";
static RECENT_FILES_LIMIT: usize = 10;

pub fn get_recent_folders(app_handle: &AppHandle) -> Vec<String> {
    let saved_recents = app_handle.store(RECENTS_FILE_NAME);
    let mut recents = Vec::new();

    if let Ok(saved_recents) = saved_recents {
        match saved_recents.get("recentlyOpened") {
            Some(JsonValue::Array(recent)) => {
                recents = recent
                    .iter()
                    .filter_map(|value| match value {
                        JsonValue::String(value) => Some(value.to_string()),
                        _ => None,
                    })
                    .collect()
            }
            _ => {}
        }
    }

    recents
}

pub fn add_recent_folder(
    app_handle: &AppHandle,
    path: &str,
) -> Result<(), tauri_plugin_store::Error> {
    let mut recents = get_recent_folders(app_handle);
    let saved_recents = app_handle.store(RECENTS_FILE_NAME)?;

    recents.retain(|recent| recent != path);
    recents.push(path.to_string());
    recents.truncate(RECENT_FILES_LIMIT);

    saved_recents.set("recentlyOpened", recents);
    saved_recents.save()
}

pub fn load_settings(app_handle: &AppHandle) -> Settings {
    let saved_settings = app_handle.store(SETTINGS_FILE_NAME);
    let mut settings = Settings::default();

    if let Ok(saved_settings) = saved_settings {
        match saved_settings.get("openLastOnStart") {
            Some(JsonValue::Bool(open_last)) => settings.open_last_on_start = open_last,
            _ => {}
        }
    }

    settings
}

pub fn save_settings(
    app_handle: &AppHandle,
    settings: &Settings,
) -> Result<(), tauri_plugin_store::Error> {
    let saved_settings = app_handle.store(SETTINGS_FILE_NAME)?;

    saved_settings.set("openLastOnStart", settings.open_last_on_start);

    saved_settings.save()
}
