import { UUID } from "./uuid";

export interface MessageChat {
  id_message: string;
  id_personal_chat: string;
  id_users: string;
  message: string;
  date: string;
  user: {
    id_users: string;
    first_name: string;
    last_name: string;
    foto: string | null;
  };
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
