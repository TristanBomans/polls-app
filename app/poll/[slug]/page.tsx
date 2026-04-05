import { PollDetailScreen } from "@/components/polls/poll-detail-screen";

interface PollPageProps {
  params: Promise<{ slug: string }>;
}

export default async function PollPage({ params }: PollPageProps) {
  const { slug } = await params;

  return <PollDetailScreen slug={slug} />;
}
