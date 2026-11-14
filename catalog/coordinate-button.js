'use strict';
/* Nail Salon Kanamo ― 「服と予定でネイルを選ぶ」ボタン（デザイン3ページ共通）
 *
 * ページを開いたときに読み込むのは、この小さなファイルだけ。
 * おすすめの計算（coordinate.js）は、お客様がボタンを押したときに初めて読み込む。
 * このファイルが動かない環境ではボタン自体が出ず、写真一覧はこれまでどおり見られる。
 */
(() => {
  const script = document.currentScript;
  const root = document.getElementById('coordinate');
  if (!script || !root) return;
  const button = root.querySelector('.coordinate-open');
  const panel = root.querySelector('.coordinate-panel');
  const mark = button && button.querySelector('span');
  if (!button || !panel || !document.querySelector('.catalog-gallery .catalog-item')) return;

  root.hidden = false;
  let state = 'idle'; // idle → loading → ready

  const setOpen = open => {
    panel.hidden = !open;
    button.setAttribute('aria-expanded', String(open));
    if (mark) mark.textContent = open ? '－' : '＋';
  };
  const status = text => {
    const p = document.createElement('p');
    p.className = 'coordinate-status';
    p.textContent = text;
    panel.replaceChildren(p);
  };
  const fail = () => {
    state = 'idle';
    status('読み込めませんでした。通信状況をご確認のうえ、もう一度ボタンを押してください。');
  };

  button.addEventListener('click', () => {
    if (state === 'ready') { setOpen(panel.hidden); return; }
    if (state === 'loading') return;
    state = 'loading';
    status('読み込んでいます…');
    setOpen(true);
    const engine = document.createElement('script');
    engine.src = script.dataset.engine;
    engine.onload = () => {
      if (!window.KanamoCoordinate) { fail(); return; }
      state = 'ready';
      window.KanamoCoordinate.mount(root, panel);
    };
    engine.onerror = () => { engine.remove(); fail(); };
    document.head.appendChild(engine);
  });
})();
