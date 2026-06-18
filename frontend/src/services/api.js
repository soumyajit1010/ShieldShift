import axios from 'axios';

// Mock responses since backend is not fully integrated for some features
const MOCK_DELAY = 800;
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const API_URL = 'http://localhost:8080/api';

export const authApi = {
  sendOtp: async (phone) => {
    const response = await axios.post(
      `${API_URL}/auth/send-otp`,
      {
        mobileNumber: phone
      }
    );

    return response.data;
  },
  verifyOtp: async (phone, otp) => {
    const response = await axios.post(
      `${API_URL}/auth/verify-otp`,
      {
        mobileNumber: phone,
        otp
      }
    );

    return response.data;
  },
  signup: async (name, phone, otp) => {
    const response = await axios.post(`${API_URL}/auth/signup`, { name, phone, otp });
    return response.data;
  }
};

export const workerApi = {
  register: async (workerData) => {

    const response = await axios.post(
      `${API_URL}/users/register`,
      workerData
    );

    return response.data;
  },

  getDashboard: async () => {
    return {
      status: "ACTIVE",
      coveredDisruptions: 0,
      activeEvents: []
    };
  }
};

export const policyApi = {
  getPlans: async () => {
    await delay(MOCK_DELAY);
    return [
      {
        id: "basic",
        name: "SAATHI",
        aiPrice: 29,
        maxDaily: 250,
        maxWeekly: 500,
        label: "Essential protection"
      },
      {
        id: "standard",
        name: "RAKSHAK",
        aiPrice: 59,
        maxDaily: 500,
        maxWeekly: 1200,
        badge: "MOST POPULAR",
        label: "Best for full-time workers"
      },
      {
        id: "pro",
        name: "SURAKSHA",
        aiPrice: 99,
        maxDaily: 900,
        maxWeekly: 2500,
        label: "Maximum coverage"
      }
    ];
  },
  purchasePlan: async (workerId, tier) => {

    const response = await axios.post(
      `${API_URL}/policies/create`,
      {
        workerId,
        tier
      }
    );

    return response.data;
  }
};

export const claimsApi = {

  createClaim: async (
    workerId,
    policyId,
    eventId
  ) => {

    const response = await axios.post(
      `${API_URL}/claims/process`,
      {
        workerId,
        policyId,
        eventId
      }
    );

    return response.data;
  }

};

export const eventApi = {

  getEvents: async () => {

    const response =
      await axios.get(
        `${API_URL}/events`
      );

    return response.data;
  }

};
