import ProfileClientPages from "./ProfileClient";

interface PageProps {
  params: { id_users: string };
}

export default async function ProfilePage({ params }: PageProps) {
  // Jika Next.js menganggap params Promise, kita bisa await
  const resolvedParams = await params;
  const id_users = resolvedParams.id_users;

  return <ProfileClientPages id_users={id_users} />;
}
