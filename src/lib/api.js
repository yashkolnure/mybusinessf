import axios from 'axios';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

// ── Create Instance ────────────────────────────────────────────────────────
export const api = axios.create({
  baseURL:         API_URL,
  withCredentials: true,
  timeout:         30000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request Interceptor — attach access token ──────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('accessToken') || (typeof window !== 'undefined' && window.__accessToken);
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor — handle 401 + token refresh ─────────────────────
let isRefreshing  = false;
let refreshQueue  = [];

const processQueue = (error, token = null) => {
  refreshQueue.forEach(({ resolve, reject }) => error ? reject(error) : resolve(token));
  refreshQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshQueue.push({ resolve, reject });
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        });
      }

      original._retry = true;
      isRefreshing    = true;

      try {
        const { data } = await axios.post(`${API_URL}/auth/refresh-token`, {}, { withCredentials: true });
        const newToken = data.data.accessToken;

        Cookies.set('accessToken', newToken, { expires: 1/96 }); // 15 min
        if (typeof window !== 'undefined') window.__accessToken = newToken;

        processQueue(null, newToken);
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch (refreshError) {
        processQueue(refreshError, null);
        Cookies.remove('accessToken');
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Show toast for non-401 errors (skip for silent requests)
    if (!original.silent && error.response?.status !== 401) {
      const message = error.response?.data?.message || 'Something went wrong.';
      toast.error(message);
    }

    return Promise.reject(error);
  }
);

// ── Typed API Modules ──────────────────────────────────────────────────────

export const authApi = {
  register:       (data) => api.post('/auth/register', data),
  login:          (data) => api.post('/auth/login', data),
  logout:         ()     => api.post('/auth/logout'),
  refreshToken:   ()     => api.post('/auth/refresh-token'),
  getMe:          ()     => api.get('/auth/me'),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword:  (data) => api.post('/auth/reset-password', data),
  changePassword: (data) => api.patch('/auth/change-password', data),
};

export const dashboardApi = {
  get: () => api.get('/dashboard'),
};

export const clientsApi = {
  list:         (params) => api.get('/clients', { params }),
  get:          (id)     => api.get(`/clients/${id}`),
  create:       (data)   => api.post('/clients', data),
  update:       (id, data) => api.patch(`/clients/${id}`, data),
  delete:       (id)     => api.delete(`/clients/${id}`),
  getActivity:  (id)     => api.get(`/clients/${id}/activity`),
  getStatement: (id, params) => api.get(`/clients/${id}/statement`, { params }),
};

export const invoicesApi = {
  list:           (params) => api.get('/invoices', { params }),
  get:            (id)     => api.get(`/invoices/${id}`),
  create:         (data)   => api.post('/invoices', data),
  update:         (id, data) => api.patch(`/invoices/${id}`, data),
  send:           (id)     => api.post(`/invoices/${id}/send`),
  cancel:         (id)     => api.post(`/invoices/${id}/cancel`),
  duplicate:      (id)     => api.post(`/invoices/${id}/duplicate`),
  downloadPDF:    (id)     => api.get(`/invoices/${id}/pdf`, { responseType: 'blob' }),
  recordPayment:  (id, data) => api.post(`/invoices/${id}/payments`, data),
  deletePayment:  (id, paymentId) => api.delete(`/invoices/${id}/payments/${paymentId}`),
};

export const quotationsApi = {
  list:             (params) => api.get('/quotations', { params }),
  get:              (id)     => api.get(`/quotations/${id}`),
  create:           (data)   => api.post('/quotations', data),
  update:           (id, data) => api.patch(`/quotations/${id}`, data),
  updateStatus:     (id, data) => api.patch(`/quotations/${id}/status`, data),
  send:             (id)     => api.post(`/quotations/${id}/send`),
  convertToInvoice: (id, data) => api.post(`/quotations/${id}/convert-to-invoice`, data),
  delete:           (id)     => api.delete(`/quotations/${id}`),
};

export const workforceApi = {
  listEmployees:     (params) => api.get('/workforce/employees', { params }),
  getEmployee:       (id)     => api.get(`/workforce/employees/${id}`),
  createEmployee:    (data)   => api.post('/workforce/employees', data),
  updateEmployee:    (id, data) => api.patch(`/workforce/employees/${id}`, data),
  deleteEmployee:    (id)     => api.delete(`/workforce/employees/${id}`),
  listAttendance:    (params) => api.get('/workforce/attendance', { params }),
  markAttendance:    (data)   => api.post('/workforce/attendance', data),
  bulkAttendance:    (data)   => api.post('/workforce/attendance/bulk', data),
  attendanceSummary: (params) => api.get('/workforce/attendance/summary', { params }),
  listLeaves:        (params) => api.get('/workforce/leaves', { params }),
  createLeave:       (data)   => api.post('/workforce/leaves', data),
  updateLeaveStatus: (id, data) => api.patch(`/workforce/leaves/${id}/status`, data),
  listSalaries:      (params) => api.get('/workforce/salaries', { params }),
  createSalary:      (data)   => api.post('/workforce/salaries', data),
  markSalaryPaid:    (id, data) => api.patch(`/workforce/salaries/${id}/mark-paid`, data),
};

export const vendorsApi = {
  listVendors:     (params) => api.get('/vendors/vendors', { params }),
  getVendor:       (id)     => api.get(`/vendors/vendors/${id}`),
  createVendor:    (data)   => api.post('/vendors/vendors', data),
  updateVendor:    (id, data) => api.patch(`/vendors/vendors/${id}`, data),
  deleteVendor:    (id)     => api.delete(`/vendors/vendors/${id}`),
  listPurchases:   (params) => api.get('/vendors/purchases', { params }),
  getPurchase:     (id)     => api.get(`/vendors/purchases/${id}`),
  createPurchase:  (data)   => api.post('/vendors/purchases', data),
  recordPayment:   (id, data) => api.post(`/vendors/purchases/${id}/payments`, data),
};

export const inventoryApi = {
  summary:      ()           => api.get('/inventory/summary'),
  lowStock:     ()           => api.get('/inventory/low-stock'),
  list:         (params)     => api.get('/inventory', { params }),
  get:          (id)         => api.get(`/inventory/${id}`),
  create:       (data)       => api.post('/inventory', data),
  update:       (id, data)   => api.patch(`/inventory/${id}`, data),
  delete:       (id)         => api.delete(`/inventory/${id}`),
  adjustStock:  (id, data)   => api.post(`/inventory/${id}/stock-adjust`, data),
  getStockLogs: (id, params) => api.get(`/inventory/${id}/stock-logs`, { params }),
};

export const financeApi = {
  dashboard:    ()         => api.get('/finance/dashboard'),
  cashFlow:     (params)   => api.get('/finance/cash-flow', { params }),
  categories:   ()         => api.get('/finance/categories'),
  list:         (params)   => api.get('/finance', { params }),
  get:          (id)       => api.get(`/finance/${id}`),
  create:       (data)     => api.post('/finance', data),
  update:       (id, data) => api.patch(`/finance/${id}`, data),
  delete:       (id)       => api.delete(`/finance/${id}`),
};

export const reportsApi = {
  sales:            (params) => api.get('/reports/sales', { params }),
  expenses:         (params) => api.get('/reports/expenses', { params }),
  employees:        (params) => api.get('/reports/employees', { params }),
  inventory:        ()       => api.get('/reports/inventory'),
  gst:              (params) => api.get('/reports/gst', { params }),
  exportStatement:  (params) => api.get('/reports/invoice-statement', { params, responseType: 'blob' }),
};

export const settingsApi = {
  getProfile:       ()         => api.get('/settings/business'),
  updateProfile:    (data)     => api.patch('/settings/business', data),
  uploadLogo:       (formData) => api.post('/settings/business/logo', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  listTaxes:        ()         => api.get('/settings/taxes'),
  createTax:        (data)     => api.post('/settings/taxes', data),
  updateTax:        (id, data) => api.patch(`/settings/taxes/${id}`, data),
  deleteTax:        (id)       => api.delete(`/settings/taxes/${id}`),
  resetNumbering:   (data)     => api.post('/settings/numbering/reset', data),
};

export const notificationsApi = {
  list:        (params) => api.get('/notifications', { params }),
  unreadCount: ()       => api.get('/notifications/unread-count'),
  markRead:    (id)     => api.patch(`/notifications/${id}/read`),
  markAllRead: ()       => api.patch('/notifications/mark-all-read'),
  delete:      (id)     => api.delete(`/notifications/${id}`),
  clearRead:   ()       => api.delete('/notifications/clear-read'),
};

export const usersApi = {
  list:           (params) => api.get('/users', { params }),
  get:            (id)     => api.get(`/users/${id}`),
  invite:         (data)   => api.post('/users/invite', data),
  update:         (id, data) => api.patch(`/users/${id}`, data),
  deactivate:     (id)     => api.delete(`/users/${id}`),
  getPermissions: (id)     => api.get(`/users/${id}/permissions`),
  setPermissions: (id, data) => api.put(`/users/${id}/permissions`, data),
  updateProfile:  (data)   => api.patch('/users/profile', data),
};

export const auditApi = {
  list: (params) => api.get('/audit', { params }),
  get:  (id)     => api.get(`/audit/${id}`),
};

export default api;

// ── Extend settingsApi with SMTP ─────────────────────────────────────────────
// Patch the exported object (file uses const so we add methods)
settingsApi.getSMTPConfig  = ()     => api.get('/settings/smtp');
settingsApi.updateSMTPConfig = (data) => api.put('/settings/smtp', data);
settingsApi.testSMTP       = (data) => api.post('/settings/smtp/test', data);

// ── Extend invoicesApi with credit notes ─────────────────────────────────────
invoicesApi.createCreditNote = (id, data) => api.post(`/invoices/${id}/credit-notes`, data);
invoicesApi.listCreditNotes  = (id)       => api.get(`/invoices/${id}/credit-notes`);
