// ====== საწყისი პროექტის ფაილები (index.html + style.css) ======
let files = [
  {
    path: "index.html",
    content:
`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>My first HTML page</title>
</head>
<body>

  <main class="page">
    <h1>SANGU HTML/CSS Playground</h1>
    <p>ეს არის შენი პირველი საწყისი შაბლონი. შეცვალე HTML/CSS და დააჭირე Run ▶.</p>
    <button class="btn">Try it</button>
  </main>

</body>
</html>`
  },
  {
    path: "style.css",
    content:
`body {
  margin: 0;
  font-family: system-ui, sans-serif;
  background: #f4f4f5;
  color: #111827;
}

.page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 20px;
}

h1 {
  font-size: 32px;
  margin-bottom: 12px;
}

p {
  margin-bottom: 20px;
  max-width: 600px;
}

.btn {
  border-radius: 999px;
  border: none;
  padding: 10px 22px;
  font-size: 14px;
  cursor: pointer;
  background: #2563eb;
  color: #f9fafb;
  font-weight: 600;
}

.btn:hover {
  filter: brightness(1.05);
}`
  }
];

let entryFile = "index.html";
let currentIndex = 0;

// Monaco
let editor = null;
let models = [];

// DOM ელემენტები
let fileListEl, entryLabelEl, currentFileNameEl, fileTypeLabelEl, statusBarEl, previewFrameEl;

// --------- Utility ---------
function getLanguageFromPath(path) {
  if (path.endsWith(".html")) return "html";
  if (path.endsWith(".css")) return "css";
  if (path.endsWith(".js")) return "javascript";
  return "plaintext";
}

function getFileTypeLabel(path) {
  if (path.endsWith(".html")) return "HTML";
  if (path.endsWith(".css")) return "CSS";
  if (path.endsWith(".js")) return "JS";
  return "Text";
}

// ====== Monaco ინიციალიზაცია ======
window.initMonaco = function () {
  fileListEl = document.getElementById("fileList");
  entryLabelEl = document.getElementById("entryLabel");
  currentFileNameEl = document.getElementById("currentFileName");
  fileTypeLabelEl = document.getElementById("fileTypeLabel");
  statusBarEl = document.getElementById("statusBar");
  previewFrameEl = document.getElementById("previewFrame");

  // models თითო ფაილზე
  models = files.map(f =>
    monaco.editor.createModel(
      f.content,
      getLanguageFromPath(f.path)
    )
  );

  editor = monaco.editor.create(
    document.getElementById("editorContainer"),
    {
      model: models[0],
      theme: "vs-dark",
      automaticLayout: true,
      minimap: { enabled: false },
      fontSize: 13
    }
  );

  // Ctrl+Enter → Run
  editor.addCommand(
    monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter,
    () => runProject()
  );

  currentIndex = 0;
  currentFileNameEl.textContent = files[0].path;
  fileTypeLabelEl.textContent = getFileTypeLabel(files[0].path);

  renderFileList();
  runProject();
  statusBarEl.textContent = "Editor loaded. Ready.";
};

// ====== File list ======
function renderFileList() {
  fileListEl.innerHTML = "";
  files.forEach((f, idx) => {
    const div = document.createElement("div");
    div.className = "file-item" + (idx === currentIndex ? " active" : "");

    const nameSpan = document.createElement("span");
    nameSpan.textContent = f.path + (f.path === entryFile ? " ★" : "");

    const delBtn = document.createElement("button");
    delBtn.textContent = "✕";
    delBtn.title = "Delete";
    delBtn.onclick = (e) => {
      e.stopPropagation();
      deleteFile(idx);
    };

    div.appendChild(nameSpan);
    div.appendChild(delBtn);
    div.onclick = () => openFile(idx);
    fileListEl.appendChild(div);
  });
  entryLabelEl.textContent = "Entry: " + entryFile;
}

function saveCurrent() {
  if (!files[currentIndex] || !models[currentIndex]) return;
  files[currentIndex].content = models[currentIndex].getValue();
}

function openFile(index) {
  saveCurrent();
  currentIndex = index;
  const f = files[index];
  editor.setModel(models[index]);
  currentFileNameEl.textContent = f.path;
  fileTypeLabelEl.textContent = getFileTypeLabel(f.path);
  renderFileList();
  statusBarEl.textContent = "Editing: " + f.path;
}

// ====== Public: Files ======
window.addFile = function () {
  saveCurrent();
  const name = prompt("ფაილის სახელი ( напр. about.html, css/main.css, script.js ):",
                      "newfile.html");
  if (!name) return;

  const newFile = { path: name, content: "" };
  files.push(newFile);

  const newModel = monaco.editor.createModel(
    newFile.content,
    getLanguageFromPath(name)
  );
  models.push(newModel);

  openFile(files.length - 1);
};

function deleteFile(idx) {
  if (!confirm("წავშალო ფაილი " + files[idx].path + " ?")) return;

  if (models[idx]) models[idx].dispose();

  files.splice(idx, 1);
  models.splice(idx, 1);

  if (files.length === 0) {
    files = [
      {
        path: "index.html",
        content: "<h1>Empty project</h1>"
      }
    ];
    models = [
      monaco.editor.createModel(files[0].content, "html")
    ];
    entryFile = "index.html";
    currentIndex = 0;
  } else {
    if (currentIndex >= files.length) currentIndex = files.length - 1;
    if (!files.find(f => f.path === entryFile)) {
      entryFile = files[0].path;
    }
  }

  openFile(currentIndex);
  renderFileList();
}

window.setEntry = function () {
  const f = files[currentIndex];
  entryFile = f.path;
  renderFileList();
};

// ====== Download ფუნქციები ======
window.downloadCurrentFile = function () {
  saveCurrent();
  const f = files[currentIndex];
  if (!f) return;

  const blob = new Blob([f.content], { type: "text/plain;charset=utf-8" });

  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = f.path;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    URL.revokeObjectURL(a.href);
    document.body.removeChild(a);
  }, 0);
};

window.downloadProjectZip = async function () {
  saveCurrent();
  const zip = new JSZip();
  files.forEach(f => {
    zip.file(f.path, f.content);
  });

  const blob = await zip.generateAsync({ type: "blob" });

  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "sangu-project.zip";
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    URL.revokeObjectURL(a.href);
    document.body.removeChild(a);
  }, 0);
};

// ====== Run / Reset ======
window.runProject = function () {
  saveCurrent();

  const htmlFile =
    files.find(f => f.path === entryFile && f.path.endsWith(".html")) ||
    files.find(f => f.path.endsWith(".html")) ||
    files[0];

  if (!htmlFile) {
    alert("HTML ფაილი არ არსებობს.");
    return;
  }

  const allCss = files
    .filter(f => f.path.endsWith(".css"))
    .map(f => "/* " + f.path + " */\n" + f.content)
    .join("\n\n");

  const allJs = files
    .filter(f => f.path.endsWith(".js"))
    .map(f => "// " + f.path + "\n" + f.content)
    .join("\n\n");

  let html = htmlFile.content;

  if (allCss.trim()) {
    const styleTag = "<style>\n" + allCss + "\n</style>\n";
    if (html.includes("</head>")) {
      html = html.replace("</head>", styleTag + "</head>");
    } else {
      html = styleTag + html;
    }
  }

  if (allJs.trim()) {
    const scriptTag = "<script>\n" + allJs + "\n</script>\n";
    if (html.includes("</body>")) {
      html = html.replace("</body>", scriptTag + "</body>");
    } else {
      html = html + scriptTag;
    }
  }

  const doc = previewFrameEl.contentDocument || previewFrameEl.contentWindow.document;
  doc.open();
  doc.write(html);
  doc.close();

  if (statusBarEl) {
    statusBarEl.textContent = "Last run: " + new Date().toLocaleTimeString();
  }
};

window.resetProject = function () {
  // dispose ძველი მოდელები
  if (models && models.length) {
    models.forEach(m => m && m.dispose());
  }

  files = [
    {
      path: "index.html",
      content:
`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>My first HTML page</title>
</head>
<body>

  <main class="page">
    <h1>SANGU HTML/CSS Playground</h1>
    <p>ეს არის შენი პირველი საწყისი შაბლონი. შეცვალე HTML/CSS და დააჭირე Run ▶.</p>
    <button class="btn">Try it</button>
  </main>

</body>
</html>`
    },
    {
      path: "style.css",
      content:
`body {
  margin: 0;
  font-family: system-ui, sans-serif;
  background: #f4f4f5;
  color: #111827;
}

.page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 20px;
}

h1 {
  font-size: 32px;
  margin-bottom: 12px;
}

p {
  margin-bottom: 20px;
  max-width: 600px;
}

.btn {
  border-radius: 999px;
  border: none;
  padding: 10px 22px;
  font-size: 14px;
  cursor: pointer;
  background: #2563eb;
  color: #f9f9ff;
  font-weight: 600;
}

.btn:hover {
  filter: brightness(1.05);
}`
    }
  ];
  entryFile = "index.html";
  currentIndex = 0;

  models = files.map(f =>
    monaco.editor.createModel(
      f.content,
      getLanguageFromPath(f.path)
    )
  );

  editor.setModel(models[0]);
  currentFileNameEl.textContent = files[0].path;
  fileTypeLabelEl.textContent = getFileTypeLabel(files[0].path);
  renderFileList();
  runProject();
};
