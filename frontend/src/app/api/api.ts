const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

//================================================ AUTH ============================================

export interface LoginResponse {
  message: string;
  access_token: string;
  refresh_token: string;
  user: string;
}

export const signupUser = async (username: string, password: string) => {
  const response = await fetch(`${API_BASE_URL}/auth/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || 'Failed to sign up');
  }

  return data;
};

export const loginUser = async (username: string, password: string): Promise<LoginResponse> => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || 'Failed to login');
  }

  return data;
};


export const logoutUser = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('username');
  window.location.reload(); 
};



//============================================= GAME LOGIC ============================================


export const submitBracketPayload = async (payload: any): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/store`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Store request failed with ${response.status}`);
  }

};