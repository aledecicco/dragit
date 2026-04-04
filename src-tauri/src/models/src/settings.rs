#[derive(serde::Serialize, serde::Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct Settings {
    pub open_last_on_start: bool,

    pub file_opener_app: String,
}

impl Default for Settings {
    fn default() -> Self {
        Self {
            open_last_on_start: true,

            file_opener_app: "code".to_string(),
        }
    }
}
