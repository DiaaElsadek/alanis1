import api from "./api";

const jobService = {
  getAll: async () => {
    return await api.get("/jobs");
  },
  getById: async (id) => {
    return await api.get(`/jobs/${id}`);
  },
  getCompanyJobs: async () => {
    return await api.get("/jobs/company");
  },
  create: async (payload) => {
    return await api.post("/jobs", payload);
  },
  update: async (id, payload) => {
    return await api.put(`/jobs/${id}`, payload);
  },
  remove: async (id) => {
    return await api.delete(`/jobs/${id}`);
  },
};

export default jobService;
