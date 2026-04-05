import { PollForm } from "@/components/forms/poll-form";
import { PageHeader } from "@/components/ui";

export const metadata = {
  title: "Create Poll",
};

export default function NewPollPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        label="New poll"
        title="Create a poll"
        description="Ask a question and provide options for people to vote on. You'll get a shareable link immediately."
      />
      <PollForm mode="create" />
    </div>
  );
}
