use partially::Partial;
use tauri::AppHandle;
use tauri_plugin_store::{JsonValue, StoreExt};

use models::{PartialSettings, PartialStorage, Reference, RepositoryStorage, Storage, Upstream};

static STORAGE_FILE_NAME: &str = "storage.json";
static FOLDERS_LIMIT: usize = 10;

pub fn get_storage(app_handle: &AppHandle) -> Storage {
    let store = app_handle.store(STORAGE_FILE_NAME);

    if let Ok(store) = store {
        let json = JsonValue::Object(store.entries().into_iter().collect());
        let stored = serde_json::from_value::<Storage>(json).unwrap_or_default();

        stored
    } else {
        Storage::default()
    }
}

fn set_storage(app_handle: &AppHandle, storage: &Storage) -> Result<(), tauri_plugin_store::Error> {
    let store = app_handle.store(STORAGE_FILE_NAME)?;
    let json = serde_json::to_value(storage).map_err(|e| tauri_plugin_store::Error::Json(e))?;

    if let Some(keyvalues) = json.as_object() {
        for (key, value) in keyvalues {
            store.set(key, value.clone());
        }

        store.save()?;
    }

    Ok(())
}

fn update_storage(
    app_handle: &AppHandle,
    partial: &PartialStorage,
) -> Result<(), tauri_plugin_store::Error> {
    let mut stored = get_storage(app_handle);
    stored.apply_some(partial.clone());

    set_storage(app_handle, &stored)
}

pub fn add_recent_folder(
    app_handle: &AppHandle,
    path: &str,
) -> Result<(), tauri_plugin_store::Error> {
    let mut recents = get_storage(app_handle).recent_folders;

    recents.retain(|recent| recent != path);
    recents.insert(0, path.to_string());
    recents.truncate(FOLDERS_LIMIT);

    update_storage(
        app_handle,
        &PartialStorage {
            recent_folders: Some(recents.clone()),
            ..Default::default()
        },
    )
}

pub fn remove_recent_folder(
    app_handle: &AppHandle,
    path: &str,
) -> Result<(), tauri_plugin_store::Error> {
    let mut recents = get_storage(app_handle).recent_folders;
    recents.retain(|recent| recent != path);

    update_storage(
        app_handle,
        &PartialStorage {
            recent_folders: Some(recents),
            ..Default::default()
        },
    )
}

pub fn set_last_opened(
    app_handle: &AppHandle,
    path: &str,
) -> Result<(), tauri_plugin_store::Error> {
    update_storage(
        app_handle,
        &PartialStorage {
            last_opened: Some(Some(path.to_string())),
            ..Default::default()
        },
    )
}

pub fn remove_last_opened(app_handle: &AppHandle) -> Result<(), tauri_plugin_store::Error> {
    update_storage(
        app_handle,
        &PartialStorage {
            last_opened: Some(None),
            ..Default::default()
        },
    )
}

pub fn patch_settings(
    app_handle: &AppHandle,
    new_settings: &PartialSettings,
) -> Result<(), tauri_plugin_store::Error> {
    let mut settings = get_storage(app_handle).settings;
    settings.apply_some(new_settings.clone());

    update_storage(
        app_handle,
        &PartialStorage {
            settings: Some(settings),
            ..Default::default()
        },
    )
}

pub fn load_repository_storage(app_handle: &AppHandle, repo_path: &str) -> RepositoryStorage {
    let stored = get_storage(app_handle);

    let found = stored.per_repository.iter().find_map(|(path, storage)| {
        if path == repo_path {
            Some(storage.clone())
        } else {
            None
        }
    });

    found.unwrap_or_default()
}

pub fn save_branch_bases(
    app_handle: &AppHandle,
    repo_path: &str,
    branch_bases: Vec<(String, Option<Reference>)>,
) -> Result<(), tauri_plugin_store::Error> {
    let mut stored = get_storage(app_handle);
    let mut repo_storage = stored
        .per_repository
        .iter()
        .find_map(|(path, storage)| {
            if path == repo_path {
                Some(storage.clone())
            } else {
                None
            }
        })
        .unwrap_or_default();

    repo_storage.branch_bases = branch_bases.clone();
    stored.per_repository.retain(|(path, _)| path != repo_path);
    stored
        .per_repository
        .insert(0, (repo_path.to_string(), repo_storage));
    stored.per_repository.truncate(FOLDERS_LIMIT);

    set_storage(app_handle, &stored)
}

pub fn save_branch_upstreams(
    app_handle: &AppHandle,
    repo_path: &str,
    branch_upstreams: Vec<(String, Upstream)>,
) -> Result<(), tauri_plugin_store::Error> {
    let mut stored = get_storage(app_handle);
    let mut repo_storage = stored
        .per_repository
        .iter()
        .find_map(|(path, storage)| {
            if path == repo_path {
                Some(storage.clone())
            } else {
                None
            }
        })
        .unwrap_or_default();

    repo_storage.branch_upstreams = branch_upstreams.clone();

    stored.per_repository.retain(|(path, _)| path != repo_path);
    stored
        .per_repository
        .insert(0, (repo_path.to_string(), repo_storage));
    stored.per_repository.truncate(FOLDERS_LIMIT);

    set_storage(app_handle, &stored)
}
