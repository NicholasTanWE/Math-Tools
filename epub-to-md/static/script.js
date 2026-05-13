/* ── Tab switching ── */
document.querySelectorAll(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
    document.querySelectorAll(".tab-panel").forEach((p) => {
      p.classList.add("hidden");
      p.classList.remove("active");
    });
    btn.classList.add("active");
    const panel = document.getElementById(`tab-${btn.dataset.tab}`);
    panel.classList.remove("hidden");
    panel.classList.add("active");
  });
});

/* ══════════════════════════════════════════
   Helper utilities
══════════════════════════════════════════ */

function showStatus(el, type, html) {
  el.className = `status ${type}`;
  el.innerHTML = html;
}

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

function renderFileList(container, files) {
  if (!files.length) {
    container.classList.add("hidden");
    return;
  }
  const items = Array.from(files)
    .map((f) => `<li>📄 ${f.name} <span style="color:#888;font-size:.85em">(${(f.size / 1024).toFixed(1)} KB)</span></li>`)
    .join("");
  container.innerHTML = `<ul>${items}</ul>`;
  container.classList.remove("hidden");
}

function setupDropZone(dropEl, inputEl, onFilesChosen) {
  // Click to open file dialog
  dropEl.addEventListener("click", () => inputEl.click());
  dropEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") inputEl.click();
  });

  // File input change
  inputEl.addEventListener("change", () => onFilesChosen(inputEl.files));

  // Drag events
  dropEl.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropEl.classList.add("drag-over");
  });
  ["dragleave", "dragend"].forEach((ev) =>
    dropEl.addEventListener(ev, () => dropEl.classList.remove("drag-over"))
  );
  dropEl.addEventListener("drop", (e) => {
    e.preventDefault();
    dropEl.classList.remove("drag-over");
    onFilesChosen(e.dataTransfer.files);
  });
}

/* ══════════════════════════════════════════
   STEP 1 – Single file
══════════════════════════════════════════ */

const dropSingle   = document.getElementById("drop-zone-single");
const inputSingle  = document.getElementById("file-input-single");
const selectedSingle = document.getElementById("single-selected");
const btnSingle    = document.getElementById("btn-convert-single");
const statusSingle = document.getElementById("single-status");

let singleFile = null;

setupDropZone(dropSingle, inputSingle, (files) => {
  const epub = Array.from(files).find((f) => f.name.toLowerCase().endsWith(".epub"));
  if (!epub) {
    showStatus(statusSingle, "error", "Please select an <strong>.epub</strong> file.");
    return;
  }
  singleFile = epub;
  renderFileList(selectedSingle, [epub]);
  btnSingle.disabled = false;
  statusSingle.className = "status hidden";
});

btnSingle.addEventListener("click", async () => {
  if (!singleFile) return;
  btnSingle.disabled = true;
  showStatus(statusSingle, "loading", "⏳ Converting… please wait.");

  const form = new FormData();
  form.append("file", singleFile);

  try {
    const res = await fetch("/convert", { method: "POST", body: form });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(err.detail || res.statusText);
    }
    const blob = await res.blob();
    const filename = singleFile.name.replace(/\.epub$/i, ".md");
    triggerDownload(blob, filename);
    showStatus(statusSingle, "success", `✅ Done! <strong>${filename}</strong> downloaded.`);
  } catch (err) {
    showStatus(statusSingle, "error", `❌ Error: ${err.message}`);
  } finally {
    btnSingle.disabled = false;
  }
});

/* ══════════════════════════════════════════
   STEP 2 – Batch
══════════════════════════════════════════ */

const dropBatch    = document.getElementById("drop-zone-batch");
const inputBatch   = document.getElementById("file-input-batch");
const selectedBatch = document.getElementById("batch-selected");
const btnBatch     = document.getElementById("btn-convert-batch");
const statusBatch  = document.getElementById("batch-status");

let batchFiles = [];

setupDropZone(dropBatch, inputBatch, (files) => {
  const epubs = Array.from(files).filter((f) => f.name.toLowerCase().endsWith(".epub"));
  if (!epubs.length) {
    showStatus(statusBatch, "error", "No <strong>.epub</strong> files found in selection.");
    return;
  }
  batchFiles = epubs;
  renderFileList(selectedBatch, epubs);
  btnBatch.disabled = false;
  statusBatch.className = "status hidden";
  if (epubs.length < files.length) {
    showStatus(
      statusBatch,
      "loading",
      `ℹ️ ${epubs.length} of ${files.length} files are .epub — only those will be converted.`
    );
  }
});

btnBatch.addEventListener("click", async () => {
  if (!batchFiles.length) return;
  btnBatch.disabled = true;
  showStatus(statusBatch, "loading", `⏳ Converting ${batchFiles.length} file(s)… please wait.`);

  const form = new FormData();
  batchFiles.forEach((f) => form.append("files", f));

  try {
    const res = await fetch("/convert-batch", { method: "POST", body: form });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(err.detail || res.statusText);
    }
    const blob = await res.blob();
    triggerDownload(blob, "converted.zip");
    showStatus(statusBatch, "success", `✅ Done! <strong>converted.zip</strong> downloaded (${batchFiles.length} file(s)).`);
  } catch (err) {
    showStatus(statusBatch, "error", `❌ Error: ${err.message}`);
  } finally {
    btnBatch.disabled = false;
  }
});
