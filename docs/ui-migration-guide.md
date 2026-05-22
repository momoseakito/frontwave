# UI 移植候補ファイル一覧

asobee.gg モノレポ（`apps/web/`）にある FrontWave UI 実装。
フロントエンドフレームワーク決定後に参照・移植する。

## ページ

| ファイル | 内容 |
|---------|------|
| `apps/web/src/app/strategy/page.tsx` | `/strategy` ルートページ（ネーション選択 → ゲーム画面） |

## コンポーネント（`apps/web/src/components/strategy/`）

| ファイル | 内容 |
|---------|------|
| `FrontWaveCanvasMap.tsx` | メインマップ（Canvas + SVG、ズーム・パン・攻撃アニメーション） |
| `FrontWaveMap.tsx` | 旧マップ実装（参考用） |
| `FrontWaveStatePanel.tsx` | 州情報パネル（攻撃・移動ボタン含む） |
| `FrontWaveCardHand.tsx` | カード手札 UI |
| `FrontWaveTopBar.tsx` | ゲーム速度・ズームボタン |
| `FrontWaveEventLog.tsx` | イベントログ |
| `DiplomacyModal.tsx` | 同盟・宣戦布告 UI |
| `WarDeclarationDialog.tsx` | 宣戦布告確認ダイアログ |
| `TransferModal.tsx` | 兵力移動確認モーダル |
| `MenuModal.tsx` | メニュー（一時停止・リセット） |

## フック

| ファイル | 内容 |
|---------|------|
| `apps/web/src/hooks/useStrategyGame.ts` | ゲーム状態管理（reducer パターン、速度制御、フェーズ管理） |

## 依存ライブラリ（UI 側）

- `d3` v7.9 — 地図投影・パス描画
- `react` v18
- `tailwindcss` — スタイリング

## 描画方式

- Canvas 2 枚（ベース描画 + オーバーレイ）+ SVG レイヤーの 3 層構成
- D3 Mercator 投影、`europe-provinces.geojson` を使用
- 州 ID を RGB エンコードしてヒットテスト（O(1) クリック判定）
- HiDPI 対応（`devicePixelRatio` スケーリング）
- 攻撃アニメーション：ゴーストアロー（フェードアウト）方式
