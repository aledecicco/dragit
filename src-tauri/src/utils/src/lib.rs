use std::path::{Path, PathBuf};

static GIT_FOLDER_NAME: &str = ".git";
static CONFIG_FOLDER_NAME: &str = "config";
static OBJECTS_FOLDER_NAME: &str = "objects";
static INDEX_FILE_NAME: &str = "index";
static HEAD_FILE_NAME: &str = "HEAD";
static REFS_FOLDER_NAME: &str = "refs";
static HEADS_FOLDER_NAME: &str = "heads";
static REMOTES_FOLDER_NAME: &str = "remotes";
static STASHES_FILE_NAME: &str = "stash";
static TAGS_FOLDER_NAME: &str = "tags";
static MERGE_HEAD_FILE_NAME: &str = "MERGE_HEAD";
static REBASE_HEAD_FILE_NAME: &str = "REBASE_HEAD";
static CHERRY_PICK_HEAD_FILE_NAME: &str = "CHERRY_PICK_HEAD";
static REVERT_HEAD_FILE_NAME: &str = "REVERT_HEAD";

pub fn get_git_folder(repo_path: &Path) -> PathBuf {
    repo_path.join(GIT_FOLDER_NAME)
}

pub fn get_head_file(repo_path: &Path) -> PathBuf {
    get_git_folder(repo_path).join(HEAD_FILE_NAME)
}

pub fn get_config_folder(repo_path: &Path) -> PathBuf {
    get_git_folder(repo_path).join(CONFIG_FOLDER_NAME)
}

pub fn get_objects_folder(repo_path: &Path) -> PathBuf {
    get_git_folder(repo_path).join(OBJECTS_FOLDER_NAME)
}

pub fn get_index_file(repo_path: &Path) -> PathBuf {
    get_git_folder(repo_path).join(INDEX_FILE_NAME)
}

pub fn get_stashes_file(repo_path: &Path) -> PathBuf {
    get_git_folder(repo_path)
        .join(REFS_FOLDER_NAME)
        .join(STASHES_FILE_NAME)
}

pub fn get_tags_folder(repo_path: &Path) -> PathBuf {
    get_git_folder(repo_path)
        .join(REFS_FOLDER_NAME)
        .join(TAGS_FOLDER_NAME)
}

pub fn get_branches_folder(repo_path: &Path) -> PathBuf {
    get_git_folder(repo_path)
        .join(REFS_FOLDER_NAME)
        .join(HEADS_FOLDER_NAME)
}

pub fn get_remotes_folder(repo_path: &Path) -> PathBuf {
    get_git_folder(repo_path)
        .join(REFS_FOLDER_NAME)
        .join(REMOTES_FOLDER_NAME)
}

pub fn get_rebase_head_file(repo_path: &Path) -> PathBuf {
    get_git_folder(repo_path).join(REBASE_HEAD_FILE_NAME)
}

pub fn get_merge_head_file(repo_path: &Path) -> PathBuf {
    get_git_folder(repo_path).join(MERGE_HEAD_FILE_NAME)
}

pub fn get_cherry_pick_head_file(repo_path: &Path) -> PathBuf {
    get_git_folder(repo_path).join(CHERRY_PICK_HEAD_FILE_NAME)
}

pub fn get_revert_head_file(repo_path: &Path) -> PathBuf {
    get_git_folder(repo_path).join(REVERT_HEAD_FILE_NAME)
}
