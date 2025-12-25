# Thermal Cup Detector

AIを活用したサーマルカメラ風コップ検出ウェブアプリケーションです。
スマートフォンのカメラからコップを識別し、40度以上の温度を検知して表示します。

## 技術スタック
- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Styling**: Framer Motion (アニメーション) + Lucide React (アイコン)
- **Backend**: Netlify Functions (Python)
- **AI**: Z.ai (Zhipu AI / GLM-4V) マルチモーダルLLM
- **Deployment**: Netlify

## セットアップ
1. `.env` ファイルに `ZAI_API_KEY` を設定してください。
2. ライブラリのインストール:
   ```bash
   npm install
   ```
3. ローカルでの開発:
   ```bash
   npm run dev
   ```
4. Netlifyへのデプロイ:
   - GitHubへプッシュし、Netlifyでこのリポジトリを接続します。
   - Netlifyの環境変数に `ZAI_API_KEY` を登録してください。

## 注意事項
- スマートフォンの標準カメラでは実際の温度測定はできません。このアプリはPythonのサーモセンシングライブリを統合するための構造を提供しており、現在はデモ用のシミュレーションロジックが含まれています。
- 実機（AMG8833等）を接続する場合は、`netlify/functions/detect.py` 内のロジックを実機ライブラリに合わせて修正してください。
