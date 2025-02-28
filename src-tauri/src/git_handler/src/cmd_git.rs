use std::{
    collections::HashMap,
    io::{self, ErrorKind},
    path::Path,
    process::{Command, ExitStatus, Output},
    string::FromUtf8Error,
};

use models::{
    AncestorInfo, BranchDivergence, BranchInfo, CommitInfo, CommonAncestorInfo, GitError,
    GitHandler, HeadInfo, HistoryItem,
};

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
        if output.status.code() == Some(0) {
            Ok(output)
        } else {
            println!("{:?}", String::from_utf8(output.stderr));
            Err(io::Error::from(ErrorKind::Other))
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

    fn get_branches(&self) -> Result<Vec<BranchInfo>, GitError> {
        command_output(
            &self.get_path()?,
            ["branch", "--list", "-a", BRANCHES_INFO_FORMAT],
        )
        .ok()
        .and_then(|output| self.get_output_lines(output).ok())
        .ok_or(GitError::GetBranchesFailed {})
        .and_then(|lines| {
            Ok(lines
                .iter()
                .map(parse_branch_info)
                .filter_map(|x| x)
                .collect())
        })
    }

    fn checkout_local_branch(&self, branch: &str) -> Result<(), GitError> {
        let a = command_output(&self.get_path()?, ["checkout", branch]);

        println!("{:?}", a);
        a.or(Err(GitError::CheckoutBranchFailed {
            branch: branch.to_string(),
        }))?;

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

        let lines = command_output(
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
        })?;

        lines
            .iter()
            .map(parse_history_item)
            .map(|item| {
                item.ok_or(GitError::GetReferenceHistoryFailed {
                    reference: branch.to_string(),
                })
            })
            .collect()
    }

    fn get_commit_info(&self, reference: &str) -> Result<CommitInfo, GitError> {
        command_output(
            &self.get_path()?,
            ["show", reference, COMMIT_INFO_FORMAT, "--quiet"],
        )
        .ok()
        .and_then(|output| self.get_output_lines(output).ok())
        .and_then(|lines| parse_commit_info(&lines))
        .ok_or(GitError::GetCommitInfoFailed {
            reference: reference.to_string(),
        })
    }

    fn get_head_info(&self) -> Result<HeadInfo, GitError> {
        let path = self.get_path()?;

        command_output(
            &path,
            ["status", "--porcelain=2", "--untracked=normal", "--branch"],
        )
        .ok()
        .and_then(|output| self.get_output_lines(output).ok())
        .and_then(|lines| parse_head_info(&path, &lines))
        .ok_or(GitError::GetHeadInfoFailed {})
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

    fn commit_index(&self, message: &str, is_amend: bool) -> Result<(), GitError> {
        let mut args = vec!["commit", "-m", message];

        if is_amend {
            args.push("--amend");
        }

        command_output(&self.get_path()?, args).or(Err(GitError::CommitFailed {}))?;

        Ok(())
    }

    fn get_common_ancestor(
        &self,
        branch: &str,
        base_branch: &str,
    ) -> Result<Option<CommonAncestorInfo>, GitError> {
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

        let mut prev_branch_pointer = None;
        let mut branch_pointer = parse_ref(branch, 0)?.map(|hash| (hash, 0));
        let mut base_pointer = parse_ref(base_branch, 0)?.map(|hash| (hash, 0));

        // For each commit in the branch, keep track of the commit that comes immediately next and its depth.
        let mut found_in_branch: HashMap<String, Option<(String, u64)>> = HashMap::new();
        // For each commit in the base branch, keep track of the depth it was found at.
        let mut found_in_base: HashMap<String, u64> = HashMap::new();

        loop {
            if let Some((branch_hash, branch_distance)) = branch_pointer {
                if let Some(base_distance) = found_in_base.get(&branch_hash) {
                    return Ok(Some(CommonAncestorInfo {
                        last_commit: prev_branch_pointer.map(
                            |(prev_branch_hash, prev_branch_distance)| AncestorInfo {
                                hash: prev_branch_hash,
                                distance: prev_branch_distance,
                            },
                        ),
                        common_commit: AncestorInfo {
                            hash: branch_hash,
                            distance: *base_distance,
                        },
                    }));
                }

                found_in_branch.insert(branch_hash.to_owned(), prev_branch_pointer);
                prev_branch_pointer = Some((branch_hash.to_string(), branch_distance));
                branch_pointer = parse_ref(&branch_hash, 1)?.map(|hash| (hash, branch_distance + 1))
            }

            if let Some((base_hash, base_distance)) = base_pointer {
                if let Some(prev_branch_pointer) = found_in_branch.get(&base_hash) {
                    return Ok(Some(CommonAncestorInfo {
                        last_commit: prev_branch_pointer.as_ref().map(
                            |(prev_branch_hash, prev_branch_distance)| AncestorInfo {
                                hash: prev_branch_hash.to_string(),
                                distance: *prev_branch_distance,
                            },
                        ),
                        common_commit: AncestorInfo {
                            hash: base_hash,
                            distance: base_distance,
                        },
                    }));
                }

                found_in_base.insert(base_hash.to_owned(), base_distance);
                base_pointer = parse_ref(&base_hash, 1)?.map(|hash| (hash, base_distance + 1))
            }

            if branch_pointer.is_none() && base_pointer.is_none() {
                return Ok(None);
            }
        }
    }

    fn get_branch_divergence(
        &self,
        branch: &str,
        base_branch: &str,
    ) -> Result<BranchDivergence, GitError> {
        command_output(
            &self.get_path()?,
            [
                "rev-list",
                "--left-right",
                "--count",
                &format!("{}...{}", branch, base_branch),
            ],
        )
        .ok()
        .and_then(|output| self.get_output_string(output).ok())
        .and_then(|line| parse_branch_divergence(&line))
        .ok_or(GitError::GetBranchDivergenceFailed {
            branch: branch.to_string(),
            base_branch: base_branch.to_string(),
        })
    }

    fn push_branch(
        &self,
        branch: &str,
        remote: &str,
        remote_branch: &str,
        is_force: bool,
    ) -> Result<(), GitError> {
        let remote_ref = format!("{}:{}", branch, remote_branch);
        let mut args = vec!["push", remote, &remote_ref];

        if is_force {
            args.push("--force");
        }

        command_output(&self.get_path()?, args).or(Err(GitError::PushBranchFailed {
            branch: branch.to_string(),
            remote: remote.to_string(),
            remote_branch: remote_branch.to_string(),
        }))?;

        Ok(())
    }

    fn pull_branch(
        &self,
        branch: &str,
        remote: &str,
        remote_branch: &str,
        is_rebase: bool,
    ) -> Result<(), GitError> {
        let remote_ref = format!("{}:{}", branch, remote_branch);
        let mut args = vec!["pull", remote, &remote_ref];

        if is_rebase {
            args.push("--rebase");
        }

        command_output(&self.get_path()?, args).or(Err(GitError::PullBranchFailed {
            branch: branch.to_string(),
            remote: remote.to_string(),
            remote_branch: remote_branch.to_string(),
        }))?;

        Ok(())
    }
}
