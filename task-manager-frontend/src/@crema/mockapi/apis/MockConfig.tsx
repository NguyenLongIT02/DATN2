import jwtAxios from "@crema/services/axios";

import MockAdapter from "axios-mock-adapter";

// Temporarily disable mock to test real backend
export default new MockAdapter(jwtAxios, {
  delayResponse: 100,
  onNoMatch: "passthrough",
});
