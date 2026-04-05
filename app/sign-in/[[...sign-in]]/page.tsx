import { SignIn } from "@clerk/nextjs";
import { Card } from "@/components/ui";

export const metadata = {
  title: "Sign In",
};

export default function SignInPage() {
  return (
    <div className="flex justify-center py-8">
      <Card variant="elevated" padding="lg" className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-xl font-semibold text-text-primary">Welcome back</h1>
          <p className="text-sm text-text-secondary mt-1">
            Sign in to create polls and cast your votes
          </p>
        </div>
        <SignIn
          path="/sign-in"
          routing="path"
          signUpUrl="/sign-up"
          appearance={{
            elements: {
              formButtonPrimary:
                "bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-xl h-11 transition-colors",
              formFieldInput:
                "border-border-strong hover:border-text-muted focus:border-accent focus:ring-2 focus:ring-accent/20 rounded-xl h-11 text-sm",
              formFieldLabel: "text-sm font-medium text-text-primary",
              footerActionLink: "text-accent hover:text-accent-hover",
              card: "shadow-none",
              header: "hidden",
              dividerLine: "bg-border",
              dividerText: "text-text-tertiary",
              socialButtonsBlockButton:
                "border-border-strong hover:border-accent hover:bg-accent-subtle/30 rounded-xl h-11 transition-colors",
              socialButtonsBlockButtonText: "text-sm font-medium text-text-primary",
              formFieldErrorText: "text-danger text-xs",
              alertText: "text-danger text-sm",
            },
          }}
        />
      </Card>
    </div>
  );
}
