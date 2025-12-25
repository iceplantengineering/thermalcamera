# Thermal Cup Detector

AIを活用したサーマルカメラ風コップ検出ウェブアプリケーションです。
スマートフォンのカメラ画像からコップを識別し、AIの視覚情報を基に推定温度を表示します。

## 技術スタック
- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Styling**: Framer Motion (アニメーション) + Lucide React (アイコン)
- **Backend**: Netlify Functions (Python 3.8+)
- **AI**: Z.ai (Zhipu AI / GLM-4V) マルチモーダルLLM
- **Deployment**: Netlify

## 現状の動作と制限
- **本番解析モード**: 現在、フロントエンドから画像を送り、Z.ai (GLM-4V) APIを使用してコップの検出と温度推定（視覚的な湯気などから判定）を行うロジックが有効になっています。
- **温度測定の限界**: 通常の中スマートフォンのカメラには熱センサーがないため、表示される温度はAIによる「推定値」です。

## セットアップ

### 1. APIキーの設定
`.env` ファイルに [Zhipu AI (BigModel)](https://open.bigmodel.cn/) で取得したAPIキーを設定してください。

```env
ZAI_API_KEY=your_api_key_here
```

### 2. ライブラリのインストール
```bash
npm install
```

### 3. ローカルでの開発
フロントエンドとバックエンド（Python関数）を同時に動かすには、Netlify CLIを使用します。

```bash
# Netlify CLIのインストール
npm install -g netlify-cli

# 開発サーバーの起動 (http://localhost:8888)
netlify dev
```

※ `npm run dev` だけではフロントエンドしか起動せず、画像解析（API通信）が失敗します。

### 4. Netlifyへのデプロイ
1. GitHubへプッシュします。
2. Netlifyの管理画面からこのリポジトリをインポートします。
3. **重要**: Netlifyの環境変数 (Environment Variables) に `ZAI_API_KEY` を登録してください。
4. 公開されたURLにスマートフォンからアクセスして確認します。

## 開発者向け
- **座標系**: Z.ai からは 1000x1000 で正規化された座標が返ります。`App.tsx` 内でこれを%指定に変換して表示しています。
- **サーモセンシングの拡張**: 実機（AMG8833等）を統合する場合は、`netlify/functions/detect.py` のロジックを修正してセンサデータを読み込むようにしてください。
