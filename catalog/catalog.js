'use strict';
/* Nail Salon Kanamo ― カタログページ用スクリプト
 *
 * 役割はスマートフォンのメニュー開閉のみ。
 * 画像の拡大表示は行わないため、画像まわりの処理は一切ない。
 * このファイルが読み込まれなくても、画像一覧とすべてのリンクは通常どおり動く。
 *
 * 既存の app.js は要素が必ず存在する前提で書かれておりカタログページでは
 * エラーになるため、読み込まずに同じ動作をここへ安全に書き直している。
 */
(() => {
  const toggle = document.querySelector('.nav-toggle');
  const mobileNav = document.querySelector('#mobile-nav');
  if (!toggle || !mobileNav) return;

  const closeMenu = (returnFocus = false) => {
    mobileNav.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'メニューを開く');
    if (returnFocus) toggle.focus();
  };

  toggle.addEventListener('click', () => {
    const opening = mobileNav.hidden;
    mobileNav.hidden = !opening;
    toggle.setAttribute('aria-expanded', String(opening));
    toggle.setAttribute('aria-label', opening ? 'メニューを閉じる' : 'メニューを開く');
  });

  mobileNav.addEventListener('click', event => {
    if (event.target.closest('a')) closeMenu();
  });

  document.addEventListener('click', event => {
    if (!mobileNav.hidden && !event.target.closest('.site-header')) closeMenu();
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !mobileNav.hidden) closeMenu(true);
  });

  window.matchMedia('(min-width: 761px)').addEventListener('change', event => {
    if (event.matches) closeMenu();
  });
})();

/* 右下の「TOP ↑」ボタン。ページが長いので、少し下へスクロールしたら表示する。
 * リンク（href="#top"）なので、このスクリプトが動かなくても先頭へ戻れる。 */
(() => {
  const button = document.querySelector('.back-top-float');
  if (!button) return;
  const THRESHOLD = 480;
  const update = () => {
    button.classList.toggle('is-visible', window.scrollY > THRESHOLD);
  };
  window.addEventListener('scroll', update, { passive: true });
  update();

  // クリック時は自前で先頭までスクロールする。
  // （href="#top" のままだと、URL に #top が付いた後の2回目以降は動かない。
  //   また CSS の scroll-behavior:smooth が効かない環境でも確実に戻れるようにする）
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  button.addEventListener('click', event => {
    event.preventDefault();
    const start = window.scrollY;
    if (reduceMotion || start < 1) { window.scrollTo(0, 0); return; }
    const duration = 420;
    const t0 = performance.now();
    const step = now => {
      const p = Math.min(1, (now - t0) / duration);
      const ease = 1 - Math.pow(1 - p, 3);
      window.scrollTo(0, Math.round(start * (1 - ease)));
      if (p < 1) requestAnimationFrame(step);
      else document.getElementById('top')?.focus?.();
    };
    requestAnimationFrame(step);
  });
})();
