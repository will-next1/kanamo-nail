# Nail Salon Kanamo 公開データのバックアップ

本番サイト: https://kanamo-nail.willnext.workers.dev/

バックアップサイト（GitHub Pages）: https://will-next1.github.io/kanamo-nail/

2026-09-17のCloudflare公開データ48ファイルを、リポジトリ直下へ同期しています。
Cloudflareバージョン: `c2575779-1f62-4a90-b7a5-32f244ac1aae`

- ファーストビューの写真3枚と軽量化した画像を反映。
- PC・スマホの表示、ボタン、文言、背景アニメーションを更新。
- スマホの固定バーは「ご相談チャット」のみ。
- `kanamo-chatbot.html` は埋め込み専用。回答データも同ファイル内に含まれています。
- `chat-widget.js` と `chat-widget.css` がホームページへの組み込みを担当します。

旧版で使用した画像ファイルは削除せず残しています。過去のサイトはGitのコミット履歴から復元できます。
検索向けcanonicalは本番CloudflareのURLを維持しています。
GitHub Pagesはmainブランチのルートを公開元とするバックアップです。
CloudflareのHTTP→HTTPSリダイレクト等のWorker固有設定は、この静的サイトには含みません。

復元するときは必要なコミットを取得し、HTML・CSS・JavaScript・画像を既存Cloudflare Workerの静的アセットとして配置します。
