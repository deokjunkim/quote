// DrawQuote v0.11 + PDF 미리보기 (CSP 친화적)
const canvas       = document.getElementById('canvas');
const addTextBtn   = document.getElementById('addText');
const addFieldBtn  = document.getElementById('addField');
const exportBtn    = document.getElementById('exportPDF');
const previewBtn   = document.getElementById('previewPDF');
const deleteBoxBtn = document.getElementById('deleteBox');

const fontFamily = document.getElementById('fontFamily');
const fontSize   = document.getElementById('fontSize');

// 필드 전용 패널
const fieldProps     = document.getElementById('fieldProps');
const sfObjectSelect = document.getElementById('sfObject');
const sfFieldSelect  = document.getElementById('sfField');

// 미리보기 모달
const previewModal = document.getElementById('previewModal');
const previewFrame = document.getElementById('previewFrame');
const closePreview = document.getElementById('closePreview');

// 샘플 스키마 (추후 서버/세일즈포스 호출로 대체 가능)
const SF_SCHEMA = {
  Account:     ["Name","Phone","BillingCity","BillingStreet"],
  Opportunity: ["Name","StageName","Amount","CloseDate"],
  Order:       ["OrderNumber","Status","TotalAmount","EffectiveDate"]
};

let count = 0;
let selectedEl = null;

// 드래그(리사이즈 중 위치 고정)
function makeDraggable(el) {
  let isDragging = false, isResizing = false, offsetX = 0, offsetY = 0;

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

// 선택 처리 + 패널 토글
function makeSelectable(el) {
  el.addEventListener('click', (e) => {
    e.stopPropagation();
    if (selectedEl) selectedEl.classList.remove('selected');
    selectedEl = el; selectedEl.classList.add('selected');

    fontFamily.disabled = false;
    fontSize.disabled   = false;
    fontFamily.value = selectedEl.dataset.fontFamily || '';
    fontSize.value   = selectedEl.dataset.fontSize   || '';

    if (selectedEl.dataset.inputType === 'field') {
      fieldProps.style.display = 'block';
      const currentObj   = selectedEl.dataset.sfObject || 'Account';
      const currentField = selectedEl.dataset.sfField  || 'Name';
      sfObjectSelect.value = currentObj;
      populateFieldSelect(currentObj, currentField);
    } else {
      fieldProps.style.display = 'none';
    }

    deleteBoxBtn.style.display = 'block';
  });
}

function populateFieldSelect(objectName, selectedField) {
  const fields = SF_SCHEMA[objectName] || [];
  sfFieldSelect.innerHTML = fields.map(f => `<option value="${f}">${f}</option>`).join('');
  sfFieldSelect.value = (selectedField && fields.includes(selectedField)) ? selectedField : (fields[0] || '');
}

function applyFieldPlaceholder(el) {
  const obj = el.dataset.sfObject || 'Account';
  const fld = el.dataset.sfField  || 'Name';
  el.textContent = `{{${obj}.${fld}}}`;
}

// 요소 추가: 텍스트
addTextBtn.onclick = () => {
  const el = document.createElement('div');
  el.contentEditable = true;
  el.className = 'draggable';
  Object.assign(el.style, { top:(50+count*40)+'px', left:'100px', width:'180px', height:'32px',
                            fontFamily:'sans-serif', fontSize:'12pt' });
  el.textContent = '텍스트 입력';
  el.dataset.inputType  = 'text';
  el.dataset.fontFamily = 'sans-serif';
  el.dataset.fontSize   = '12pt';
  count++; canvas.appendChild(el); makeDraggable(el); makeSelectable(el); el.click();
};

// 요소 추가: 필드
addFieldBtn.onclick = () => {
  const el = document.createElement('div');
  el.contentEditable = false;
  el.className = 'draggable';
  Object.assign(el.style, { top:(50+count*40)+'px', left:'100px', width:'200px', height:'32px' });
  el.dataset.inputType = 'field';
  el.dataset.sfObject  = 'Account';
  el.dataset.sfField   = 'Name';
  applyFieldPlaceholder(el);
  count++; canvas.appendChild(el); makeDraggable(el); makeSelectable(el); el.click();
};

// 외부 클릭 시 해제
document.addEventListener('click', (e) => {
  const insideProps = document.getElementById('properties').contains(e.target);
  const insideBox = e.target.classList && e.target.classList.contains('draggable');
  if (!insideProps && !insideBox) {
    if (selectedEl) selectedEl.classList.remove('selected');
    selectedEl = null;
    fontFamily.disabled = fontSize.disabled = true;
    fieldProps.style.display = 'none';
    fontFamily.value = fontSize.value = '';
    deleteBoxBtn.style.display = 'none';
  }
});

// 삭제
deleteBoxBtn.addEventListener('click', () => {
  if (!selectedEl) return;
  selectedEl.remove();
  selectedEl = null;
  fontFamily.disabled = fontSize.disabled = true;
  fieldProps.style.display = 'none';
  fontFamily.value = fontSize.value = '';
  deleteBoxBtn.style.display = 'none';
});

// 스타일
fontFamily.addEventListener('change', function(){
  if (selectedEl){ selectedEl.dataset.fontFamily=this.value; selectedEl.style.fontFamily=this.value; }
});
fontSize.addEventListener('change', function(){
  if (selectedEl){ selectedEl.dataset.fontSize=this.value; selectedEl.style.fontSize=this.value; }
});

// 오브젝트/필드 변경
sfObjectSelect.addEventListener('change', function(){
  if (!selectedEl || selectedEl.dataset.inputType !== 'field') return;
  selectedEl.dataset.sfObject = this.value;
  populateFieldSelect(this.value, null);
  selectedEl.dataset.sfField = sfFieldSelect.value;
  applyFieldPlaceholder(selectedEl);
});
sfFieldSelect.addEventListener('change', function(){
  if (!selectedEl || selectedEl.dataset.inputType !== 'field') return;
  selectedEl.dataset.sfField = this.value;
  applyFieldPlaceholder(selectedEl);
});

// 정렬
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

// PDF 미리보기(모달)
previewBtn.addEventListener('click', () => {
  const el = document.getElementById('canvas');
  html2pdf().from(el).set({
    margin:0,
    image:{ type:'jpeg', quality:0.98 },
    html2canvas:{ scale:2 },
    jsPDF:{ unit:'pt', format:'a4', orientation:'portrait' }
  })
  .toPdf()
  .get('pdf')
  .then(pdf => {
    const blob = pdf.output('blob');
    const url  = URL.createObjectURL(blob);
    previewFrame.src = url;
    previewModal.classList.add('modal--open');
    previewModal.setAttribute('aria-hidden', 'false');
  })
  .catch(err => {
    console.error('미리보기 생성 실패:', err);
    alert('PDF 미리보기를 생성할 수 없습니다.');
  });
});

// 모달 닫기
function closePreviewModal(){
  if (previewFrame.src && previewFrame.src.startsWith('blob:')) URL.revokeObjectURL(previewFrame.src);
  previewFrame.src = 'about:blank';
  previewModal.classList.remove('modal--open');
  previewModal.setAttribute('aria-hidden', 'true');
}
document.getElementById('closePreview').addEventListener('click', closePreviewModal);
previewModal.addEventListener('click', (e) => { if (e.target === previewModal) closePreviewModal(); });
document.addEventListener('keydown', (e)=>{ if(e.key==='Escape' && previewModal.classList.contains('modal--open')) closePreviewModal(); });
