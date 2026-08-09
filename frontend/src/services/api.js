import axios from 'axios';



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

  getDashboard: async (workerId) => {
  const response = await axios.get(
    `${API_URL}/dashboard/${workerId}`
  );

  return response.data;
}
};

export const policyApi = {
  getPlans: async (workerId) => {

    const response = await axios.get(
        `${API_URL}/policies/prices/${workerId}`
    );

    return response.data;
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
    eventId,
    description,
    image
  ) => {


    const formData = new FormData();


    formData.append(
      "workerId",
      workerId
    );


    formData.append(
      "policyId",
      policyId
    );


    formData.append(
      "eventId",
      eventId
    );


    formData.append(
      "description",
      description
    );


    if(image){

      formData.append(
        "image",
        image
      );

    }



    const response = await axios.post(

      `${API_URL}/claims/process`,

      formData,

      {
        headers:{
          "Content-Type":
          "multipart/form-data"
        }
      }

    );


    return response.data;

  },


  getWorkerClaims: async (workerId) => {

    const response = await axios.get(
      `${API_URL}/claims/worker/${workerId}`
    );

    return response.data;
  }

};

export const eventApi = {
  getEvents: async () => {
    const response = await axios.get(
      `${API_URL}/events`
    );

    return response.data;
  }
};



