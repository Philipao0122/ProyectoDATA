// Configuración de la aplicación
export const config = {
  // URL base de la API
  api: {
    baseUrl: import.meta.env.VITE_API_URL || 'https://apidata-wpyp.onrender.com',
    endpoints: {
      topics: '/api/topics/topics',
      topic: (id: string) => `/api/topics/${id}`,
    },
    timeout: 10000, // 10 segundos
  },
  
  // Configuración de la interfaz
  ui: {
    defaultPageSize: 10,
    debounceTime: 300, // ms para búsquedas
  },
  
  // Configuración de temas
  themes: {
    light: {
      primary: '#3B82F6',
      background: '#FFFFFF',
      text: '#111827',
    },
    dark: {
      primary: '#60A5FA',
      background: '#1F2937',
      text: '#F9FAFB',
    },
  },
};
