use std::{
    io::{self, ErrorKind},
    path::Path,
    process::{Command, Output},
    string::FromUtf8Error,
};

use models::{CommitInfo, GitError, GitHandler, HeadInfo};

use crate::{parse_commit_info, parse_head_info, COMMIT_INFO_FORMAT};

/// Implementation of [`GitHandler`] that uses the `git` cmd for its operations.
pub struct CmdGit {
    path: Option<String>,
}

fn run_command<'a, I>(path: &str, args: I) -> Result<Output, io::Error>
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
        run_command(&self.get_path()?, ["init"]).or(Err(GitError::AlreadyARepository {}))?;

        Ok(())
    }

    fn is_repository(&self) -> bool {
        self.get_path()
            .is_ok_and(|path| run_command(&path, ["rev-parse"]).is_ok())
    }

    fn get_branches(&self) -> Result<Vec<String>, GitError> {
        run_command(
            &self.get_path()?,
            ["branch", "-a", "--format=%(refname:short)"],
        )
        .ok()
        .and_then(|output| self.get_output_lines(output).ok())
        .ok_or(GitError::GetBranchesFailed {})
    }

    fn checkout_local_branch(&self, branch: &str) -> Result<(), GitError> {
        run_command(&self.get_path()?, ["checkout", branch]).or(Err(
            GitError::CheckoutBranchFailed {
                branch: branch.to_string(),
            },
        ))?;

        Ok(())
    }

    fn fetch_remote(&self, remote: &str) -> Result<(), GitError> {
        run_command(&self.get_path()?, ["fetch", remote]).or(Err(GitError::FetchRemoteFailed {
            remote: remote.to_string(),
        }))?;

        Ok(())
    }

    fn get_commit_history(
        &self,
        branch: &str,
        start_after: u8,
        limit: u8,
    ) -> Result<Vec<String>, GitError> {
        let page_arg = start_after.to_string();
        let page_size_arg = limit.to_string();
        let branch_arg = branch.to_string() + "~" + &page_arg;

        run_command(
            &self.get_path()?,
            [
                "rev-list",
                &branch_arg,
                "-n",
                &page_size_arg,
                "--first-parent",
                "--abbrev-commit",
            ],
        )
        .ok()
        .and_then(|output| self.get_output_lines(output).ok())
        .ok_or(GitError::GetReferenceHistoryFailed {
            reference: branch.to_string(),
        })
    }

    fn get_commit_info(&self, reference: &str) -> Result<CommitInfo, GitError> {
        let lines = run_command(
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
        let lines = run_command(
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
        run_command(&self.get_path()?, args).or(Err(GitError::AddToIndexFailed {}))?;

        Ok(())
    }

    fn remove_from_index(&self, files: &Vec<&str>) -> Result<(), GitError> {
        let args = [vec!["reset"], files.clone()].concat();
        run_command(&self.get_path()?, args).or(Err(GitError::RemoveFromIndexFailed {}))?;

        Ok(())
    }

    fn commit_index(&self, message: &str) -> Result<(), GitError> {
        run_command(&self.get_path()?, ["commit", "-m", message])
            .or(Err(GitError::CommitFailed {}))?;

        Ok(())
    }
}
