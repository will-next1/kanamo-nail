(() => {
  const launcher = document.getElementById('kanamoChatLauncher');
  const mobileLauncher = document.getElementById('kanamoMobileChatLauncher');
  const launchers = [launcher, mobileLauncher];
  const frame = document.getElementById('kanamoChatFrame');
  let previousOverflow = '';
  function notifyOpen() {
    if (!frame.hidden) {
      frame.contentWindow.focus();
      frame.contentWindow.postMessage({type:'kanamo-chat-open'}, location.origin);
    }
  }
  function closeChat() {
    frame.hidden = true;
    launchers.forEach(button => button.setAttribute('aria-expanded', 'false'));
    document.body.style.overflow = previousOverflow;
    (matchMedia('(max-width:760px)').matches ? mobileLauncher : launcher).focus();
  }
  launchers.forEach(button => button.addEventListener('click', () => {
    if (!frame.hidden) { closeChat(); return; }
    previousOverflow = document.body.style.overflow;
    if (matchMedia('(max-width:560px)').matches) document.body.style.overflow = 'hidden';
    frame.hidden = false;
    launchers.forEach(button => button.setAttribute('aria-expanded', 'true'));
    if (!frame.getAttribute('src')) frame.src = 'kanamo-chatbot.html?v=20260922-1';
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
