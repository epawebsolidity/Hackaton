import { UUID } from "./uuid";

export interface User {
  id_users: UUID;
  address: { address: string };
  first_name: string;
  last_name: string;
  role: string;
}

export type UsersContextType = {
  user: User | null;
  usersAll: User[];
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  setUsersAll: React.Dispatch<React.SetStateAction<User[]>>;
  profileUser: User | null;
  setProfileUser: React.Dispatch<React.SetStateAction<User | null>>;
  fetchUserById: (userId: UUID) => Promise<User | null>;
  fetchUsersAll: () => Promise<User[]>;
  updateProfileUsers: (
    userId: UUID,
    formData: FormData,
  ) => Promise<User | null>;
  getProfileUserById: (id: string) => Promise<User | null>;
};
