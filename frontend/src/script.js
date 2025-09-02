// frontend/script.js
const apiUrl = "http://127.0.0.1:8000/ask";
const askBtn = document.getElementById("askBtn");
const questionInput = document.getElementById("question");
const chat = document.getElementById("chat");

function appendMessage(role, text) {
  const wrapper = document.createElement("div");
  wrapper.className = `message ${role} mb-3`;
  wrapper.innerHTML = `
    <div class="role text-sm text-gray-600">${role === "user" ? "You" : "Chotu AI"}</div>
    <div class="bubble mt-1 text-sm">${text.replace(/\n/g, "<br/>")}</div>
  `;
  chat.appendChild(wrapper);
  chat.scrollTop = chat.scrollHeight;
}

async function askQuestion() {
  const q = questionInput.value.trim();
  if (!q) return;
  appendMessage("user", q);
  questionInput.value = "";
  appendMessage("bot", "Thinking...");

  try {
    const resp = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: q }),
    });

    // Remove the last "Thinking..." bot message
    const botMsgs = chat.querySelectorAll(".message.bot");
    if (botMsgs.length) {
      botMsgs[botMsgs.length - 1].remove();
    }

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      appendMessage("bot", `Error: ${resp.status} ${err.detail || resp.statusText}`);
      return;
    }

    const data = await resp.json();
    const sql = data.sql_query || "<no SQL generated>";
    const result = formatResult(data.result);

    appendMessage(
      "bot",
      `<div>
        <p><strong>Generated SQL:</strong></p>
        <pre class="whitespace-pre-wrap text-xs">${escapeHtml(sql)}</pre>
        <p class="mt-2"><strong>Answer from DB:</strong></p>
        ${result}
      </div>`
    );
  } catch (e) {
    // Remove "Thinking..." message then show error
    const botMsgs = chat.querySelectorAll(".message.bot");
    if (botMsgs.length) botMsgs[botMsgs.length - 1].remove();
    appendMessage("bot", `Connection error: ${e.message}`);
  }
}

function escapeHtml(unsafe) {
  if (!unsafe) return "";
  return unsafe
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function formatResult(result) {
  if (!result) return "<em>No result returned.</em>";

  if (Array.isArray(result)) {
    if (result.length === 0) return "<em>No rows returned.</em>";

    // If it's array of arrays (rows)
    if (Array.isArray(result[0])) {
      let html = "<table border='1' cellpadding='6'><tbody>";
      result.forEach(row => {
        html += "<tr>";
        row.forEach(col => {
          html += `<td>${escapeHtml(String(col))}</td>`;
        });
        html += "</tr>";
      });
      html += "</tbody></table>";
      return html;
    }

    // If it's array of objects
    if (typeof result[0] === "object") {
      const keys = Object.keys(result[0]);
      let html = "<table border='1' cellpadding='6'><thead><tr>";
      keys.forEach(k => { html += `<th>${escapeHtml(k)}</th>`; });
      html += "</tr></thead><tbody>";

      result.forEach(row => {
        html += "<tr>";
        keys.forEach(k => { html += `<td>${escapeHtml(String(row[k]))}</td>`; });
        html += "</tr>";
      });
      html += "</tbody></table>";
      return html;
    }
  }

  // Fallback (string, number, object)
  return `<pre>${escapeHtml(JSON.stringify(result, null, 2))}</pre>`;
}

askBtn.addEventListener("click", askQuestion);
questionInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") askQuestion();
});
