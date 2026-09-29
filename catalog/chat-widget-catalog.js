/* カタログページ用のチャット開閉。
   既存の chat-widget.js（トップページ用）と同じ動作を、次の2点だけ変えて実装している。
   1. PC用ボタン（kanamoChatLauncher）が無いページでも動く（null 参照を起こさない）
   2. チャット本体の URL は iframe の data-src から読む（カタログは階層が深く、
      'kanamo-chatbot.html' の相対指定だと /catalog/○○/kanamo-chatbot.html になってしまうため）
   既存の chat-widget.js は変更しない。 */
(() => {
  const launchers = ['kanamoChatLauncher', 'kanamoMobileChatLauncher']
    .map(id => document.getElementById(id))
    .filter(Boolean);
  const frame = document.getElementById('kanamoChatFrame');
  if (!frame || !launchers.length) return;
  const chatSrc = frame.dataset.src || 'kanamo-chatbot.html';
  let previousOverflow = '';
  let opener = null;
  function isVisible(el) {
    return !!(el && (el.offsetWidth || el.offsetHeight || el.getClientRects().length));
  }
  function notifyOpen() {
    if (!frame.hidden) {
      frame.contentWindow.focus();
      frame.contentWindow.postMessage({type: 'kanamo-chat-open'}, location.origin);
    }
  }
  function closeChat() {
    frame.hidden = true;
    launchers.forEach(button => button.setAttribute('aria-expanded', 'false'));
    document.body.style.overflow = previousOverflow;
    // 開いたボタンへフォーカスを戻す。画面幅の変更などで隠れていれば、見えているボタンへ
    const target = (opener && isVisible(opener)) ? opener : launchers.find(isVisible);
    if (target) target.focus();
  }
  launchers.forEach(button => button.addEventListener('click', () => {
    if (!frame.hidden) { closeChat(); return; }
    opener = button;
    previousOverflow = document.body.style.overflow;
    if (matchMedia('(max-width:560px)').matches) document.body.style.overflow = 'hidden';
    frame.hidden = false;
    launchers.forEach(b => b.setAttribute('aria-expanded', 'true'));
    if (!frame.getAttribute('src')) frame.src = chatSrc;
    else notifyOpen();
  }));
  frame.addEventListener('load', notifyOpen);
  window.addEventListener('message', (event) => {
    if (event.origin !== location.origin || event.source !== frame.contentWindow) return;
    if (event.data?.type === 'kanamo-chat-close') closeChat();
    if (event.data?.type === 'kanamo-chat-ready') notifyOpen();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !frame.hidden) closeChat();
  });
})();
