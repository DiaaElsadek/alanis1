import api from "./api";

const applicationService = {
  getMyApplications: async () => {
    return await api.get("/applications/my");
  },
  apply: async (jobId) => {
    return await api.post("/applications", { jobId });
  },
  getByJob: async (jobId) => {
    return await api.get(`/applications/job/${jobId}`);
  }
};

export default applicationService;
