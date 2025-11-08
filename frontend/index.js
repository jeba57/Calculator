console.log('app.js loaded');

window.addEventListener('DOMContentLoaded', () => {
  const disp = document.getElementById('display');
  const expEl = document.getElementById('exp');
  const statusEl = document.getElementById('status');
  const buttons = document.querySelectorAll('button');

  if (!disp || !buttons.length) {
    console.error('DOM elements not found. Check your HTML IDs and that app.js is linked correctly.');
    return;
  }

  let a = '', b = '', op = '';
  let enteringB = false;

  const round12 = n => Math.round((n + Number.EPSILON) * 1e12) / 1e12;
  const show = v => disp.value = (v ?? '') === '' ? '' : String(v);
  const setStatus = msg => statusEl && (statusEl.textContent = msg || '');
  const showExp = () =>
    expEl && (expEl.textContent = a ? a + (op ? ' ' + op + ' ' : '') + (enteringB ? b : '') : '');

  function clearAll(){ a=''; b=''; op=''; enteringB=false; show(''); showExp(); setStatus(''); }

  function cut(){
    if (!enteringB) { a = a.slice(0,-1); show(a); }
    else { b = b.slice(0,-1); show(b); }
    showExp();
  }

  function appendDigit(key){
    if (!enteringB){
      if (key === '.' && a.includes('.')) return;
      a += key; show(a);
    } else {
      if (key === '.' && b.includes('.')) return;
      b += key; show(b);
    }
    showExp();
  }

  function percent(){
    if (!enteringB){
      if (a==='') return;
      a = String(round12(Number(a)/100));
      show(a);
    } else {
      if (b==='') return;
      b = String(round12(Number(b)/100));
      show(b);
    }
    showExp();
    setStatus('Converted to percentage');
  }

  function compute(){
    const x = Number(a), y = Number(b);
    if (!Number.isFinite(x)) return null;
    if (b === '') return x;
    let r;
    switch(op){
      case '+': r = x + y; break;
      case '-': r = x - y; break;
      case '*': r = x * y; break;
      case '/': if (y===0) return '∞'; r = x / y; break;
      default: return null;
    }
    return round12(r);
  }

  function pressOp(nextOp){
    setStatus('');
    if (!a) return;

    if (!op){
      op = nextOp;
      enteringB = true;
      showExp();
      return;
    }

    if (b !== ''){
      const r = compute();
      if (r === null) return;
      a = String(r);
      show(a);
      b = '';
    }

    op = nextOp;
    enteringB = true;
    showExp();
  }

  function equals(){
    if (!a) return;
    const r = compute();
    if (r === null) return;
    a = String(r); b=''; op=''; enteringB=false;
    show(a); showExp();
  }

  function handle(k){
    if (k==='C') return clearAll();
    if (k==='cut') return cut();
    if (k==='percent') return percent();
    if (k==='paren') { setStatus('( ) not active in instant mode'); return; }
    if (['+','-','*','/'].includes(k)) return pressOp(k);
    if (k==='equal') return equals();
    if (/^\d$/.test(k) || k === '.') return appendDigit(k);
  }

  buttons.forEach(btn => btn.addEventListener('click', () => handle(btn.dataset.key)));

  window.addEventListener('keydown', (e) => {
    let k = e.key;
    if (/^[0-9]$/.test(k) || ['.','+','-','*','/','Backspace','%','Enter','='].includes(k) || k.toLowerCase()==='c') e.preventDefault();
    if (k==='Backspace') k='cut';
    if (k==='%') k='percent';
    if (k==='Enter' || k==='=') k='equal';
    if (k.toLowerCase()==='c') k='C';
    handle(k);
  });
});
