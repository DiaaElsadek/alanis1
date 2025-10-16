import api from "./api";

const messageService = {
  getAll: async () => {
    return await api.get("/messages");
  },
  send: async ({ toUserId, text }) => {
    return await api.post("/messages", { toUserId, text });
  },
  getConversation: async (withUserId) => {
    return await api.get(`/messages/conversation/${withUserId}`);
  }
};

export default messageService;
