import {
  User,
  Workspace,
  Persona,
  PersonaMemory,
  Survey,
  SurveyResponse,
  Interview,
  InterviewTurn,
  InsightsReport,
  BackgroundJob,
  NotificationItem,
  EmailRecord,
  WouldUseScoreData,
} from '../types';

let accessToken: string | null = null;

export function setAuthToken(token: string | null) {
  accessToken = token;
  if (token) {
    localStorage.setItem('sug_token', token);
  } else {
    localStorage.removeItem('sug_token');
  }
}

export function getAuthToken(): string | null {
  if (!accessToken && typeof window !== 'undefined') {
    accessToken = localStorage.getItem('sug_token');
  }
  return accessToken;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const isGet = !options.method || options.method.toUpperCase() === 'GET';
  const maxRetries = isGet ? 3 : 1;
  const apiBase = (import.meta as any).env?.VITE_API_URL || '';
  const url = endpoint.startsWith('http') ? endpoint : `${apiBase}${endpoint}`;
  let lastError: any = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const contentType = response.headers.get('content-type');
      const isJson = contentType && contentType.includes('application/json');
      const data = isJson ? await response.json() : await response.text();

      if (!response.ok) {
        const errorMsg =
          isJson && (data.error || data.message || data.detail)
            ? data.error || data.message || data.detail
            : `Request failed with status ${response.status}`;
        const err = new Error(errorMsg) as Error & { status: number; data?: unknown };
        err.status = response.status;
        err.data = data;
        throw err;
      }

      return data as T;
    } catch (err: any) {
      lastError = err;
      // Do not retry client 4xx errors
      if (err.status && err.status < 500) {
        throw err;
      }
      // If network failed (e.g. Failed to fetch), pause and retry
      if (attempt < maxRetries - 1) {
        await new Promise((r) => setTimeout(r, 400 * (attempt + 1)));
      }
    }
  }

  throw lastError || new Error('Network request failed');
}

export const api = {
  // Auth
  async signup(name: string, email: string): Promise<{
    success: boolean;
    message: string;
    requires_otp: boolean;
    delivery_status?: string;
    smtp_info?: string;
    otp_preview?: string;
  }> {
    return request('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email }),
    });
  },

  async login(email: string): Promise<{
    success: boolean;
    message: string;
    requires_otp: boolean;
    delivery_status?: string;
    smtp_info?: string;
    otp_preview?: string;
  }> {
    return request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  async verifyOtp(email: string, otp: string, purpose: 'signup' | 'login'): Promise<{ user: User; access_token: string; message?: string }> {
    const res = await request<{ user: User; access_token: string; message?: string }>('/api/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp, purpose }),
    });
    setAuthToken(res.access_token);
    return res;
  },

  async getMe(): Promise<{ user: User }> {
    return request('/api/auth/me');
  },

  async updateNotificationPrefs(prefs: Partial<User['notification_prefs']>): Promise<{ user: User }> {
    return request('/api/auth/preferences', {
      method: 'PATCH',
      body: JSON.stringify(prefs),
    });
  },

  async logout(): Promise<void> {
    try {
      await request('/api/auth/logout', { method: 'POST' });
    } finally {
      setAuthToken(null);
    }
  },

  async deleteAccount(): Promise<{ success: boolean; message: string }> {
    try {
      return await request('/api/auth/account', { method: 'DELETE' });
    } finally {
      setAuthToken(null);
    }
  },

  // Workspaces
  async getWorkspaces(): Promise<Workspace[]> {
    return request('/api/workspaces');
  },

  async syncWorkspaces(workspaces: Workspace[]): Promise<{ success: boolean; count: number }> {
    return request('/api/workspaces/sync', {
      method: 'POST',
      body: JSON.stringify({ workspaces }),
    });
  },

  async createWorkspace(data: Omit<Workspace, '_id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Workspace> {
    return request('/api/workspaces', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateWorkspace(id: string, updates: Partial<Workspace>): Promise<{ success: boolean; workspace: Workspace }> {
    return request(`/api/workspaces/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  async getWorkspace(id: string): Promise<Workspace> {
    return request(`/api/workspaces/${id}`);
  },

  async deleteWorkspace(id: string): Promise<{ success: boolean }> {
    return request(`/api/workspaces/${id}`, { method: 'DELETE' });
  },

  // Personas
  async getPersonas(workspaceId: string): Promise<Persona[]> {
    return request(`/api/workspaces/${workspaceId}/personas`);
  },

  async generatePersonas(workspaceId: string, count: number): Promise<{ job_id: string; message: string }> {
    return request(`/api/workspaces/${workspaceId}/personas/generate`, {
      method: 'POST',
      body: JSON.stringify({ count }),
    });
  },

  async seedDemoPersonas(workspaceId: string, count = 100): Promise<{ job_id: string; message: string }> {
    return request(`/api/workspaces/${workspaceId}/personas/seed-demo`, {
      method: 'POST',
      body: JSON.stringify({ count }),
    });
  },

  async getPersona(id: string): Promise<Persona> {
    return request(`/api/personas/${id}`);
  },

  async getPersonaMemory(personaId: string): Promise<PersonaMemory> {
    return request(`/api/personas/${personaId}/memory`);
  },

  async regeneratePersona(personaId: string): Promise<Persona> {
    return request(`/api/personas/${personaId}/regenerate`, { method: 'POST' });
  },

  // Surveys
  async getSurveys(workspaceId: string): Promise<Survey[]> {
    return request(`/api/workspaces/${workspaceId}/surveys`);
  },

  async createSurvey(workspaceId: string, data: { title: string; questions: Survey['questions'] }): Promise<Survey> {
    return request(`/api/workspaces/${workspaceId}/surveys`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getSurvey(surveyId: string): Promise<Survey> {
    return request(`/api/surveys/${surveyId}`);
  },

  async runSurvey(surveyId: string, personaIds?: string[]): Promise<{ job_id: string; message: string }> {
    return request(`/api/surveys/${surveyId}/run`, {
      method: 'POST',
      body: JSON.stringify({ persona_ids: personaIds }),
    });
  },

  async getSurveyResponses(surveyId: string): Promise<SurveyResponse[]> {
    return request(`/api/surveys/${surveyId}/responses`);
  },

  // Interviews
  async getInterviews(workspaceId: string): Promise<Interview[]> {
    return request(`/api/workspaces/${workspaceId}/interviews`);
  },

  async createInterview(workspaceId: string, personaId: string, title?: string): Promise<Interview> {
    return request(`/api/workspaces/${workspaceId}/interviews`, {
      method: 'POST',
      body: JSON.stringify({ persona_id: personaId, title }),
    });
  },

  async getInterview(interviewId: string): Promise<Interview> {
    return request(`/api/interviews/${interviewId}`);
  },

  async sendInterviewMessage(
    interviewId: string,
    message: string,
    persona?: Persona
  ): Promise<{
    interview: Interview;
    messages: InterviewTurn[];
  }> {
    return request(`/api/interviews/${interviewId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ text: message, persona }),
    });
  },

  // Insights
  async getInsights(workspaceId: string): Promise<InsightsReport | null> {
    return request(`/api/workspaces/${workspaceId}/insights`);
  },

  async generateInsights(workspaceId: string): Promise<{ job_id: string; message: string }> {
    return request(`/api/workspaces/${workspaceId}/insights/generate`, {
      method: 'POST',
    });
  },

  // Jobs
  async getJob(jobId: string): Promise<BackgroundJob | null> {
    try {
      return await request(`/api/jobs/${jobId}`);
    } catch {
      return null;
    }
  },

  async getActiveJobs(): Promise<BackgroundJob[]> {
    try {
      const res = await request('/api/jobs/active');
      return Array.isArray(res) ? res : [];
    } catch {
      return [];
    }
  },

  // Notifications
  async getNotifications(): Promise<NotificationItem[]> {
    try {
      return await request('/api/notifications');
    } catch {
      return [];
    }
  },

  async markNotificationRead(id: string): Promise<{ success: boolean }> {
    return request(`/api/notifications/${id}/read`, { method: 'POST' });
  },

  async markAllNotificationsRead(): Promise<{ success: boolean }> {
    return request('/api/notifications/read-all', { method: 'POST' });
  },

  // Email simulation inbox & SMTP
  async getEmailInbox(): Promise<EmailRecord[]> {
    try {
      return await request('/api/emails');
    } catch {
      return [];
    }
  },

  async getSmtpStatus(): Promise<{ host: string; port: number; user: string; configured: boolean }> {
    return request('/api/smtp/status');
  },

  async sendTestEmail(to?: string): Promise<{ success: boolean; record?: EmailRecord; error?: string }> {
    return request('/api/smtp/test', {
      method: 'POST',
      body: JSON.stringify({ to }),
    });
  },

  // Export
  async exportCsvData(workspaceId: string): Promise<{ personas_csv: string; responses_csv: string; insights_csv: string }> {
    return request(`/api/workspaces/${workspaceId}/export/csv`);
  },

  async getFullReport(workspaceId: string): Promise<{
    workspace: Workspace;
    personas: Persona[];
    surveys: Survey[];
    responses: SurveyResponse[];
    insights: InsightsReport | null;
  }> {
    return request(`/api/workspaces/${workspaceId}/export/full-data`);
  },

  // Would Use This Product Scoring Mode
  async getWouldUseScore(workspaceId: string): Promise<WouldUseScoreData> {
    return request(`/api/workspaces/${workspaceId}/would-use`);
  },

  async evaluateWouldUseScore(workspaceId: string): Promise<WouldUseScoreData> {
    return request(`/api/workspaces/${workspaceId}/would-use/evaluate`, {
      method: 'POST',
    });
  },

  // Quality Assurance & Validation Suite
  async getQAValidation(workspaceId: string): Promise<import('../types').QAValidationSuiteData | null> {
    try {
      return await request(`/api/workspaces/${workspaceId}/validation`);
    } catch {
      return null;
    }
  },

  async runQAValidation(workspaceId: string, payload: {
    product_name?: string;
    target_price?: string;
    test_question?: string;
    selected_model?: string;
    persona_ids?: string[];
  }): Promise<import('../types').QAValidationSuiteData> {
    return request(`/api/workspaces/${workspaceId}/validation/run`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async saveWorkspaceProject(workspaceId: string, updates: Partial<Workspace>): Promise<{ success: boolean; workspace: Workspace }> {
    return request(`/api/workspaces/${workspaceId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  async askAiDoubt(prompt: string, workspaceId?: string): Promise<{ answer: string }> {
    return request('/api/ai/doubt', {
      method: 'POST',
      body: JSON.stringify({ prompt, workspaceId }),
    });
  },
};
