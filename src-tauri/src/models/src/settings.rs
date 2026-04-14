#[derive(serde::Serialize, serde::Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
#[derive(partially::Partial)]
#[partially(derive(serde::Serialize, serde::Deserialize, Debug, Default, Clone))]
pub struct Settings {
    pub open_last_on_start: bool,

    pub file_opener_app: String,

    pub confirm_dangerous_actions: bool,

    pub prefer_inline: bool,

    pub relative_timestamps: bool,

    pub sort_branches_by_date: bool,

    pub auto_fetch_remote: bool,

    pub stashes_open_by_default: bool,

    pub show_large_diffs: bool,

    pub show_word_diffs: bool,

    pub recent_folders: Vec<String>,

    pub last_opened: Option<String>,
}

impl Default for Settings {
    fn default() -> Self {
        Self {
            open_last_on_start: true,

            file_opener_app: "code".to_string(),

            confirm_dangerous_actions: true,

            prefer_inline: true,

            relative_timestamps: true,

            sort_branches_by_date: true,

            auto_fetch_remote: false,

            stashes_open_by_default: false,

            show_large_diffs: false,

            show_word_diffs: true,

            recent_folders: Vec::new(),

            last_opened: None,
        }
    }
}
