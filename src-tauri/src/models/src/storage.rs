use crate::{Reference, Upstream};

#[derive(serde::Serialize, serde::Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
#[derive(partially::Partial)]
#[partially(derive(serde::Serialize, serde::Deserialize, Debug, Default, Clone))]
pub struct Storage {
    pub settings: Settings,

    #[serde(default)]
    pub recent_folders: Vec<String>,

    pub last_opened: Option<String>,

    #[serde(default)]
    pub repo_specific: Vec<(String, RepositoryStorage)>,
}

impl Default for Storage {
    fn default() -> Self {
        Self {
            settings: Settings::default(),

            recent_folders: Vec::new(),
            last_opened: None,

            repo_specific: Vec::new(),
        }
    }
}

#[derive(serde::Serialize, serde::Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
#[derive(partially::Partial)]
#[partially(derive(serde::Serialize, serde::Deserialize, Debug, Default, Clone))]
pub struct RepositoryStorage {
    pub branch_bases: Vec<(String, Option<Reference>)>,
    pub branch_upstreams: Vec<(String, Upstream)>,
    pub default_base: String,
}

impl Default for RepositoryStorage {
    fn default() -> Self {
        Self {
            branch_bases: Vec::new(),
            branch_upstreams: Vec::new(),
            default_base: "".to_string(),
        }
    }
}

#[derive(serde::Serialize, serde::Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
#[derive(partially::Partial)]
#[partially(derive(serde::Serialize, serde::Deserialize, Debug, Default, Clone))]
pub struct Settings {
    pub file_opener_app: String,
    pub open_last_on_start: bool,
    pub confirm_dangerous_actions: bool,
    pub auto_fetch_remote: bool,
    pub ask_for_stash_message: bool,

    pub show_shortcut_indicators: bool,
    pub relative_timestamps: bool,
    pub sort_branches_by_date: bool,
    pub stashes_open_by_default: bool,

    pub prefer_inline: bool,
    pub show_large_diffs: bool,
    pub show_word_diffs: bool,

    pub stage_files_shortcut: String,
    pub unstage_files_shortcut: String,
    pub stash_files_shortcut: String,
    pub commit_shortcut: String,
    pub amend_shortcut: String,
    pub push_shortcut: String,
    pub pull_shortcut: String,
    pub refresh_shortcut: String,
    pub focus_unstaged_shortcut: String,
    pub focus_staged_shortcut: String,
    pub focus_branches_shortcut: String,
    pub focus_stashes_shortcut: String,
    pub focus_main_shortcut: String,
    pub close_file_diff_shortcut: String,
}

impl Default for Settings {
    fn default() -> Self {
        Self {
            file_opener_app: "code".to_string(),
            open_last_on_start: true,
            confirm_dangerous_actions: true,
            auto_fetch_remote: false,
            ask_for_stash_message: true,

            show_shortcut_indicators: true,
            relative_timestamps: true,
            sort_branches_by_date: true,
            stashes_open_by_default: false,

            prefer_inline: true,
            show_large_diffs: false,
            show_word_diffs: true,

            stage_files_shortcut: "Ctrl + Shift + A".to_string(),
            unstage_files_shortcut: "Ctrl + Shift + U".to_string(),
            stash_files_shortcut: "Ctrl + Shift + S".to_string(),
            commit_shortcut: "Ctrl + Shift + C".to_string(),
            amend_shortcut: "Ctrl + Shift + M".to_string(),
            push_shortcut: "Ctrl + Shift + P".to_string(),
            pull_shortcut: "Ctrl + Shift + O".to_string(),
            refresh_shortcut: "Ctrl + Shift + R".to_string(),
            focus_unstaged_shortcut: "Ctrl + 2".to_string(),
            focus_staged_shortcut: "Ctrl + 3".to_string(),
            focus_branches_shortcut: "Ctrl + 4".to_string(),
            focus_stashes_shortcut: "Ctrl + 5".to_string(),
            focus_main_shortcut: "Ctrl + 1".to_string(),
            close_file_diff_shortcut: "Ctrl + W".to_string(),
        }
    }
}
