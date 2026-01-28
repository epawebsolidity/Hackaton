import { useUsers } from "@/context/UsersContext";

export function useProfile() {
  const { user } = useUsers();

  if (!user) return null;

  return {
    name:
      user.first_name || user.last_name
        ? `${user.first_name} ${user.last_name}`.trim()
        : user.username,
    username: user.username,
    avatar: user.foto,
    followers: 100,
    following: 100,
  };
}
