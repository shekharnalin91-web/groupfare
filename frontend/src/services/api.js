const BASE_URL = '/api/v1';

async function fetchJSON(endpoint, options = {}) {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };
  
  if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
    config.body = JSON.stringify(config.body);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, config);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.detail || data.message || `HTTP error ${response.status}`;
    throw new Error(errorMsg);
  }

  return data;
}

export const api = {
  // --- Auth & Users ---
  auth: {
    login: (creds) => fetchJSON('/auth/login', { method: 'POST', body: creds }),
    register: (userData) => fetchJSON('/auth/register', { method: 'POST', body: userData }),
    getAllUsers: () => fetchJSON('/auth/users'),
    getUserProfile: (userId) => fetchJSON(`/auth/user/${userId}`),
  },

  // --- Travel Requests ---
  travelRequests: {
    create: (userId, requestData) =>
      fetchJSON(`/travel-requests/?user_id=${encodeURIComponent(userId)}`, {
        method: 'POST',
        body: requestData,
      }),
    getUserRequests: (userId) => fetchJSON(`/travel-requests/user/${userId}`),
    delete: (requestId, userId) =>
      fetchJSON(`/travel-requests/${requestId}?user_id=${encodeURIComponent(userId)}`, {
        method: 'DELETE',
      }),
  },

  // --- Groups ---
  groups: {
    getGroups: (filters = {}) => {
      const params = new URLSearchParams();
      if (filters.departure) params.append('departure', filters.departure);
      if (filters.destination) params.append('destination', filters.destination);
      if (filters.status) params.append('status', filters.status);
      const query = params.toString() ? `?${params.toString()}` : '';
      return fetchJSON(`/groups/${query}`);
    },
    getGroupDetails: (groupId) => fetchJSON(`/groups/${groupId}`),
    getByInviteCode: (inviteCode) => fetchJSON(`/groups/invite/${inviteCode}`),
    createGroup: (creatorId, groupData) =>
      fetchJSON(`/groups/?creator_id=${encodeURIComponent(creatorId)}`, {
        method: 'POST',
        body: groupData,
      }),
    joinGroup: (groupId, userId, passengersCount = 1, status = 'confirmed', travelRequestId = null) => {
      const params = new URLSearchParams({
        user_id: userId,
        passengers_count: passengersCount.toString(),
        status,
      });
      if (travelRequestId) params.append('travel_request_id', travelRequestId);
      return fetchJSON(`/groups/${groupId}/join?${params.toString()}`, { method: 'POST' });
    },
    leaveGroup: (groupId, userId) =>
      fetchJSON(`/groups/${groupId}/leave?user_id=${encodeURIComponent(userId)}`, { method: 'POST' }),
    requestQuote: (groupId, requesterId) =>
      fetchJSON(`/groups/${groupId}/request-quote?requester_id=${encodeURIComponent(requesterId)}`, { method: 'POST' }),
    extendDeadline: (groupId, additionalDays = 3) =>
      fetchJSON(`/groups/${groupId}/extend-deadline?additional_days=${additionalDays}`, { method: 'POST' }),
  },

  // --- Fare Quotations & Comparisons ---
  quotations: {
    getGroupQuotation: (groupId) => fetchJSON(`/quotations/group/${groupId}`),
    acceptQuotation: (quotationId, userId) =>
      fetchJSON(`/quotations/${quotationId}/accept?user_id=${encodeURIComponent(userId)}`, { method: 'POST' }),
  },

  // --- Notifications ---
  notifications: {
    getUserNotifications: (userId) => fetchJSON(`/notifications/user/${userId}`),
    markAsRead: (notifId, userId) =>
      fetchJSON(`/notifications/${notifId}/read?user_id=${encodeURIComponent(userId)}`, { method: 'POST' }),
    markAllAsRead: (userId) =>
      fetchJSON(`/notifications/user/${userId}/read-all`, { method: 'POST' }),
  },

  // --- AI Agent & Assistant ---
  ai: {
    chat: (payload) => fetchJSON('/ai/chat', { method: 'POST', body: payload }),
    match: (requestData) => fetchJSON('/ai/match', { method: 'POST', body: requestData }),
    explainRecommendation: (requestId, groupId) =>
      fetchJSON(`/ai/explain/${requestId}/${groupId}`),
    getFallbackStrategy: (groupId) => fetchJSON(`/ai/fallback/${groupId}`),
  },

  // --- Admin Portal ---
  admin: {
    getAnalytics: () => fetchJSON('/admin/analytics'),
    getAllUsers: () => fetchJSON('/admin/users'),
    getAllTravelRequests: () => fetchJSON('/admin/travel-requests'),
    getGroupsMonitor: () => fetchJSON('/admin/groups'),
    updateGroupStatus: (groupId, status) =>
      fetchJSON(`/admin/groups/${groupId}/status?status=${encodeURIComponent(status)}`, { method: 'POST' }),
    issueQuotation: (quoteData) =>
      fetchJSON('/admin/quotations/issue', { method: 'POST', body: quoteData }),
  },

  // --- Real Flights & Airline Group Desks ---
  flights: {
    getFlights: (filters = {}) => {
      const params = new URLSearchParams();
      if (filters.departure) params.append('departure', filters.departure);
      if (filters.destination) params.append('destination', filters.destination);
      if (filters.airline) params.append('airline', filters.airline);
      const query = params.toString() ? `?${params.toString()}` : '';
      return fetchJSON(`/flights/${query}`);
    },
    getAirlinePolicies: () => fetchJSON('/flights/airlines'),
    getRoutes: () => fetchJSON('/flights/routes'),
    getFlightById: (flightId) => fetchJSON(`/flights/${flightId}`),
  },
};
