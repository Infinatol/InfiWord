// --- Elements ---
const editor = document.getElementById('editor');
const btnTheme = document.getElementById('btn-theme');

// --- Theme Management ---
let isDarkMode = false;
btnTheme.addEventListener('click', () => {
  isDarkMode = !isDarkMode;
  document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
});

// --- Dropdowns ---
function closeAllDropdowns() {
  document.querySelectorAll('.dropdown').forEach(d => d.classList.remove('active'));
}

document.addEventListener('click', (e) => {
  if (!e.target.closest('.menu-item') && !e.target.closest('.dropdown')) {
    closeAllDropdowns();
  }
});

const menus = ['file', 'edit', 'insert', 'help'];
menus.forEach(m => {
  const btn = document.getElementById(`menu-${m}`);
  if(btn) {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const drop = document.getElementById(`dropdown-${m}`);
      const isActive = drop.classList.contains('active');
      closeAllDropdowns();
      if (!isActive) drop.classList.add('active');
    });
  }
});

// --- Formatting (ExecCommand) ---
document.querySelectorAll('.tool-btn[data-command]').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.preventDefault(); 
    const cmd = btn.getAttribute('data-command');
    document.execCommand(cmd, false, null);
    editor.focus();
    updateToolbarState();
  });
});

document.getElementById('select-font').addEventListener('change', (e) => {
  document.execCommand('fontName', false, e.target.value);
  editor.focus();
});

document.getElementById('select-size').addEventListener('change', (e) => {
  document.execCommand('fontSize', false, e.target.value);
  editor.focus();
});

document.getElementById('color-text').addEventListener('input', (e) => {
  document.execCommand('foreColor', false, e.target.value);
});

document.getElementById('color-bg').addEventListener('input', (e) => {
  document.execCommand('hiliteColor', false, e.target.value);
});

// Update toolbar state
editor.addEventListener('keyup', updateToolbarState);
editor.addEventListener('mouseup', updateToolbarState);
editor.addEventListener('click', updateToolbarState);

function updateToolbarState() {
  document.querySelectorAll('.tool-btn[data-command]').forEach(btn => {
    const cmd = btn.getAttribute('data-command');
    if (document.queryCommandState(cmd)) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Pourrait aussi mettre à jour les sélecteurs de police/taille mais queryCommandValue est parfois capricieux.
}

// --- IPC File Operations ---
if (window.api) {
  document.getElementById('action-new').addEventListener('click', async () => {
    closeAllDropdowns();
    if(confirm("Créer un nouveau fichier ? Les modifications non sauvegardées seront perdues.")){
      editor.innerHTML = '';
      await window.api.newFile();
    }
  });

  document.getElementById('action-open').addEventListener('click', async () => {
    closeAllDropdowns();
    const result = await window.api.openFile();
    if (result.success) {
      if (result.isHtml) {
        editor.innerHTML = result.content;
      } else {
        editor.innerText = result.content;
      }
    }
  });

  document.getElementById('action-save').addEventListener('click', async () => {
    closeAllDropdowns();
    // Default format is infiword (html)
    const result = await window.api.saveFile(editor.innerHTML, true);
    if(result.success) alert("Sauvegardé avec succès!");
  });

  document.getElementById('action-save-as').addEventListener('click', async () => {
    closeAllDropdowns();
    const result = await window.api.saveFileAs(editor.innerHTML, true);
    if(result.success) alert("Sauvegardé avec succès!");
  });

  document.getElementById('action-export-pdf').addEventListener('click', async () => {
    closeAllDropdowns();
    const result = await window.api.exportPdf();
    if(result.success) alert("PDF exporté avec succès!");
  });

  document.getElementById('action-print').addEventListener('click', () => {
    closeAllDropdowns();
    window.api.printDocument();
  });
}

// --- Edit Actions ---
document.getElementById('action-undo').addEventListener('click', () => { document.execCommand('undo'); closeAllDropdowns(); });
document.getElementById('action-redo').addEventListener('click', () => { document.execCommand('redo'); closeAllDropdowns(); });
document.getElementById('action-cut').addEventListener('click', () => { document.execCommand('cut'); closeAllDropdowns(); });
document.getElementById('action-copy').addEventListener('click', () => { document.execCommand('copy'); closeAllDropdowns(); });
document.getElementById('action-paste').addEventListener('click', () => { document.execCommand('paste'); closeAllDropdowns(); });

// --- Insertions ---
document.getElementById('action-insert-img').addEventListener('click', () => {
  closeAllDropdowns();
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.onchange = e => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = ev => {
        editor.focus();
        document.execCommand('insertImage', false, ev.target.result);
      };
      reader.readAsDataURL(file);
    }
  };
  input.click();
});

document.getElementById('action-insert-table').addEventListener('click', () => {
  closeAllDropdowns();
  const rows = prompt("Nombre de lignes (ex: 3) :", "3");
  const cols = prompt("Nombre de colonnes (ex: 3) :", "3");
  if(rows && cols) {
    editor.focus();
    let html = '<table style="width:100%; border-collapse: collapse; margin-bottom: 1em;"><tbody>';
    for(let r=0; r<rows; r++){
      html += '<tr>';
      for(let c=0; c<cols; c++){
        html += '<td style="padding:8px; border:1px solid var(--border-color);">Cellule</td>';
      }
      html += '</tr>';
    }
    html += '</tbody></table><br>';
    document.execCommand('insertHTML', false, html);
  }
});

document.getElementById('action-insert-symbol').addEventListener('click', () => {
  closeAllDropdowns();
  const symbol = prompt("Entrez un symbole (ex: ©, ®, €, ™) ou emoji :", "€");
  if(symbol) {
    editor.focus();
    document.execCommand('insertText', false, symbol);
  }
});

// --- Find / Replace Modal ---
const modalFind = document.getElementById('modal-find');
const findText = document.getElementById('find-text');
const replaceText = document.getElementById('replace-text');

document.getElementById('action-find-replace').addEventListener('click', () => {
  closeAllDropdowns();
  modalFind.classList.add('active');
  findText.focus();
});

document.getElementById('btn-find-cancel').addEventListener('click', () => {
  modalFind.classList.remove('active');
  editor.focus();
});

document.getElementById('btn-find-next').addEventListener('click', () => {
  const txt = findText.value;
  if(txt) {
    window.find(txt, false, false, true, false, true, false);
  }
});

document.getElementById('btn-replace').addEventListener('click', () => {
  const txt = findText.value;
  const rep = replaceText.value;
  if(txt) {
    const sel = window.getSelection();
    if(sel.toString().toLowerCase() === txt.toLowerCase()) {
      document.execCommand('insertHTML', false, rep);
    } else {
      window.find(txt, false, false, true, false, true, false);
    }
  }
});

document.getElementById('btn-replace-all').addEventListener('click', () => {
  let txt = findText.value;
  let rep = replaceText.value;
  if(txt) {
    editor.focus();
    let count = 0;
    
    // Positionne le curseur au début pour chercher
    let range = document.createRange();
    range.selectNodeContents(editor);
    let sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
    sel.collapseToStart();
    
    while(window.find(txt, false, false, true, false, true, false)) {
      document.execCommand('insertHTML', false, rep);
      count++;
    }
    alert(`${count} occurrence(s) remplacée(s).`);
  }
});

// --- About Modal ---
const modalAbout = document.getElementById('modal-about');
document.getElementById('action-about').addEventListener('click', () => {
  closeAllDropdowns();
  modalAbout.classList.add('active');
});
document.getElementById('btn-about-close').addEventListener('click', () => {
  modalAbout.classList.remove('active');
  editor.focus();
});

// Auto-save logic (simple)
setInterval(async () => {
  // Optionnel: On pourrait invoquer un fichier auto-save temporaire, mais sans permission c'est envahissant.
  // Pour la consigne "Sauvegarde automatique optionnelle", on pourrait l'ajouter dans la barre.
}, 60000);

// Start focus
editor.focus();
