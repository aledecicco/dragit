use partially::Partial;
use tauri::AppHandle;
use tauri_plugin_store::{JsonValue, StoreExt};

use models::{PartialSettings, Settings};

static STORAGE_FILE_NAME: &str = "storage.json";
static RECENT_FILES_LIMIT: usize = 10;

pub fn add_recent_folder(
    app_handle: &AppHandle,
    path: &str,
) -> Result<(), tauri_plugin_store::Error> {
    let mut recents = get_stored_settings(app_handle)?
        .recent_folders
        .unwrap_or(Vec::new());

    recents.retain(|recent| recent != path);
    recents.insert(0, path.to_string());
    recents.truncate(RECENT_FILES_LIMIT);

    save_settings(
        app_handle,
        &PartialSettings {
            recent_folders: Some(recents),
            ..Default::default()
        },
    )
}

pub fn remove_recent_folder(
    app_handle: &AppHandle,
    path: &str,
) -> Result<(), tauri_plugin_store::Error> {
    let recents = get_stored_settings(app_handle)?.recent_folders;

    if let Some(mut recents) = recents {
        recents.retain(|recent| recent != path);

        save_settings(
            app_handle,
            &PartialSettings {
                recent_folders: Some(recents),
                ..Default::default()
            },
        )
    } else {
        Ok(())
    }
}

pub fn set_last_opened(
    app_handle: &AppHandle,
    path: &str,
) -> Result<(), tauri_plugin_store::Error> {
    save_settings(
        app_handle,
        &PartialSettings {
            last_opened: Some(Some(path.to_string())),
            ..Default::default()
        },
    )
}

pub fn remove_last_opened(app_handle: &AppHandle) -> Result<(), tauri_plugin_store::Error> {
    save_settings(
        app_handle,
        &PartialSettings {
            last_opened: Some(None),
            ..Default::default()
        },
    )
}

fn get_stored_settings(
    app_handle: &AppHandle,
) -> Result<PartialSettings, tauri_plugin_store::Error> {
    let store = app_handle.store(STORAGE_FILE_NAME)?;
    let json = JsonValue::Object(store.entries().into_iter().collect());
    let partial = serde_json::from_value(json).map_err(|e| tauri_plugin_store::Error::Json(e))?;

    Ok(partial)
}

pub fn load_settings(app_handle: &AppHandle) -> Settings {
    let stored_settings = get_stored_settings(app_handle);
    let mut settings = Settings::default();

    if let Ok(stored_settings) = stored_settings {
        settings.apply_some(stored_settings);
    }

    settings
}

pub fn save_settings(
    app_handle: &AppHandle,
    settings: &PartialSettings,
) -> Result<(), tauri_plugin_store::Error> {
    let store = app_handle.store(STORAGE_FILE_NAME)?;
    let mut stored_settings = get_stored_settings(app_handle)?;
    stored_settings.apply_some(settings.clone());

    let json =
        serde_json::to_value(stored_settings).map_err(|e| tauri_plugin_store::Error::Json(e))?;

    if let Some(keyvalues) = json.as_object() {
        for (key, value) in keyvalues {
            store.set(key, value.clone());
        }

        store.save()?;
    }

    Ok(())
}
