# Knipとの統合

このプロジェクトでは、[Knip](https://knip.dev/)とAIエージェントを組み合わせて、未使用コードの自動検出とクリーンアップを実現しています。

## 概要

Knipは、TypeScript/JavaScriptプロジェクト内の以下を検出するツールです：

- 未使用ファイル
- 未使用の依存関係（dependencies）
- 未使用のエクスポート（exports）
- 未使用の型定義（types）

このプロジェクトでは、Knipを3つの方法で活用しています：

1. **CLIツール** - 手動実行による分析
2. **AIエージェント** - 知的な分析と提案
3. **GitHub Actions** - 自動化されたCI/CDパイプライン

## 使い方

### 1. CLIで手動実行

#### 基本的な分析

```bash
npm run knip
```

#### 自動修正（注意して使用）

```bash
npm run knip:fix
```

### 2. AIエージェントを使った分析

Knip専用のAIエージェント `knipAgent` が利用可能です：

```bash
npm run dev
```

Mastraの開発サーバーが起動したら、`knip-cleaner` エージェントと対話できます。エージェントは以下を行います：

- Knip分析の実行
- 結果の分類と重要度評価
- 具体的なクリーンアップ提案
- 削除の影響についての説明

#### エージェントへの質問例

- "コードベースに未使用のコードはありますか？"
- "未使用の依存関係をリストアップしてください"
- "このファイルを削除しても安全ですか？"

### 3. ワークフローで自動分析

`knipCleanupWorkflow` ワークフローを使用して、プログラム的に分析を実行できます：

```typescript
import { mastra } from './src/mastra';

const result = await mastra.workflows.knipCleanupWorkflow.execute({
  triggerData: {
    autoFix: false
  }
});

console.log(result.results.generate_report.report);
```

## GitHub Actions統合

### 自動実行トリガー

Knip分析は以下のタイミングで自動実行されます：

1. **Pull Request** - mainブランチへのPR作成時
2. **Push** - mainブランチへのプッシュ時
3. **定期実行** - 毎週月曜日 0:00 UTC
4. **手動実行** - GitHub UIから手動トリガー可能

### PR コメント

Pull Request に対して、Knipは自動的に分析結果をコメントします：

```markdown
## 🔍 Knip Analysis Results

### 📁 Unused Files (2)
- `src/legacy/old-feature.ts`
- `src/utils/deprecated.ts`

### 📦 Unused Dependencies (1)
- `lodash`

💡 Consider removing these unused items to keep the codebase clean.
```

### アーティファクト

詳細なJSON形式のレポートが、30日間保存されます：

1. GitHub Actionsのワークフローページにアクセス
2. 該当のワークフロー実行を選択
3. "Artifacts" セクションから `knip-report` をダウンロード

## 設定

### knip.json

プロジェクトルートの `knip.json` でKnipの動作をカスタマイズできます：

```json
{
  "$schema": "https://unpkg.com/knip@latest/schema.json",
  "entry": [
    "src/mastra/index.ts"
  ],
  "project": [
    "src/**/*.ts"
  ],
  "ignore": [],
  "ignoreDependencies": [],
  "ignoreExportsUsedInFile": true
}
```

#### 設定項目

- `entry` - エントリーポイントファイル（アプリケーションの開始点）
- `project` - 分析対象のファイルパターン
- `ignore` - 除外するファイルパターン
- `ignoreDependencies` - チェックから除外する依存関係
- `ignoreExportsUsedInFile` - ファイル内でのみ使用されるエクスポートを無視

## ベストプラクティス

### 1. 定期的な実行

週次の自動実行により、未使用コードの蓄積を防ぎます。

### 2. PR時のチェック

新規コード追加時に、未使用コードが含まれていないか自動確認します。

### 3. AIエージェントの活用

複雑な判断が必要な場合は、AIエージェントに相談して、削除の影響を評価してもらいます。

### 4. 慎重な自動修正

`--fix` フラグは便利ですが、以下の点に注意：

- 必ず変更内容を確認
- Gitで変更を追跡
- テストを実行して破壊的変更がないか確認

### 5. 段階的なクリーンアップ

大量の未使用コードがある場合：

1. まずファイルレベルの未使用を削除
2. 次に依存関係を整理
3. 最後にエクスポートを最適化

## トラブルシューティング

### Knipが誤検知する場合

特定のファイルやエクスポートがknipに誤って報告される場合、`knip.json`で除外できます：

```json
{
  "ignore": [
    "src/types/generated/**",
    "src/scripts/migration-*.ts"
  ],
  "ignoreDependencies": [
    "some-runtime-dependency"
  ]
}
```

### エントリーポイントの追加

複数のエントリーポイントがある場合：

```json
{
  "entry": [
    "src/mastra/index.ts",
    "src/scripts/cli.ts",
    "src/server/index.ts"
  ]
}
```

## 参考リンク

- [Knip公式ドキュメント](https://knip.dev/)
- [Knip Configuration](https://knip.dev/reference/configuration)
- [Mastra Documentation](https://mastra.ai/docs)

## まとめ

Knip × AIエージェントの統合により、以下を実現：

✅ 自動化された未使用コード検出  
✅ AI支援による知的な分析と提案  
✅ CI/CDパイプラインでの継続的なコード品質維持  
✅ 手間をかけずにクリーンなコードベースを保持  

この仕組みにより、開発者はコードの品質を気にせず、機能開発に集中できます。
