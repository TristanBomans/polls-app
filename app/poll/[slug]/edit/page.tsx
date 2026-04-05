import { PollEditScreen } from "@/components/polls/poll-edit-screen";

interface EditPollPageProps {
  params: Promise<{ slug: string }>;
}

export const metadata = {
  title: "Edit Poll",
};

export default async function EditPollPage({ params }: EditPollPageProps) {
  const { slug } = await params;

  return <PollEditScreen slug={slug} />;
}
