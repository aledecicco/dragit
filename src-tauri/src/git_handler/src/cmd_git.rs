use std::{
    collections::HashMap,
    io::{self, ErrorKind},
    path::Path,
    process::{Command, ExitStatus, Output},
    string::FromUtf8Error,
};

use models::{AncestorInfo, CommitInfo, GitError, GitHandler, HeadInfo, HistoryItem};

use crate::utils::*;

/// Implementation of [`GitHandler`] that uses the `git` cmd for its operations.
pub struct CmdGit {
    path: Option<String>,
}

fn command_output<'a, I>(path: &str, args: I) -> Result<Output, io::Error>
where
    I: IntoIterator<Item = &'a str>,
{
    let mut cmd = Command::new("git");
    let output = cmd.current_dir(path).args(args).output();

    output.and_then(|output| {
        if output.stderr.len() > 0 {
            Err(io::Error::from(ErrorKind::Other))
        } else {
            Ok(output)
        }
    })
}

fn run_command<'a, I>(path: &str, args: I) -> Result<ExitStatus, io::Error>
where
    I: IntoIterator<Item = &'a str>,
{
    let mut cmd = Command::new("git");
    cmd.current_dir(path).args(args).status()
}

impl CmdGit {
    /// Initialize this implementation without a path.
    pub fn new() -> Self {
        CmdGit { path: None }
    }

    /// Returns all the contents of a command's output.
    fn get_output_string(&self, output: Output) -> Result<String, FromUtf8Error> {
        String::from_utf8(output.stdout).map(|res| res.trim().to_string())
    }

    /// Returns the list of lines in a command's output.
    fn get_output_lines(&self, output: Output) -> Result<Vec<String>, FromUtf8Error> {
        Ok(self
            .get_output_string(output)?
            .lines()
            .map(|line| line.trim().to_string())
            .collect())
    }
}

impl GitHandler for CmdGit {
    fn get_path(&self) -> Result<String, GitError> {
        let path = self.path.as_ref().ok_or(GitError::RepositoryNotOpen {})?;
        Ok(path.to_string())
    }

    fn open_folder(&mut self, path: &str) -> Result<(), GitError> {
        if Path::new(path).is_dir() {
            self.path = Some(path.to_string());
            Ok(())
        } else {
            Err(GitError::OpenFolderFailed {
                path: path.to_string(),
            })
        }
    }

    fn init_repository(&self) -> Result<(), GitError> {
        command_output(&self.get_path()?, ["init"]).or(Err(GitError::AlreadyARepository {}))?;

        Ok(())
    }

    fn is_repository(&self) -> bool {
        self.get_path()
            .is_ok_and(|path| command_output(&path, ["rev-parse"]).is_ok())
    }

    fn get_branches(&self) -> Result<Vec<String>, GitError> {
        command_output(
            &self.get_path()?,
            ["branch", "-a", "--format=%(refname:short)"],
        )
        .ok()
        .and_then(|output| self.get_output_lines(output).ok())
        .ok_or(GitError::GetBranchesFailed {})
    }

    fn checkout_local_branch(&self, branch: &str) -> Result<(), GitError> {
        command_output(&self.get_path()?, ["checkout", branch]).or(Err(
            GitError::CheckoutBranchFailed {
                branch: branch.to_string(),
            },
        ))?;

        Ok(())
    }

    fn fetch_remote(&self, remote: &str) -> Result<(), GitError> {
        command_output(&self.get_path()?, ["fetch", remote]).or(Err(
            GitError::FetchRemoteFailed {
                remote: remote.to_string(),
            },
        ))?;

        Ok(())
    }

    fn get_commit_history(
        &self,
        branch: &str,
        start_after: u8,
        limit: u8,
    ) -> Result<Vec<HistoryItem>, GitError> {
        let page_arg = start_after.to_string();
        let page_size_arg = limit.to_string();
        let branch_arg = branch.to_string() + "~" + &page_arg;

        command_output(
            &self.get_path()?,
            [
                "rev-list",
                &branch_arg,
                "-n",
                &page_size_arg,
                "--first-parent",
                "--parents",
            ],
        )
        .ok()
        .and_then(|output| self.get_output_lines(output).ok())
        .ok_or(GitError::GetReferenceHistoryFailed {
            reference: branch.to_string(),
        })
        .and_then(|lines| {
            lines
                .iter()
                .map(parse_history_item)
                .map(|item| {
                    item.ok_or(GitError::GetReferenceHistoryFailed {
                        reference: branch.to_string(),
                    })
                })
                .collect()
        })
    }

    fn get_commit_info(&self, reference: &str) -> Result<CommitInfo, GitError> {
        let lines = command_output(
            &self.get_path()?,
            ["show", reference, COMMIT_INFO_FORMAT, "--quiet"],
        )
        .ok()
        .and_then(|output| self.get_output_lines(output).ok())
        .ok_or(GitError::GetCommitInfoFailed {
            reference: reference.to_string(),
        })?;

        parse_commit_info(&lines).ok_or(GitError::GetCommitInfoFailed {
            reference: reference.to_string(),
        })
    }

    fn get_head_info(&self) -> Result<HeadInfo, GitError> {
        let lines = command_output(
            &self.get_path()?,
            ["status", "--porcelain=2", "--untracked=normal", "--branch"],
        )
        .ok()
        .and_then(|output| self.get_output_lines(output).ok())
        .ok_or(GitError::GetHeadInfoFailed {})?;

        parse_head_info(&lines).ok_or(GitError::GetHeadInfoFailed {})
    }

    fn add_to_index(&self, files: &Vec<&str>) -> Result<(), GitError> {
        let args = [vec!["add"], files.clone()].concat();
        command_output(&self.get_path()?, args).or(Err(GitError::AddToIndexFailed {}))?;

        Ok(())
    }

    fn remove_from_index(&self, files: &Vec<&str>) -> Result<(), GitError> {
        let args = [vec!["reset", "--"], files.clone()].concat();
        command_output(&self.get_path()?, args).or(Err(GitError::RemoveFromIndexFailed {}))?;

        Ok(())
    }

    fn remove_from_tree(&self, files: &Vec<&str>) -> Result<(), GitError> {
        let args = [vec!["rm"], files.clone()].concat();
        command_output(&self.get_path()?, args).or(Err(GitError::RemoveFromTreeFailed {}))?;

        Ok(())
    }

    fn commit_index(&self, message: &str) -> Result<(), GitError> {
        command_output(&self.get_path()?, ["commit", "-m", message])
            .or(Err(GitError::CommitFailed {}))?;

        Ok(())
    }

    fn get_common_ancestor(
        &self,
        branch: &str,
        base_branch: &str,
    ) -> Result<Option<AncestorInfo>, GitError> {
        let parse_ref = |reference: &str, back: u64| -> Result<Option<String>, GitError> {
            command_output(
                &self.get_path()?,
                ["rev-parse", &format!("{}^{}", reference, back)],
            )
            .ok()
            .map(|output| {
                self.get_output_string(output)
                    .map_err(|_| GitError::GetCommonAncestorFailed {
                        branch: branch.to_string(),
                        base_branch: base_branch.to_string(),
                    })
            })
            .transpose()
        };

        let mut branch_distance = 0;
        let mut base_distance = 0;

        // For each commit, keep track of the depth it was found at, and the immediate next commit.
        let mut branch_ancestors: HashMap<String, (u64, Option<String>)> = HashMap::new();
        // For each commit, keep track of the depth it was found at.
        let mut base_ancestors: HashMap<String, u64> = HashMap::new();

        let mut prev_branch_commit = None;
        let mut branch_commit = parse_ref(branch, 0)?;
        let mut base_commit = parse_ref(base_branch, 0)?;

        loop {
            if let Some(branch_hash) = branch_commit {
                if let Some(base_distance) = base_ancestors.get(&branch_hash) {
                    return Ok(Some(AncestorInfo {
                        common_commit: branch_hash,
                        last_commit: prev_branch_commit,
                        branch_distance: branch_distance - 1,
                        base_distance: *base_distance,
                    }));
                }

                branch_ancestors.insert(
                    branch_hash.to_owned(),
                    (branch_distance, prev_branch_commit),
                );
                prev_branch_commit = Some(branch_hash.to_owned());
                branch_commit = parse_ref(&branch_hash, 1)?;
                branch_distance += 1;
            }

            if let Some(base_hash) = base_commit {
                if let Some((branch_distance, prev_branch_commit)) =
                    branch_ancestors.get(&base_hash)
                {
                    return Ok(Some(AncestorInfo {
                        common_commit: base_hash,
                        last_commit: prev_branch_commit.to_owned(),
                        branch_distance: *branch_distance - 1,
                        base_distance: base_distance,
                    }));
                }

                base_ancestors.insert(base_hash.to_owned(), base_distance);
                base_commit = parse_ref(&base_hash, 1)?;
                base_distance += 1;
            }
        }
    }
}
