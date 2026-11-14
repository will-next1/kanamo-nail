'use strict';
/* Nail Salon Kanamo ― 「服と予定でネイルを選ぶ」おすすめの計算と画面（デザイン3ページ共通）
 *
 * ■ 候補の出どころ
 *   開いているページの写真一覧（.catalog-gallery の各写真）と、その画像説明（alt）だけを使う。
 *   そのため、候補は必ず「開いているコースの掲載中デザイン」に限られる。
 *   いつものカタログ更新で写真が増えれば候補に入り、掲載を終えれば外れる。
 *   おすすめ専用のデータや、毎月のプログラム修正はない。外部への通信もしない。
 *
 * ■ 選び方
 *   0. 写真には上下2つのデザインが写っている。画像説明を2つに分け、デザイン1つずつで判定する。
 *      2つに分けられない説明の写真は候補にしない（分け方は divide の説明を参照）。
 *      ★1つのデザインだけが写った写真を追加した場合も候補外になる（divide の「更新時の注意」を参照）。
 *   1. 画像説明から、色（例: ボルドー）と要素（例: パール・お花・フレンチ）を読み取る。
 *   2. 「予定」に向かない要素がある写真を外し、向いている要素に点を付ける。
 *   3. 「服の色」と合わせやすい色に点を付ける（説明の前のほうに出る色＝主役の色を重く見る）。
 *   4. 両方の点が基準以上の写真だけを候補にし、合計点の高い順に最大3枚。
 *      候補が多いときは、色や要素が似た写真ばかりにならないように選ぶ。
 *
 * ■ 直すとき
 *   言葉の追加は COLORS / MOTIFS、選択肢と点数は CLOTHES / OCCASIONS を直す。
 *   直したら build_catalog.py の COORDINATE_VERSION を上げて、ページを作り直す。
 */
(() => {
  // ---------------------------------------------------------------- 色の言葉
  // [画像説明に出る言葉, 色のグループ, 理由に出す呼び名, 色の調子]
  //   調子: soft=やわらかい / vivid=鮮やか / dark=深い
  const COLORS = [
    ['ピンクベージュ', ['beige', 'pink'], 'ピンクベージュ', 'soft'],
    ['ヌーディーベージュ', ['beige'], 'ヌーディーベージュ', 'soft'],
    ['ヌーディーピンク', ['pink'], 'ヌーディーピンク', 'soft'],
    ['ヌーディーカラー', ['beige'], 'ヌーディーカラー', 'soft'],
    ['ヌードカラー', ['beige'], 'ヌードカラー', 'soft'],
    ['キャメルベージュ', ['beige', 'brown'], 'キャメルベージュ', 'soft'],
    ['キャメルブラウン', ['brown'], 'キャメルブラウン', ''],
    ['コッパーブラウン', ['brown'], 'コッパーブラウン', ''],
    ['ダークブラウン', ['brown'], 'ダークブラウン', 'dark'],
    ['くすみピンク', ['pink'], 'くすみピンク', 'soft'],
    ['ダスティピンク', ['pink'], 'ダスティピンク', 'soft'],
    ['モーヴピンク', ['pink'], 'モーヴピンク', 'soft'],
    ['コーラルピンク', ['pink'], 'コーラルピンク', ''],
    ['コーラルオレンジ', ['orange'], 'コーラルオレンジ', ''],
    ['ネオンピンク', ['pink'], 'ネオンピンク', 'vivid'],
    ['マゼンタピンク', ['pink'], 'マゼンタピンク', 'vivid'],
    ['ボルドーピンク', ['bordeaux'], 'ボルドーピンク', 'dark'],
    ['ローズピンク', ['pink'], 'ローズピンク', ''],
    ['ローズゴールド', ['gold'], 'ローズゴールド', ''],
    ['マスタードイエロー', ['yellow'], 'マスタードイエロー', ''],
    ['ライムイエロー', ['yellow'], 'ライムイエロー', 'vivid'],
    ['ライムグリーン', ['green'], 'ライムグリーン', 'vivid'],
    ['ネオングリーン', ['green'], 'ネオングリーン', 'vivid'],
    ['エメラルドグリーン', ['green'], 'エメラルドグリーン', ''],
    ['オリーブグリーン', ['green'], 'オリーブグリーン', ''],
    ['オリーブグレー', ['green', 'gray'], 'オリーブグレー', ''],
    ['セージグリーン', ['green'], 'セージグリーン', 'soft'],
    ['ダークグリーン', ['green'], 'ダークグリーン', 'dark'],
    ['ミントグリーン', ['green'], 'ミントグリーン', 'soft'],
    ['ブルーグリーン', ['blue', 'green'], 'ブルーグリーン', ''],
    ['ターコイズブルー', ['blue'], 'ターコイズブルー', ''],
    ['ティールブルー', ['blue'], 'ティールブルー', ''],
    ['スモーキーブルー', ['blue'], 'スモーキーブルー', 'soft'],
    ['コバルトブルー', ['navy'], 'コバルトブルー', 'dark'],
    ['ロイヤルブルー', ['navy'], 'ロイヤルブルー', 'dark'],
    ['ライトブルー', ['blue'], 'ライトブルー', 'soft'],
    ['ブルーグレー', ['blue', 'gray'], 'ブルーグレー', 'soft'],
    ['スモーキーグレー', ['gray'], 'スモーキーグレー', ''],
    ['シルバーグレー', ['gray', 'silver'], 'シルバーグレー', ''],
    ['クリアホワイト', ['white'], 'クリアホワイト', 'soft'],
    ['クリアベージュ', ['beige'], 'クリアベージュ', 'soft'],
    ['パステルカラー', ['multi'], 'パステルカラー', 'soft'],
    ['色とりどり', ['multi'], '色とりどりの配色', 'vivid'],
    ['レインボー', ['multi'], 'レインボーカラー', 'vivid'],
    ['カラフル', ['multi'], 'カラフルな配色', 'vivid'],
    ['グレージュ', ['beige', 'gray'], 'グレージュ', 'soft'],
    ['アイボリー', ['white'], 'アイボリー', 'soft'],
    ['テラコッタ', ['brown'], 'テラコッタ', ''],
    ['ターコイズ', ['blue'], 'ターコイズ', ''],
    ['チャコール', ['gray'], 'チャコール', 'dark'],
    ['ラベンダー', ['purple'], 'ラベンダー', 'soft'],
    ['ホワイト', ['white'], 'ホワイト', ''],
    ['ブラック', ['black'], 'ブラック', 'dark'],
    ['ブラウン', ['brown'], 'ブラウン', ''],
    ['ベージュ', ['beige'], 'ベージュ', 'soft'],
    ['ボルドー', ['bordeaux'], 'ボルドー', 'dark'],
    ['ネイビー', ['navy'], 'ネイビー', 'dark'],
    ['グリーン', ['green'], 'グリーン', ''],
    ['オリーブ', ['green'], 'オリーブ', ''],
    ['イエロー', ['yellow'], 'イエロー', ''],
    ['オレンジ', ['orange'], 'オレンジ', ''],
    ['パープル', ['purple'], 'パープル', ''],
    ['マゼンタ', ['pink'], 'マゼンタ', 'vivid'],
    ['コーラル', ['pink'], 'コーラル', ''],
    ['ゴールド', ['gold'], 'ゴールド', ''],
    ['シルバー', ['silver'], 'シルバー', ''],
    ['キャメル', ['brown'], 'キャメル', ''],
    ['アンバー', ['brown'], 'アンバー', ''],
    ['ブロンズ', ['brown'], 'ブロンズ', ''],
    ['クリーム', ['white'], 'クリーム', 'soft'],
    ['ティール', ['blue'], 'ティール', ''],
    ['べっ甲', ['brown'], 'べっ甲風の色合い', ''],
    ['プラム', ['bordeaux'], 'プラムカラー', 'dark'],
    ['トープ', ['beige'], 'トープ', 'soft'],
    ['カーキ', ['green'], 'カーキ', ''],
    ['モーヴ', ['purple'], 'モーヴ', 'soft'],
    ['ピンク', ['pink'], 'ピンク', ''],
    ['ピーチ', ['pink'], 'ピーチ', 'soft'],
    ['ミント', ['green'], 'ミント', 'soft'],
    ['ブルー', ['blue'], 'ブルー', ''],
    ['レッド', ['red'], 'レッド', ''],
    ['グレー', ['gray'], 'グレー', ''],
    ['白黒', ['white', 'black'], '白黒', ''],
    ['水色', ['blue'], '水色', 'soft'],
    ['深緑', ['green'], '深緑', 'dark'],
    ['琥珀', ['brown'], '琥珀色', ''],
    ['白い', ['white'], '白', ''],
    ['赤い', ['red'], '赤', ''],
    ['黒地', ['black'], '黒', 'dark'],
    ['白', ['white'], '白', ''],
    ['赤', ['red'], '赤', ''],
    ['黒', ['black'], '黒', 'dark'],
    ['緑', ['green'], '緑', ''],
  ];

  // ---------------------------------------------------------------- 要素の言葉
  // [画像説明に出る言葉（正規表現も可）, 要素のグループ, 理由に出す呼び名]
  const MOTIFS = [
    ['パール', 'pearl', 'パール'],
    ['ビジュー', 'stone', 'ビジュー'], ['ストーン', 'stone', 'ストーン'], ['スタッズ', 'stone', 'スタッズ'],
    ['メタルパーツ', 'stone', 'メタルパーツ'], ['チェーン', 'stone', 'チェーン'],
    ['ラメ', 'lame', 'ラメ'],
    ['ホログラム', 'shine', 'ホログラム'], ['オーロラ', 'shine', 'オーロラの輝き'], ['メタリック', 'shine', 'メタリックな質感'],
    ['ホイル', 'shine', 'ホイル'], ['箔', 'shine', '箔'],
    ['ポインセチア', 'flower', 'ポインセチア'], ['フラワー', 'flower', 'お花'], ['デイジー', 'flower', 'デイジー'],
    ['バラ', 'flower', 'バラ'], ['ローズ', 'flower', 'ローズ'], ['押し花', 'flower', '押し花'],
    ['小花', 'flower', '小花'], ['花', 'flower', 'お花'],
    ['ボタニカル', 'botanical', 'ボタニカル柄'], ['リーフ', 'botanical', 'リーフ柄'], ['葉', 'botanical', '葉のアート'],
    ['レース', 'lace', 'レース柄'],
    ['フレンチ', 'french', 'フレンチ'],
    ['グラデーション', 'grad', 'グラデーション'],
    ['マーブル', 'nuance', 'マーブル'], ['大理石', 'nuance', '大理石風アート'], ['天然石', 'nuance', '天然石風アート'],
    ['ニュアンス', 'nuance', 'ニュアンスアート'], ['水彩', 'nuance', '水彩風アート'], ['タイダイ', 'nuance', 'タイダイ柄'],
    ['チェック', 'fabric', 'チェック柄'], ['ツイード', 'fabric', 'ツイード柄'], ['キルティング', 'fabric', 'キルティング'],
    ['ニット', 'fabric', 'ニット柄'], ['格子', 'fabric', '格子柄'],
    ['レオパード', 'animal', 'レオパード柄'], ['牛柄', 'animal', '牛柄'], ['アニマル', 'animal', 'アニマル柄'],
    ['ゼブラ', 'animal', 'ゼブラ柄'], ['タイガー', 'animal', 'タイガー柄'],
    // 季節の行事（その月に掲載がなければ、選択肢「季節のイベント」は自動で出ない）
    ['サンタ', 'seasonal', 'サンタ'], ['トナカイ', 'seasonal', 'トナカイ'], ['雪だるま', 'seasonal', '雪だるま'],
    ['雪の結晶', 'seasonal', '雪の結晶'], ['ツリー', 'seasonal', 'ツリー'], ['オーナメント', 'seasonal', 'オーナメント'],
    ['キャンディー', 'seasonal', 'キャンディー柄'], ['リース', 'seasonal', 'リース'], ['ポインセチア', 'seasonal', 'ポインセチア'],
    ['雪のような', 'seasonal', '雪のアート'],
    ['ハロウィン', 'seasonal', 'ハロウィン柄'], ['ガイコツ', 'seasonal', 'ガイコツ'], ['かぼちゃ', 'seasonal', 'かぼちゃ'],
    ['おばけ', 'seasonal', 'おばけ'], ['コウモリ', 'seasonal', 'コウモリ'],
    [/桜|さくら(?!んぼ)/, 'seasonal', '桜'], ['花火', 'seasonal', '花火'], ['金魚', 'seasonal', '金魚'],
    ['ひまわり', 'seasonal', 'ひまわり'], ['紅葉', 'seasonal', '紅葉'], ['もみじ', 'seasonal', 'もみじ'],
    ['水引', 'seasonal', '水引'], ['バレンタイン', 'seasonal', 'バレンタイン柄'], ['イースター', 'seasonal', 'イースター柄'],
    ['スマイル', 'pop', 'スマイル'], ['モンスター', 'pop', 'モンスター'], ['キャラクター', 'pop', 'キャラクター'],
    ['犬の顔', 'pop', '犬のモチーフ'], ['クマ', 'pop', 'クマ'], ['カエル', 'pop', 'カエル'], ['ポップ', 'pop', 'ポップなアート'],
    ['チェリー', 'fruit', 'チェリー'], ['さくらんぼ', 'fruit', 'さくらんぼ'], ['りんご', 'fruit', 'りんご'], ['柑橘', 'fruit', '柑橘モチーフ'],
    ['ハート', 'heart', 'ハート'],
    ['リボン', 'ribbon', 'リボン'],
    ['シェル', 'shell', 'シェル'],
    ['ストライプ', 'graphic', 'ストライプ'], ['カラーブロック', 'graphic', 'カラーブロック'], ['幾何学', 'graphic', '幾何学アート'],
    ['ライン', 'graphic', 'ライン使い'], ['曲線', 'graphic', '曲線アート'], ['直線', 'graphic', '直線アート'],
    ['ドット', 'graphic', 'ドット'], ['水玉', 'graphic', '水玉'],
    ['立体', 'solid', '立体アート'], ['3D', 'solid', '立体アート'],
    ['大きな', 'big', ''], ['大粒', 'big', ''],
    ['シンプル', 'simple', 'シンプルな色使い'],
    ['ネオン', 'neon', ''],
  ];

  // ---------------------------------------------------------------- 服の色
  // match: 色のグループ → [点, 理由の型]
  //   pop=映える / blend=なじむ / shine=輝きがアクセント / clean=すっきりまとまる
  // clash: 主役の色として出ると合わせにくい色（減点）
  const CLOTHES = [
    { id: 'white', label: '白・アイボリー', noun: '白い服',
      match: { red: [3, 'pop'], bordeaux: [3, 'pop'], navy: [3, 'pop'], pink: [2, 'pop'], blue: [2, 'pop'], green: [2, 'pop'],
               purple: [2, 'pop'], orange: [2, 'pop'], yellow: [2, 'pop'], brown: [2, 'pop'], black: [2, 'pop'], multi: [2, 'pop'],
               beige: [2, 'blend'], gold: [1, 'shine'], silver: [1, 'shine'] }, clash: [] },
    { id: 'black', label: '黒', noun: '黒い服',
      match: { red: [3, 'pop'], bordeaux: [3, 'pop'], white: [2, 'clean'], pink: [2, 'pop'], gold: [2, 'shine'], silver: [2, 'shine'],
               beige: [2, 'blend'], purple: [1, 'pop'], gray: [1, 'blend'], black: [1, 'blend'] }, clash: [] },
    { id: 'gray', label: 'グレー', noun: 'グレーの服',
      match: { pink: [3, 'pop'], purple: [3, 'blend'], navy: [2, 'blend'], blue: [2, 'pop'], bordeaux: [2, 'pop'], white: [2, 'clean'],
               silver: [2, 'shine'], gray: [1, 'blend'], black: [1, 'blend'] }, clash: [] },
    { id: 'beige', label: 'ベージュ・ブラウン', noun: 'ベージュやブラウンの服',
      match: { green: [3, 'pop'], brown: [2, 'blend'], beige: [2, 'blend'], white: [2, 'clean'], bordeaux: [2, 'pop'],
               orange: [2, 'blend'], gold: [2, 'shine'], pink: [1, 'blend'] }, clash: [] },
    { id: 'navy', label: 'ネイビー・デニム', noun: 'ネイビーやデニムの服',
      match: { white: [3, 'clean'], red: [2, 'pop'], pink: [2, 'pop'], orange: [2, 'pop'], yellow: [2, 'pop'], blue: [2, 'blend'],
               silver: [2, 'shine'], navy: [1, 'blend'], gold: [1, 'shine'], beige: [1, 'blend'] }, clash: [] },
    { id: 'pink', label: 'ピンク・赤', noun: 'ピンクや赤の服',
      match: { beige: [3, 'blend'], white: [3, 'clean'], pink: [2, 'blend'], gray: [2, 'blend'], silver: [2, 'shine'],
               gold: [1, 'shine'], bordeaux: [1, 'blend'], brown: [1, 'blend'] }, clash: ['green', 'orange', 'yellow', 'blue', 'multi'] },
    { id: 'green', label: 'グリーン・カーキ', noun: 'グリーンやカーキの服',
      match: { brown: [3, 'blend'], beige: [3, 'blend'], white: [2, 'clean'], orange: [2, 'pop'], yellow: [2, 'pop'],
               bordeaux: [2, 'pop'], gold: [2, 'shine'], green: [1, 'blend'], black: [1, 'blend'] }, clash: ['pink', 'purple'] },
    { id: 'blue', label: 'ブルー・水色', noun: 'ブルーや水色の服',
      match: { white: [3, 'clean'], blue: [2, 'blend'], navy: [2, 'blend'], yellow: [2, 'pop'], orange: [2, 'pop'],
               silver: [2, 'shine'], pink: [1, 'pop'], beige: [1, 'blend'], gray: [1, 'blend'] }, clash: [] },
  ];
  const CLOTHES_MIN = 3;      // 服との相性がこの点以上の写真だけを候補にする
  const ACCENT_WEIGHT = 0.5;  // 主役でない色（説明の後ろのほうに出る色）の重み
  const CLASH_PENALTY = 1.5;

  // ---------------------------------------------------------------- 予定
  // want: 向いている要素と点（c:色のグループ / m:要素 / t:調子）
  // need: この中の要素が1つも無ければ候補にしない（色だけでは「お呼ばれ向き」と言わない）
  // avoid: 1つでもあれば候補から外す要素
  // minus: 減点する要素（n:many は、主役の色が3色以上あるデザイン）
  // min: この点以上の写真だけを候補にする
  const OCCASIONS = [
    { id: 'wedding', label: '結婚式・お呼ばれ',
      want: { 'm:pearl': 3, 'm:flower': 2, 'm:stone': 2, 'm:lace': 2, 'c:pink': 2, 'c:beige': 2, 'm:shell': 1, 'm:lame': 1,
              'm:french': 1, 'm:grad': 1, 'c:white': 1, 'c:gold': 1, 't:soft': 1 },
      need: ['m:pearl', 'm:flower', 'm:stone', 'm:lace', 'm:shell'],
      avoid: ['m:seasonal', 'm:pop', 'm:fruit', 'm:animal', 'm:neon'],
      minus: { 'c:black': 3, 'c:multi': 2, 'm:fabric': 1 }, min: 5,
      reason: w => `${w}が、お呼ばれの席に華やかさを添えます。` },
    { id: 'office', label: 'オフィス・仕事',
      want: { 'c:beige': 3, 't:soft': 2, 'm:french': 2, 'm:grad': 2, 'm:simple': 2, 'c:pink': 1, 'c:gray': 1, 'c:white': 1, 'm:graphic': 1 },
      avoid: ['m:seasonal', 'm:pop', 'm:fruit', 'm:animal', 'm:neon', 'm:solid', 'm:big', 'c:multi'],
      minus: { 't:vivid': 2, 'm:stone': 1, 'm:shine': 1, 'c:red': 1, 'c:orange': 1, 'c:yellow': 1, 'c:blue': 1, 'c:purple': 1, 'n:many': 2, 'm:heart': 2, 'm:ribbon': 1 }, min: 5,
      reason: w => `${w}は、仕事の日にもなじみやすい組み合わせです。` },
    { id: 'ceremony', label: '学校行事・式典',
      want: { 'c:beige': 3, 'c:pink': 2, 'c:white': 2, 't:soft': 2, 'm:pearl': 2, 'm:french': 1, 'm:grad': 1, 'm:flower': 1 },
      avoid: ['m:seasonal', 'm:pop', 'm:fruit', 'm:animal', 'm:neon', 'm:big', 'c:multi'],
      minus: { 'c:black': 2, 't:vivid': 2, 'm:solid': 1, 'c:red': 1, 'c:orange': 1, 'c:yellow': 1, 'c:blue': 1, 'n:many': 2 }, min: 6,
      reason: w => `${w}が、式典らしいきちんとした印象に合います。` },
    { id: 'date', label: 'デート・お食事',
      want: { 'm:heart': 3, 'm:ribbon': 2, 'm:flower': 2, 'c:pink': 2, 'c:bordeaux': 2, 'c:red': 1, 'c:purple': 1,
              'm:pearl': 1, 'm:lame': 1, 'm:french': 1, 't:soft': 1 },
      avoid: ['m:seasonal', 'm:pop', 'm:neon'],
      minus: { 'm:animal': 2, 'c:multi': 1 }, min: 5,
      reason: w => `${w}で、やわらかく華やかな印象になります。` },
    { id: 'travel', label: '旅行・レジャー',
      want: { 't:vivid': 2, 'c:blue': 2, 'c:orange': 2, 'c:yellow': 2, 'c:multi': 2, 'm:shell': 2, 'm:fruit': 2,
              'm:nuance': 1, 'm:shine': 1, 'm:stone': 1, 'm:pop': 1, 'm:graphic': 1, 'c:green': 1 },
      avoid: ['m:seasonal'],
      minus: { 'm:fabric': 2 }, min: 5,
      reason: w => `${w}が、旅先やレジャーの気分を明るくしてくれます。` },
    { id: 'seasonal', label: '季節のイベント',
      want: { 'm:seasonal': 6 }, avoid: [], minus: {}, min: 6,
      reason: w => `${w}で、季節のイベントらしさを楽しめます。` },
    { id: 'daily', label: 'ふだんの日',
      want: { 'm:nuance': 2, 'm:fabric': 2, 'm:simple': 2, 'm:graphic': 1, 'm:french': 1, 'm:grad': 1,
              'c:beige': 1, 'c:brown': 1, 'c:gray': 1, 't:soft': 1 },
      avoid: ['m:seasonal'],
      minus: { 'm:big': 2, 'm:neon': 2, 'm:solid': 1, 'm:stone': 1, 'm:pop': 1 }, min: 4,
      reason: w => `${w}は、ふだんの装いに取り入れやすいデザインです。` },
  ];

  const MAX_RESULTS = 3;
  const SIMILAR_PENALTY = 4;  // 似た写真を続けて選ばないための減点（似ているほど大きい）
  const SAME_COLOR_PENALTY = 2; // 服に合わせる色が同じ写真を続けて選ばないための減点
  const DIVERSITY_MARGIN = 5; // 1位との点差がこの範囲の写真だけを、入れ替えの対象にする

  const CLOTHES_REASON = {
    pop: (word, noun) => `${word}が${noun}に映えます。`,
    blend: (word, noun) => `${word}が${noun}によくなじみます。`,
    shine: (word, noun) => `${word}の輝きが${noun}のアクセントになります。`,
    clean: (word, noun) => `${word}で${noun}がすっきりまとまります。`,
  };

  // ---------------------------------------------------------------- 画像説明の読み取り
  const colorWords = COLORS.slice().sort((a, b) => b[0].length - a[0].length);

  // 色: 長い言葉から順に拾い、拾った部分は伏せる（「ピンクベージュ」を「ピンク」と「ベージュ」に二重で数えない）
  function maskColors(text) {
    let masked = text;
    const found = [];
    colorWords.forEach(([word, families, label, tone]) => {
      let at = masked.indexOf(word);
      while (at !== -1) {
        found.push({ at, word, families, label, tone });
        masked = masked.slice(0, at) + '□'.repeat(word.length) + masked.slice(at + word.length);
        at = masked.indexOf(word, at + word.length);
      }
    });
    found.sort((a, b) => a.at - b.at);
    return { masked, found };
  }

  function analyzeText(alt) {
    const text = String(alt || '');
    const { masked, found } = maskColors(text);

    // 説明は「ボルドーとピンクベージュに小さな赤いハート、ブラウンの白い斑点柄と…」のように、
    // 読点で区切ったまとまりごとに「地の色 ＋ に／の ＋ 飾り」の順で書かれている。
    // まとまりの最初の「に」「の」より前に出る色を主役、後ろに出る色を差し色とみなす。
    // （「に」「の」が無いまとまりは、先頭の2色を主役とする）
    const clauses = [];
    let from = 0;
    for (let i = 0; i <= masked.length; i++) {
      if (i === masked.length || masked[i] === '、') {
        const marker = masked.slice(from, i).search(/[にの]/);
        clauses.push({ from, to: i, marker: marker === -1 ? -1 : from + marker, fallback: 0 });
        from = i + 1;
      }
    }
    const colors = {}; // 色のグループ → { weight, label, main }
    const tones = new Set();
    const mainLabels = []; // 主役の色の呼び名（出てくる順）
    const metalLabels = []; // 地の色として書かれたゴールド・シルバーの呼び名（例: 「ゴールドの波形フレンチ」）
    found.forEach(hit => {
      const clause = clauses.find(c => hit.at >= c.from && hit.at < c.to) || clauses[0];
      const metal = hit.families.includes('gold') || hit.families.includes('silver');
      const leading = !found.some(other => other.at >= clause.from && other.at < clause.marker);
      let main;
      if (clause.marker !== -1 && !leading) main = hit.at < clause.marker;
      else main = !metal && (clause.fallback += 1) <= 2;
      const weight = main || metal ? 1 : ACCENT_WEIGHT;
      hit.families.forEach(family => {
        const known = colors[family];
        if (!known || (main && !known.main)) colors[family] = { weight, label: hit.label, main, metal };
      });
      if (hit.tone && main) tones.add(hit.tone);
      if (main && !metal && !mainLabels.includes(hit.label)) mainLabels.push(hit.label);
      if (main && metal && !metalLabels.includes(hit.label)) metalLabels.push(hit.label);
    });
    if (/淡い|くすみ|透け感|透明感|上品/.test(text)) tones.add('soft');
    if (/鮮やか|ネオン|ポップ/.test(text)) tones.add('vivid');

    // 要素: 色の言葉を伏せた文から拾う（「ローズゴールド」を花の「ローズ」と数えない）
    const motifs = {}; // 要素のグループ → [呼び名...]
    MOTIFS.forEach(([word, tag, label]) => {
      const source = tag === 'neon' ? text : masked; // 「ネオンピンク」は色として伏せてあるので元の文で見る
      const hit = word instanceof RegExp ? word.test(source) : source.includes(word);
      if (!hit) return;
      (motifs[tag] = motifs[tag] || []);
      if (label && !motifs[tag].includes(label)) motifs[tag].push(label);
    });
    return { colors, tones, motifs, mainLabels, metalLabels };
  }

  /* 写真1枚には上下2つのデザインが写っていて、画像説明は「上段のデザイン、下段のデザイン」と
   * 読点で区切って書かれている。服との相性・予定への向き不向き・理由文は、デザイン1つずつで判定する
   * （別々のデザインの特徴を混ぜて「合う」と言わないため）。
   *
   * 分け方（divide）:
   *   1. 読点で区切る。最初のまとまりが1つ目のデザイン。2つ目以降のまとまりは、
   *      地の色（「に」「の」の前に書かれた色）を持つときだけ、新しいデザインの始まりとみなす。
   *      地の色を持たないまとまり（例: 「、パールを合わせた…」「、ゴールドラメを合わせた…」）は
   *      飾りの追記なので、直前のデザインの続きとして扱う。
   *      ゴールド・シルバーだけで書かれたまとまりは、飾りのことが多い（例: 「、ゴールドの縁取り」は
   *      直前のデザインの縁取りで、別のデザインではない）。次のどちらかの場合だけデザインとみなす。
   *        ・柄の名前が付いている（例: 「ゴールドの波形フレンチ」「ゴールドの格子柄」）
   *        ・地として書かれている（例: 「ゴールドラメにカラーストーン」）
   *   2. 読点で2つに分かれない説明は、最初のまとまりが「Aの○○とBの○○」
   *      （地の色＋に/の＋柄や飾りの名前 … と 地の色＋に/の …）の形なら、その「と」で分ける
   *      （例: 「ベージュのゴールドラインとコーラルの押し花風アート」）。
   *   3. それでも2つのデザインに分けられない説明は、どちらのデザインの特徴か判断できないので、
   *      その写真をおすすめの候補にしない（一覧にはこれまでどおり載る）。
   *      説明を「上段、下段」の形に直せば、プログラムを変えなくても候補に戻る。
   *
   * ★更新時の注意: いまのカタログは、どの写真も上下2つのデザインが写っている前提で作ってある。
   *   1つのデザインだけが写った写真を追加すると、説明が2つに分かれないため候補外になる
   *   （不具合ではなく、この決まりの結果）。そういう写真をおすすめに出したい場合は、
   *   このファイルに「1つのデザインの写真」の扱いを足す必要がある。
   *   候補外になっている写真は  node catalog-src/check_coordinate.mjs  で一覧できる。
   *
   * 戻り値: { state: 'split', parts: [前半, 後半] } または { state: 'excluded', parts: [] } */
  const PATTERN_TAGS = ['french', 'grad', 'nuance', 'fabric', 'animal']; // 柄の名前とみなす要素

  function startsDesign(part) {
    const unit = analyzeText(part);
    if (unit.mainLabels.length > 0) return true;
    if (unit.metalLabels.length === 0) return false;
    const { masked } = maskColors(part);
    return /^[^□、]*□+(?:ラメ)?に/.test(masked) || PATTERN_TAGS.some(tag => unit.motifs[tag]);
  }

  function divide(alt) {
    const text = String(alt || '');
    let groups = [];
    text.split('、').forEach(part => {
      if (!groups.length || startsDesign(part)) groups.push(part);
      else groups[groups.length - 1] += '、' + part;
    });
    if (groups.length === 1) {
      const { masked } = maskColors(text);
      const firstEnd = masked.indexOf('、') === -1 ? masked.length : masked.indexOf('、');
      // 「と」を探すのは最初のまとまりの中だけ（読点の後ろは飾りの追記なので、そこでは分けない）
      for (let i = 0; i < firstEnd; i++) {
        // 色どうしをつなぐ「と」（例: 「ピンクとパープルの水彩風アート」）では分けない
        if (masked[i] !== 'と' || masked[i - 1] === '□') continue;
        const left = masked.slice(0, i);
        const right = masked.slice(i + 1);
        // 左: 色のあとに「に」「の」がある／右: 「と」の直後が色で、同じまとまりの中に「に」「の」が続く
        if (/□[^、]*[にの]/.test(left) && /^□+[^、にの]*[にの]/.test(right)) {
          groups = [text.slice(0, i), text.slice(i + 1)];
          break;
        }
      }
    }
    return groups.length === 2 ? { state: 'split', parts: groups } : { state: 'excluded', parts: [] };
  }

  /* 戻り値: デザインごとの特徴の配列（候補にしない写真は空）。
   * which は「ダスティピンク」のような、写真のどちらのデザインかを示す地の色の名前。 */
  function analyze(alt) {
    return divide(alt).parts.map(part => {
      const unit = analyzeText(part);
      const names = unit.mainLabels.length ? unit.mainLabels : unit.metalLabels;
      return Object.assign(unit, { which: names.slice(0, 3).join('・') });
    });
  }

  function has(features, key) {
    const [kind, name] = key.split(':');
    // 予定の判定では、主役の色だけを見る（細い線や小さな飾りの色では判定しない）。ゴールド・シルバーは飾りでも数える。
    if (kind === 'c') return !!features.colors[name] && (features.colors[name].main || features.colors[name].metal);
    if (kind === 'm') return !!features.motifs[name];
    if (kind === 'n') return features.mainLabels.length >= 3;
    return features.tones.has(name);
  }

  function labelFor(features, key) {
    const [kind, name] = key.split(':');
    if (kind === 'c') return features.colors[name].label;
    if (kind === 'm') return features.motifs[name][0] || '';
    return '';
  }

  function scoreOccasion(features, occasion) {
    if (occasion.avoid.some(key => has(features, key))) return null;
    if (occasion.need && !occasion.need.some(key => has(features, key))) return null;
    let score = 0;
    const matched = [];
    Object.entries(occasion.want).forEach(([key, points]) => {
      if (!has(features, key)) return;
      // 季節の柄は、数が多いほどその行事らしい
      const extra = key === 'm:seasonal' ? Math.min(3, features.motifs.seasonal.length - 1) : 0;
      score += points + extra;
      matched.push({ key, points });
    });
    Object.entries(occasion.minus).forEach(([key, points]) => { if (has(features, key)) score -= points; });
    if (score < occasion.min) return null;
    matched.sort((a, b) => b.points - a.points);
    return { score, matched };
  }

  function scoreClothes(features, clothes) {
    const hits = Object.entries(clothes.match)
      .filter(([family]) => features.colors[family])
      .map(([family, [points, relation]]) => ({
        family, relation, label: features.colors[family].label,
        value: points * features.colors[family].weight,
      }))
      .sort((a, b) => b.value - a.value);
    if (!hits.length) return null;
    let score = hits.slice(0, 2).reduce((sum, hit) => sum + hit.value, 0);
    clothes.clash.forEach(family => {
      if (features.colors[family] && features.colors[family].main) score -= CLASH_PENALTY;
    });
    if (score < CLOTHES_MIN) return null;
    return { score, best: hits[0] };
  }

  function joinWords(words) {
    return words.length > 1 ? `${words[0]}と${words[1]}` : words[0];
  }

  function reasonFor(features, clothes, occasion, clothesHit, occasionHit) {
    const first = CLOTHES_REASON[clothesHit.best.relation](clothesHit.best.label, clothes.noun);
    const words = [];
    occasionHit.matched.forEach(({ key }) => {
      if (words.length >= 2) return;
      const candidates = key === 'm:seasonal' ? features.motifs.seasonal : [labelFor(features, key)];
      candidates.forEach(label => {
        if (label && words.length < 2 && label !== clothesHit.best.label && !words.includes(label)) words.push(label);
      });
    });
    // 色や要素の名前で言えないときは、色の調子（やわらかい・鮮やか）で伝える
    if (!words.length) {
      const tone = occasionHit.matched.find(({ key }) => key === 't:soft' || key === 't:vivid');
      if (tone) words.push(tone.key === 't:soft' ? 'やわらかい色合い' : '鮮やかな色合い');
    }
    if (!words.length) return first;
    return first + occasion.reason(joinWords(words));
  }

  function signature(features) {
    const keys = new Set();
    Object.entries(features.colors).forEach(([family, info]) => { if (info.main) keys.add('c:' + family); });
    Object.keys(features.motifs).forEach(tag => keys.add('m:' + tag));
    return keys;
  }

  function similarity(a, b) {
    let shared = 0;
    a.forEach(key => { if (b.has(key)) shared += 1; });
    const total = a.size + b.size - shared;
    return total ? shared / total : 0;
  }

  /* designs: [{ id, no, alt, ... }]（掲載順）。戻り値: 合う写真を最大3件、理由つきで。 */
  function recommend(designs, clothesId, occasionId) {
    const clothes = CLOTHES.find(c => c.id === clothesId);
    const occasion = OCCASIONS.find(o => o.id === occasionId);
    if (!clothes || !occasion) return [];
    const pool = [];
    designs.forEach((design, index) => {
      const units = design.units || (design.units = analyze(design.alt));
      // 服にも予定にも合うデザインだけを候補にする。2つとも合う写真は、点の高いほうを紹介する。
      let best = null;
      units.forEach(features => {
        const occasionHit = scoreOccasion(features, occasion);
        if (!occasionHit) return;
        const clothesHit = scoreClothes(features, clothes);
        if (!clothesHit) return;
        const score = occasionHit.score + clothesHit.score;
        if (!best || score > best.score) best = { features, occasionHit, clothesHit, score };
      });
      if (!best) return;
      pool.push({
        design, index, features: best.features, score: best.score, signature: signature(best.features),
        clothesWord: best.clothesHit.best.label, which: best.features.which,
        reason: reasonFor(best.features, clothes, occasion, best.clothesHit, best.occasionHit),
      });
    });
    // 点の高い順。同点なら掲載順（新しいデザインが上にある）
    pool.sort((a, b) => b.score - a.score || a.index - b.index);
    if (pool.length <= MAX_RESULTS) return pool;

    const picked = [pool[0]];
    const rest = pool.slice(1).filter(item => item.score >= pool[0].score - DIVERSITY_MARGIN);
    while (picked.length < MAX_RESULTS && rest.length) {
      let bestAt = 0;
      let bestValue = -Infinity;
      rest.forEach((item, at) => {
        const closest = Math.max(...picked.map(p => similarity(p.signature, item.signature)));
        // 理由に出す色が同じ写真ばかりにならないようにする
        const sameWord = picked.some(p => p.clothesWord === item.clothesWord) ? SAME_COLOR_PENALTY : 0;
        const value = item.score - SIMILAR_PENALTY * closest - sameWord;
        if (value > bestValue) { bestValue = value; bestAt = at; }
      });
      picked.push(rest.splice(bestAt, 1)[0]);
    }
    // 点差の範囲内に3件そろわなければ、残りは点の高い順に足す
    pool.forEach(item => { if (picked.length < MAX_RESULTS && !picked.includes(item)) picked.push(item); });
    return picked;
  }

  /* その予定に向くデザインが、このコースに1件でもあるか（服の色は問わない） */
  function occasionAvailable(designs, occasion) {
    return designs.some(design => {
      const units = design.units || (design.units = analyze(design.alt));
      return units.some(features => !!scoreOccasion(features, occasion));
    });
  }

  // ---------------------------------------------------------------- ページから候補を読む
  function smallestImage(img) {
    const srcset = img.getAttribute('srcset');
    if (!srcset) return img.getAttribute('src');
    const entries = srcset.split(',').map(part => {
      const [url, width] = part.trim().split(/\s+/);
      return { url, width: parseInt(width, 10) || Infinity };
    }).sort((a, b) => a.width - b.width);
    return entries[0].url;
  }

  function readDesigns() {
    const designs = [];
    document.querySelectorAll('.catalog-gallery .catalog-item[data-design-id]').forEach(item => {
      const img = item.querySelector('img.catalog-photo');
      if (!img || item.dataset.status !== 'published') return;
      if (!item.id) item.id = 'design-' + item.dataset.designId;
      const number = item.querySelector('.catalog-no');
      designs.push({
        id: item.dataset.designId, anchor: item.id, alt: img.getAttribute('alt') || '',
        no: number ? number.textContent.trim() : '', small: smallestImage(img),
        width: img.getAttribute('width'), height: img.getAttribute('height'),
      });
    });
    return designs;
  }

  // ---------------------------------------------------------------- 画面
  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function mount(root, panel) {
    const course = root.dataset.course || 'このコース';
    const designs = readDesigns();
    const occasions = OCCASIONS.filter(occasion => occasionAvailable(designs, occasion));
    const chosen = { clothes: null, occasion: null };

    panel.replaceChildren();
    panel.append(element('p', 'coordinate-lead',
      `着ていく服の色と予定を選ぶと、${course}の掲載デザインから合うものをご提案します。`));

    const result = element('div', 'coordinate-result');
    result.setAttribute('aria-live', 'polite');

    const group = (title, items, field) => {
      const box = element('div', 'coordinate-group');
      box.setAttribute('role', 'group');
      box.setAttribute('aria-label', title);
      box.append(element('p', 'coordinate-group-title', title));
      const list = element('div', 'coordinate-options');
      items.forEach(item => {
        const option = element('button', 'coordinate-option', item.label);
        option.type = 'button';
        option.setAttribute('aria-pressed', 'false');
        option.addEventListener('click', () => {
          chosen[field] = item;
          list.querySelectorAll('.coordinate-option').forEach(other =>
            other.setAttribute('aria-pressed', String(other === option)));
          show();
        });
        list.append(option);
      });
      box.append(list);
      return box;
    };

    function card(item) {
      const design = item.design;
      const li = element('li', 'coordinate-card');
      const link = element('a', 'coordinate-link');
      link.href = '#' + design.anchor;
      const photo = element('span', 'coordinate-photo');
      // 小さいサイズの写真だけを、条件が決まったこの時点で読み込む
      const img = document.createElement('img');
      img.src = design.small;
      if (design.width && design.height) { img.width = design.width; img.height = design.height; }
      img.alt = design.alt;
      img.decoding = 'async';
      photo.append(img);
      if (design.no) photo.append(element('span', 'coordinate-no', 'No.' + design.no));
      link.append(photo);
      // 写真に2つのデザインがあるときは、どちらのデザインの話かを先に示す
      link.append(element('span', 'coordinate-which', `写真のうち「${item.which}」のデザイン`));
      link.append(element('span', 'coordinate-reason', item.reason),
        element('span', 'coordinate-jump', '一覧でこのデザインを見る ↓'));
      link.addEventListener('click', event => {
        const target = document.getElementById(design.anchor);
        if (!target) return; // 見つからなければ、通常のリンク（#design-…）として動く
        event.preventDefault();
        document.querySelectorAll('.catalog-item.is-picked').forEach(node => node.classList.remove('is-picked'));
        target.classList.add('is-picked');
        // 一覧の該当デザインへ確実に移動する（ヘッダーの高さ分は styles.css の scroll-padding-top が空ける）
        const align = () => {
          try { target.scrollIntoView({ block: 'start', behavior: 'instant' }); } catch (error) { target.scrollIntoView(true); }
        };
        align();
        // 移動の直後に写真の読み込みなどで位置がずれたら、一度だけ合わせ直す（その間にお客様がスクロールしていれば何もしない）
        const landedAt = window.scrollY;
        const landedTop = target.getBoundingClientRect().top;
        setTimeout(() => {
          if (window.scrollY === landedAt && Math.abs(target.getBoundingClientRect().top - landedTop) > 4) align();
        }, 350);
        history.replaceState(null, '', '#' + design.anchor);
        target.tabIndex = -1;
        target.focus({ preventScroll: true });
      });
      li.append(link);
      return li;
    }

    function show() {
      result.replaceChildren();
      if (!chosen.clothes || !chosen.occasion) {
        result.append(element('p', 'coordinate-status',
          chosen.clothes ? '続けて「予定」を選んでください。'
            : chosen.occasion ? '続けて「服の色」を選んでください。' : '「服の色」と「予定」を選んでください。'));
        return;
      }
      const picks = recommend(designs, chosen.clothes.id, chosen.occasion.id);
      const title = `${chosen.clothes.noun} × ${chosen.occasion.label}`;
      if (!picks.length) {
        result.append(element('p', 'coordinate-result-title', title),
          element('p', 'coordinate-status',
            `この組み合わせに合うデザインは、掲載中の${course}では見つかりませんでした。服の色か予定を選び直してください。`));
        return;
      }
      result.append(element('p', 'coordinate-result-title', `${title} のおすすめ（${picks.length}件）`));
      if (picks.length < MAX_RESULTS) {
        result.append(element('p', 'coordinate-status', `この組み合わせに合うデザインは${picks.length}件でした。`));
      }
      const list = element('ul', 'coordinate-cards');
      picks.forEach(item => list.append(card(item)));
      result.append(list, element('p', 'coordinate-note',
        '写真を押すと、下の一覧の同じデザインへ移動します。おすすめは写真の説明をもとにした目安です。色や配置の変更は、ご来店時にご相談ください。'));
    }

    panel.append(group('1. 服の色', CLOTHES, 'clothes'), group('2. 予定', occasions, 'occasion'), result);
    show();
  }

  window.KanamoCoordinate = { mount, analyze, divide, recommend, CLOTHES, OCCASIONS };
})();
