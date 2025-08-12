// DrawQuote v0.1 - JS 분리본
const canvas = document.getElementById('canvas');
const addTextBtn = document.getElementById('addText');
const addObjectBtn = document.getElementById('addObject');
const exportBtn = document.getElementById('exportPDF');
const deleteBoxBtn = document.getElementById('deleteBox');

const fontFamily = document.getElementById('fontFamily');
const fontSize = document.getElementById('fontSize');
const inputType = document.getElementById('inputType');

let count = 0;
let selectedEl = null;

// 요소 이동: 리사이즈 중엔 드래그 금지
function makeDraggable(el) {
  let isDragging = false;
  let isResizing = false;
  let offsetX = 0, offsetY = 0;

  el.addEventListener('mousedown', (e) => {
    const rect = el.getBoundingClientRect();
    isResizing = (e.clientX > rect.right - 10) && (e.clientY > rect.bottom - 10);
    if (isResizing) return;
    if (e.target === el) {
      isDragging = true;
      offsetX = e.offsetX; offsetY = e.offsetY;
      el.style.zIndex = 1000;
    }
  });

  document.addEventListener('mousemove', (e) => {
    if (isDragging && !isResizing) {
      const r = canvas.getBoundingClientRect();
      el.style.left = (e.pageX - r.left - offsetX) + 'px';
      el.style.top  = (e.pageY - r.top  - offsetY) + 'px';
    }
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
    isResizing = false;
  });
}

function makeSelectable(el) {
  el.addEventListener('click', (e) => {
    e.stopPropagation();
    if (selectedEl) selectedEl.classList.remove('selected');
    selectedEl = el; selectedEl.classList.add('selected');
    fontFamily.disabled = fontSize.disabled = inputType.disabled = false;
    deleteBoxBtn.style.display = 'block';
    fontFamily.value = selectedEl.dataset.fontFamily || '';
    fontSize.value   = selectedEl.dataset.fontSize || '';
    inputType.value  = selectedEl.dataset.inputType || '';
  });
}

addTextBtn.onclick = () => {
  const el = document.createElement('div');
  el.contentEditable = true;
  el.className = 'draggable';
  el.innerText = '텍스트 입력 또는 {{Account.Name}}';
  Object.assign(el.style, {top:(50+count*40)+'px', left:'100px', width:'150px', height:'30px', fontFamily:'sans-serif', fontSize:'12pt'});
  el.dataset.inputType = 'text'; el.dataset.fontFamily='sans-serif'; el.dataset.fontSize='12pt';
  count++; canvas.appendChild(el); makeDraggable(el); makeSelectable(el); el.click();
};

addObjectBtn.onclick = () => {
  const el = document.createElement('div');
  el.contentEditable = false;
  el.className = 'draggable';
  el.innerText = '오브젝트';
  Object.assign(el.style, {top:(50+count*40)+'px', left:'100px', width:'150px', height:'30px', background:'#f0f0f0'});
  el.dataset.inputType = 'object';
  count++; canvas.appendChild(el); makeDraggable(el); makeSelectable(el); el.click();
};

document.addEventListener('click', (e) => {
  const insideProps = document.getElementById('properties').contains(e.target);
  const insideBox = e.target.classList && e.target.classList.contains('draggable');
  if (!insideProps && !insideBox) {
    if (selectedEl) selectedEl.classList.remove('selected');
    selectedEl = null; fontFamily.disabled = fontSize.disabled = inputType.disabled = true;
    fontFamily.value = fontSize.value = inputType.value = ""; deleteBoxBtn.style.display = 'none';
  }
});

document.addEventListener('keydown', (e) => {
  const active = document.activeElement;
  const isEditing = active && active.isContentEditable;
  if (!isEditing && selectedEl && (e.key === 'Delete' || e.key === 'Backspace')) {
    selectedEl.remove();
    selectedEl=null; fontFamily.disabled=fontSize.disabled=inputType.disabled=true;
    fontFamily.value=fontSize.value=inputType.value=""; deleteBoxBtn.style.display='none';
  }
});

deleteBoxBtn.addEventListener('click', () => {
  if (!selectedEl) return;
  selectedEl.remove();
  selectedEl=null; fontFamily.disabled=fontSize.disabled=inputType.disabled=true;
  fontFamily.value=fontSize.value=inputType.value=""; deleteBoxBtn.style.display='none';
});

fontFamily.addEventListener('change', function(){ if (selectedEl){ selectedEl.dataset.fontFamily=this.value; selectedEl.style.fontFamily=this.value; }});
fontSize.addEventListener('change', function(){ if (selectedEl){ selectedEl.dataset.fontSize=this.value; selectedEl.style.fontSize=this.value; }});
inputType.addEventListener('change', function(){ if (selectedEl){ selectedEl.dataset.inputType=this.value; }});

document.querySelectorAll('.align-btn').forEach(btn=>{
  btn.addEventListener('click', () => { if (selectedEl) selectedEl.style.textAlign = btn.dataset.align; });
});

// PDF 저장
exportBtn.addEventListener('click', () => {
  const el = document.getElementById('canvas');
  html2pdf().from(el).set({
    margin:0, filename:'canvas.pdf',
    image:{type:'jpeg', quality:0.98},
    html2canvas:{scale:2},
    jsPDF:{unit:'pt', format:'a4', orientation:'portrait'}
  }).save();
});
