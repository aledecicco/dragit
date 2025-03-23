#[derive(serde::Serialize, serde::Deserialize, Debug, Clone)]
#[serde(rename_all(serialize = "camelCase", deserialize = "snake_case"))]
pub struct Settings {
    pub open_last_on_start: bool,
}

impl Default for Settings {
    fn default() -> Self {
        Self {
            open_last_on_start: true,
        }
    }
}
