import api from "./api";

const notificationService = {
  getAll: async () => {
    return await api.get("/notifications");
  },
  markAllRead: async () => {
    return await api.post("/notifications/mark-all-read");
  }
};

export default notificationService;
