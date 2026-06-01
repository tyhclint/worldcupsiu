import type {
  BracketDataPayload,
  CreatePredictionRequest,
} from "@/src/lib/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";


//=========================================== AUTH WRAPPER ===========================================
// call all api end points with this wrapper to handle token refresh

export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  let token = localStorage.getItem('access_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let response = await fetch(url, { ...options, headers });

  const clonedResponse = response.clone();
  const responseText = await clonedResponse.text();

  if (response.status === 401 || responseText.includes('PGRST303') || responseText.includes('JWT expired')) {
    const refreshToken = localStorage.getItem('refresh_token');

    if (refreshToken) {
      try {
        const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });

        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          
          // Save the fresh tokens
          localStorage.setItem('access_token', refreshData.access_token);
          if (refreshData.refresh_token) {
            localStorage.setItem('refresh_token', refreshData.refresh_token);
          }

          headers['Authorization'] = `Bearer ${refreshData.access_token}`;
          response = await fetch(url, { ...options, headers });
          
        } else {
          logoutUser();
          throw new Error('Session expired. Please log in again.');
        }
      } catch (error) {
        logoutUser();
        throw new Error('Session expired. Please log in again.');
      }
    } else {
      logoutUser();
      throw new Error('Session expired. Please log in again.');
    }
  }

  return response;
};

//================================================ AUTH ============================================

export interface LoginResponse {
  message: string;
  access_token: string;
  refresh_token: string;
  user: string;
  user_id: string;
}

export const signupUser = async (email: string, username: string, password: string) => {
  const response = await fetch(`${API_BASE_URL}/auth/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, username, password }), 
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Failed to sign up");
  }

  return data;
};

export const loginUser = async (
  email: string, 
  password: string,
): Promise<LoginResponse> => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Failed to login");
  }

  return data;
};

export const logoutUser = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("username");
  localStorage.removeItem("user_id");
  window.location.reload();
};

export const requestPasswordReset = async (email: string) => {
  const response = await fetch(`${API_BASE_URL}/auth/resetpassword`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Failed to send reset email");
  }

  return data;
};

export const updatePassword = async (password: string) => {
  const response = await fetchWithAuth(`${API_BASE_URL}/auth/update-password`, {
    method: "POST",
    body: JSON.stringify({ password }),
  });

  const data = await response.json();

  if (!response.ok) {
    let errorMessage = "Failed to update password, press the forget password button again";
    
    throw new Error(errorMessage);
  }

  return data;
};
//============================================= GAME LOGIC ============================================

export const submitBracketPayload = async (payload: CreatePredictionRequest): Promise<void> => {
  const response = await fetchWithAuth(`${API_BASE_URL}/store`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.detail || `Store request failed with ${response.status}`);
  }
};

export const updateBracketPayload = async (payload: CreatePredictionRequest): Promise<void> => {
  const response = await fetchWithAuth(`${API_BASE_URL}/update`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.detail || `Update request failed with ${response.status}`);
  }
};

export interface RetrieveBracketResponse {
  bracket_data: BracketDataPayload | null;
}

export const retrieveBracketPayload = async (): Promise<RetrieveBracketResponse> => {
  const response = await fetchWithAuth(`${API_BASE_URL}/retrieve`, {
    method: 'GET',
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Failed to load bracket");
  }

  return data;
};

export interface ScoreGroupStageResponse {
  valid: boolean;
  score: number;
  lower_is_better: boolean;
  group_count: number;
}

export const scoreGroupStagePayload = async (
  payload: Pick<BracketDataPayload, "group_stage">,
): Promise<ScoreGroupStageResponse> => {
  const response = await fetch(`${API_BASE_URL}/score/group-stage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail || `Score request failed with ${response.status}`,
    );
  }

  return data;
};

//=============================================== ROOMS ==============================================

export const createRoom = async (name: string, userId: string) => {
  const response = await fetchWithAuth(`${API_BASE_URL}/rooms/`, {
    method: 'POST',
    body: JSON.stringify({ name, user_id: userId }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Failed to create room");
  }

  return data;
};

export const joinRoom = async (roomId: string, userId: string) => {
  const response = await fetchWithAuth(`${API_BASE_URL}/rooms/${roomId}/join`, {
    method: 'POST',
    body: JSON.stringify({ user_id: userId }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Failed to join room");
  }

  return data;
};

export const getUserRooms = async (userId: string) => {
  const response = await fetchWithAuth(`${API_BASE_URL}/rooms/?user_id=${userId}`, {
    method: 'GET',
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Failed to fetch rooms");
  }

  return data;
};

export const getRoomMembers = async (roomId: string) => {
  const response = await fetchWithAuth(`${API_BASE_URL}/rooms/${roomId}/members`, {
    method: 'GET',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to fetch room members');
  }

  return response.json();
};