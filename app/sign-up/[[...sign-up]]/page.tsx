import { SignUp } from "@clerk/nextjs";

export const metadata = {
  title: "Sign Up",
};

export default function SignUpPage() {
  return (
    <div className="flex justify-center py-8">
      <div className="w-full max-w-md">
        <SignUp
          path="/sign-up"
          routing="path"
          signInUrl="/sign-in"
          appearance={{
            elements: {
              formButtonPrimary:
                "bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-xl h-11 transition-colors",
              formFieldInput:
                "border-border-strong hover:border-text-muted focus:border-accent focus:ring-2 focus:ring-accent/20 rounded-xl h-11 text-sm",
              formFieldLabel: "text-sm font-medium text-text-primary",
              footerActionLink: "text-accent hover:text-accent-hover",
              card: "shadow-none border-0 bg-transparent",
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
      </div>
    </div>
  );
}
