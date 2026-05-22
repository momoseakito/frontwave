# FrontWave

欧州を舞台にしたブラウザ戦略ゲーム。

## リポジトリ構成

```
frontwave/
├── .devcontainer/          # VS Code 開発コンテナ設定
├── packages/
│   └── game-engine/        # ゲームロジック（TypeScript）
├── assets/
│   └── europe-provinces.geojson   # 欧州地図データ
├── demo/                   # スタンドアロン Canvas デモ（ブラウザで直接開ける）
└── docs/
    └── ui-migration-guide.md      # UI 移植候補ファイル一覧
```

## セットアップ

```bash
pnpm install
pnpm build       # game-engine をコンパイル
pnpm typecheck   # 型チェック
```

## デモを見る

`demo/index.html` をブラウザで直接開くと欧州地図のビジュアライゼーションが表示される。
（ローカルファイルアクセス制限がある場合は簡易 HTTP サーバーを使う）

```bash
npx serve .      # ルートを HTTP サーバーで起動し http://localhost:3000/demo/ を開く
```

## 開発コンテナ

VS Code の "Dev Containers" 拡張機能を使い、`.devcontainer/` の設定でコンテナを起動する。
Node 24 がインストール済みの環境が立ち上がり、ポート 3000 が転送される。

## ゲームエンジン API

```typescript
import { createGame, tick, attack, declareWar } from "frontwave-engine";

const state = createGame("de"); // ドイツでゲーム開始
const next = tick(state);       // 100ms 分の状態更新
```

## UI について

フロントエンドフレームワークは未定。`docs/ui-migration-guide.md` に
asobee.gg モノレポの React 実装（参考実装）の一覧を記載している。
