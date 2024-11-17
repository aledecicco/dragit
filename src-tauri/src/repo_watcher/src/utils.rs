use std::path::{Path, PathBuf};

static GIT_FOLDER_NAME: &str = ".git";
static OBJECTS_FOLDER_NAME: &str = "objects";
static INDEX_FILE_NAME: &str = "index";
static HEAD_FILE_NAME: &str = "HEAD";
static REFS_FOLDER_NAME: &str = "refs";
static HEADS_FOLDER_NAME: &str = "heads";

pub(crate) fn get_git_folder(repo_path: &Path) -> PathBuf {
    repo_path.join(GIT_FOLDER_NAME)
}

pub(crate) fn get_head_file(repo_path: &Path) -> PathBuf {
    get_git_folder(repo_path).join(HEAD_FILE_NAME)
}

pub(crate) fn get_objects_folder(repo_path: &Path) -> PathBuf {
    get_git_folder(repo_path).join(OBJECTS_FOLDER_NAME)
}

pub(crate) fn get_index_file(repo_path: &Path) -> PathBuf {
    get_git_folder(repo_path).join(INDEX_FILE_NAME)
}

pub(crate) fn get_branches_folder(repo_path: &Path) -> PathBuf {
    get_git_folder(repo_path)
        .join(REFS_FOLDER_NAME)
        .join(HEADS_FOLDER_NAME)
}
