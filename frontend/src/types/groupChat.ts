import { UUID } from "./uuid";

export interface ChatGroup {
  id_group_chat: UUID;
  id_users: string;
  name_group: string;
  foto?: string; // optional, since fallback exists
  members?: {
    id_users: string;
    username: string;
    first_name?: string;
    last_name?: string;
    foto?: string | null;
  }[]; // optional array of member objects
}



export type ChatGroupContextType = {
  createChatGroup: (payload: FormData) => Promise<ChatGroup | null>;
  getChatGroup: (id_users: string) => Promise<any[]>;
  getChatGroupUsersId: (id_group_chat: string) => Promise<string[]>;
  getChatGroupId: (id_group_chat: string) => Promise<ChatGroup | null>;
  headerchatGroups: {
    group: ChatGroup | null;
    members: any[];
  };
  chatGroups: ChatGroup[];
  loading: boolean;
  success: boolean;
};
