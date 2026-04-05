import { Card, Alert } from "@/components/ui";

interface EnvironmentSetupPanelProps {
  missingKeys: string[];
}

export function EnvironmentSetupPanel({
  missingKeys,
}: EnvironmentSetupPanelProps) {
  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <Card variant="elevated" padding="lg" className="w-full max-w-xl">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-warning-subtle text-warning mb-4">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-text-primary">
            Setup Required
          </h1>
          <p className="text-sm text-text-secondary mt-2 max-w-md mx-auto">
            The app needs some environment variables to be configured before it can run.
            Copy{" "}
            <code className="px-1.5 py-0.5 bg-surface-subtle rounded text-xs font-mono">
              .env.example
            </code>{" "}
            to{" "}
            <code className="px-1.5 py-0.5 bg-surface-subtle rounded text-xs font-mono">
              .env.local
            </code>{" "}
            and fill in the required values.
          </p>
        </div>

        <Alert variant="warning" title="Missing environment variables">
          <ul className="space-y-2 mt-2">
            {missingKeys.map((key) => (
              <li
                key={key}
                className="font-mono text-xs bg-surface-subtle px-3 py-2 rounded-lg"
              >
                {key}
              </li>
            ))}
          </ul>
        </Alert>

        <div className="mt-6 p-4 bg-surface-subtle rounded-xl">
          <p className="text-sm font-medium text-text-primary mb-2">Quick start:</p>
          <ol className="text-sm text-text-secondary space-y-1 list-decimal list-inside">
            <li>Create accounts at Clerk and Convex</li>
            <li>Copy your API keys to .env.local</li>
            <li>Run npm run convex:dev to start the backend</li>
            <li>Run npm run dev to start the dev server</li>
          </ol>
        </div>
      </Card>
    </main>
  );
}
