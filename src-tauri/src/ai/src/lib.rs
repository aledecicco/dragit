use std::{
    io::Write,
    process::{Command, Stdio},
};

use models::AgentError;
use serde::Deserialize;

/// Service/user pair under which the API key is stored in the OS keychain.
const KEYRING_SERVICE: &str = "dragit";
const KEYRING_USER: &str = "ai-provider";

fn get_entry() -> Result<keyring::Entry, AgentError> {
    keyring::Entry::new(KEYRING_SERVICE, KEYRING_USER).map_err(|err| AgentError::KeychainFailed {
        reason: err.to_string(),
    })
}

/// Stores the AI provider API key in the OS keychain. An empty key clears it.
pub fn set_api_key(key: &str) -> Result<(), AgentError> {
    get_entry()?
        .set_password(key)
        .map_err(|err| AgentError::KeychainFailed {
            reason: err.to_string(),
        })
}

/// Whether a non-empty API key is currently stored.
pub fn has_api_key() -> bool {
    get_entry()
        .ok()
        .and_then(|entry| entry.get_password().ok())
        .is_some_and(|key| !key.is_empty())
}

/// Returns the currently stored API key.
fn get_api_key() -> Result<String, AgentError> {
    match get_entry()?.get_password() {
        Ok(key) if !key.is_empty() => Ok(key),
        Ok(_) | Err(keyring::Error::NoEntry) => Err(AgentError::NotConfigured {
            reason: "Set the AI API key in the settings first".to_string(),
        }),
        Err(err) => Err(AgentError::KeychainFailed {
            reason: err.to_string(),
        }),
    }
}

#[derive(Deserialize)]
struct ChatResponse {
    choices: Vec<Choice>,
}

#[derive(Deserialize)]
struct Choice {
    message: ChoiceMessage,
}

#[derive(Deserialize)]
struct ChoiceMessage {
    content: String,
}

/// Returns the trimmed stream contents, or `None` when empty.
fn read_stream(bytes: &[u8]) -> Option<String> {
    let trimmed = String::from_utf8_lossy(bytes).trim().to_string();
    if trimmed.is_empty() {
        None
    } else {
        Some(trimmed)
    }
}

/// Drafts a commit message via a local CLI (e.g. `claude`), piping the diff on
/// stdin. Runs under the user's own login, so no API key is needed.
fn generate_via_cli(
    command: &str,
    model: &str,
    system_prompt: &str,
    diff: &str,
) -> Result<String, AgentError> {
    let mut cmd = Command::new(command);
    cmd.args([
        "-p",
        "--strict-mcp-config",
        "--system-prompt",
        system_prompt,
    ])
    .stdin(Stdio::piped())
    .stdout(Stdio::piped())
    .stderr(Stdio::piped());

    if !model.trim().is_empty() {
        cmd.args(["--model", model]);
    }

    #[cfg(windows)]
    {
        // Avoid opening a new console window for the CLI process on Windows.
        use std::os::windows::process::CommandExt;
        cmd.creation_flags(0x08000000);
    }

    let mut process = cmd.spawn().map_err(|err| AgentError::RequestFailed {
        reason: format!("Failed to launch \"{command}\": {err}"),
    })?;

    process
        .stdin
        .take()
        .ok_or_else(|| AgentError::RequestFailed {
            reason: "Failed to open the CLI's input".to_string(),
        })?
        .write_all(diff.as_bytes())
        .map_err(|err| AgentError::RequestFailed {
            reason: err.to_string(),
        })?;

    let output = process
        .wait_with_output()
        .map_err(|err| AgentError::RequestFailed {
            reason: err.to_string(),
        })?;

    if !output.status.success() {
        let reason = read_stream(&output.stderr)
            .or(read_stream(&output.stdout))
            .unwrap_or_else(|| {
                format!(
                    "Process exited with status code \"{}\"",
                    output.status.code().unwrap_or(-1)
                )
            });

        return Err(AgentError::RequestFailed { reason });
    }

    Ok(String::from_utf8_lossy(&output.stdout).trim().to_string())
}

/// Drafts a commit message from the configured OpenAI-compatible provider.
pub async fn generate_commit_message(
    base_url: &str,
    model: &str,
    system_prompt: &str,
    diff: &str,
) -> Result<String, AgentError> {
    if !base_url.trim_start().starts_with("http") {
        return generate_via_cli(base_url.trim(), model, system_prompt, diff);
    }

    let api_key = get_api_key()?;

    let body = serde_json::json!({
        "model": model,
        "stream": false,
        "messages": [
            { "role": "system", "content": system_prompt },
            { "role": "user", "content": diff },
        ],
    });

    let response = reqwest::Client::new()
        .post(format!(
            "{}/{}",
            base_url.trim_end_matches('/'),
            "chat/completions"
        ))
        .bearer_auth(api_key)
        .json(&body)
        .send()
        .await
        .map_err(|err| AgentError::RequestFailed {
            reason: err.to_string(),
        })?;

    let status = response.status();
    let text = response
        .text()
        .await
        .map_err(|err| AgentError::RequestFailed {
            reason: err.to_string(),
        })?;

    if !status.is_success() {
        return Err(AgentError::RequestFailed {
            reason: format!("Agent request failed with {}: {}", status, text),
        });
    }

    let parsed: ChatResponse =
        serde_json::from_str(&text).map_err(|err| AgentError::RequestFailed {
            reason: format!("Failed to parse the agent's response: {}", err),
        })?;

    let content = parsed
        .choices
        .into_iter()
        .next()
        .map(|choice| choice.message.content)
        .ok_or_else(|| AgentError::RequestFailed {
            reason: "The agent failed to produce an output".to_string(),
        })?;

    Ok(content.trim().to_string())
}
