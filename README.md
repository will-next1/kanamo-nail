# Nail Salon Kanamo 公開データのバックアップ

本番サイト: https://kanamo-nail.willnext.workers.dev/

2026-09-14時点のCloudflare公開データ36ファイルを、リポジトリ直下へ同期しています。
Cloudflareバージョン: `74ffe826-34d2-4a13-bb2d-ff6fe9bcf727`

- ホームページのFAQを削除し、チャットボットを組み込み済み。
- スマホの固定バーは左「メニュー・料金」、右「ご相談チャット」。
- PCは右下のチャット起動ボタンを維持。
- `kanamo-chatbot.html` は埋め込み専用。回答データも同ファイル内に含まれています。
- `chat-widget.js` と `chat-widget.css` がホームページへの組み込みを担当します。

旧版で使用した画像ファイルは削除せず残しています。過去のサイトはGitのコミット履歴から復元できます。
検索向けcanonicalは本番CloudflareのURLを維持しています。
GitHub Pagesの想定URLは現在404で、今回の更新では公開設定を変更していません。

復元するときは必要なコミットを取得し、HTML・CSS・JavaScript・画像を既存Cloudflare Workerの静的アセットとして配置します。
