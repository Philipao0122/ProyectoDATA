import axios from 'axios';
import { config } from '../config';
import { Topic } from '../types';

// Crear instancia de axios con configuración básica
const api = axios.create({
  baseURL: config.api.baseUrl,
  timeout: config.api.timeout,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Interceptor para loggear peticiones
api.interceptors.request.use(
  config => {
    console.group('API Request');
    console.log('URL:', config.url);
    console.log('Method:', config.method);
    if (config.params) console.log('Params:', config.params);
    if (config.data) console.log('Data:', config.data);
    console.groupEnd();
    return config;
  },
  error => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores
api.interceptors.response.use(
  response => {
    console.group('API Response');
    console.log('URL:', response.config.url);
    console.log('Status:', response.status);
    console.log('Data:', response.data);
    console.groupEnd();
    return response;
  },
  error => {
    console.group('API Error');
    if (error.response) {
      // El servidor respondió con un código de estado fuera del rango 2xx
      console.error('Error de respuesta:', {
        status: error.response.status,
        statusText: error.response.statusText,
        url: error.config.url,
        method: error.config.method,
        data: error.response.data,
      });
    } else if (error.request) {
      // La petición fue hecha pero no se recibió respuesta
      console.error('Error de red:', {
        message: error.message,
        url: error.config?.url,
        method: error.config?.method,
      });
    } else {
      // Algo sucedió en la configuración de la petición
      console.error('Error de configuración:', error.message);
    }
    console.groupEnd();
    return Promise.reject(error);
  }
);

/**
 * Servicio para interactuar con la API de temas
 */
const topicService = {
  /**
   * Obtiene todos los temas
   */
  /**
   * Obtiene todos los temas desde la API
   * @returns Promise<Topic[]> - Lista de temas
   */
  getAllTopics: async (): Promise<Topic[]> => {
    console.group('topicService.getAllTopics');
    const endpoint = config.api.endpoints.topics;
    console.log('🔍 Solicitando temas a la API...');
    
    try {
      // Añadir parámetro de caché para evitar respuestas en caché
      const timestamp = new Date().getTime();
      
      interface ApiResponse {
        topics: any[];
      }
      
      console.log(`🌐 Realizando petición GET a: ${config.api.baseUrl}${endpoint}`);
      
      const response = await api.request<ApiResponse>({
        method: 'get',
        url: endpoint,
        params: { t: timestamp },
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        timeout: 15000, // 15 segundos de timeout
        validateStatus: function (status) {
          return status < 500; // Resolver solo si el código de estado es menor que 500
        }
      });

      console.log('✅ Respuesta de la API recibida con estado:', response.status);
      
      // Verificar si la respuesta es exitosa
      if (response.status !== 200) {
        console.error(`❌ Error en la respuesta de la API: ${response.status} - ${response.statusText}`);
        throw new Error(`Error al obtener los datos: ${response.statusText}`);
      }

      // Verificar si la respuesta tiene datos
      if (!response.data) {
        const errorMsg = 'La respuesta de la API no contiene datos';
        console.error(`❌ ${errorMsg}`);
        throw new Error(errorMsg);
      }

      // Extraer el array de topics del objeto de respuesta
      const responseData = response.data;
      
      if (!responseData.topics) {
        const errorMsg = 'La respuesta de la API no contiene la propiedad "topics"';
        console.error(`❌ ${errorMsg}`, responseData);
        throw new Error(errorMsg);
      }
      
      const topicsData = responseData.topics;
      
      if (!Array.isArray(topicsData)) {
        const errorMsg = 'El formato de la respuesta de la API es incorrecto: se esperaba un array de temas';
        console.error(`❌ ${errorMsg}`, topicsData);
        throw new TypeError(errorMsg);
      }
      
      console.log(`✅ Se recibieron ${topicsData.length} temas`);
      
      // Mapear y validar la estructura de cada tema
      const topics: Topic[] = topicsData.map((topic: any) => ({
        id: topic.id || `temp-${Math.random().toString(36).substr(2, 9)}`,
        title: topic.title || 'Sin título',
        description: topic.description || 'Sin descripción',
        faculty: {
          code: topic.faculty?.code || 'default',
          name: topic.faculty?.name || 'Facultad no especificada',
          color: topic.faculty?.color || '#6b7280'
        },
        type: topic.type || 'general',
        tags: Array.isArray(topic.tags) ? topic.tags : [],
        created_at: topic.created_at || new Date().toISOString(),
        updated_at: topic.updated_at,
        author: {
          id: topic.author?.id || 'system',
          name: topic.author?.name || 'Anónimo',
          email: topic.author?.email || '',
          role: topic.author?.role || 'user',
          avatar_url: topic.author?.avatar_url
        },
        actions: {
          view_url: topic.actions?.view_url || `#/topic/${topic.id}`,
          download_url: topic.actions?.download_url || '',
          comment_enabled: topic.actions?.comment_enabled ?? true,
          share_enabled: topic.actions?.share_enabled ?? true
        },
        upvotes: typeof topic.upvotes === 'number' ? topic.upvotes : 0,
        downvotes: typeof topic.downvotes === 'number' ? topic.downvotes : 0,
        comments: typeof topic.comments === 'number' ? topic.comments : 0,
        views: typeof topic.views === 'number' ? topic.views : 0,
        summary: topic.summary || (topic.description ? `${topic.description.substring(0, 200)}...` : 'Resumen no disponible'),
        content: topic.content,
        icon: topic.icon,
        status: topic.status && ['draft', 'published', 'archived'].includes(topic.status) 
          ? topic.status as 'draft' | 'published' | 'archived'
          : 'published',
        is_featured: Boolean(topic.is_featured),
        related_topics: Array.isArray(topic.related_topics) ? topic.related_topics : [],
        metadata: topic.metadata || {}
      }));
      
      // Log del primer tema como ejemplo
      if (topics.length > 0) {
        console.log('📝 Ejemplo de tema procesado:', JSON.parse(JSON.stringify(topics[0])));
      }
      
      return topics;
      
    } catch (error: any) {
      console.error('❌ Error al obtener los temas:', error);
      
      // Proporcionar información más detallada sobre el error
      if (error.response) {
        // La petición fue hecha y el servidor respondió con un código de estado
        console.error('📊 Datos de la respuesta de error:', {
          status: error.response.status,
          headers: error.response.headers,
          data: error.response.data
        });
      } else if (error.request) {
        // La petición fue hecha pero no se recibió respuesta
        console.error('🔌 No se recibió respuesta del servidor:', error.request);
      } else {
        // Algo pasó al configurar la petición
        console.error('⚠️ Error al configurar la petición:', error.message);
      }
      
      // En desarrollo, devolver datos de ejemplo si hay un error
      if (import.meta.env.MODE === 'development') {
        console.warn('⚠️ Usando datos de ejemplo para desarrollo');
        return [
          {
            id: 'ejemplo-1',
            title: 'Tema de ejemplo',
            description: 'Este es un tema de ejemplo que se muestra cuando hay un error al cargar los datos reales.',
            faculty: {
              code: 'ejemplo',
              name: 'Facultad de Ejemplo',
              color: '#3b82f6'
            },
            type: 'ejemplo',
            tags: ['ejemplo', 'demo'],
            created_at: new Date().toISOString(),
            author: {
              id: 'usuario-ejemplo',
              name: 'Usuario Demo',
              email: 'demo@example.com',
              role: 'admin',
              avatar_url: ''
            },
            actions: {
              view_url: '#/topic/ejemplo-1',
              download_url: '',
              comment_enabled: true,
              share_enabled: true
            },
            upvotes: 42,
            downvotes: 3,
            comments: 7,
            views: 156,
            summary: 'Este es un resumen de ejemplo para mostrar cuando hay un error al cargar los datos reales.',
            status: 'published',
            is_featured: true,
            related_topics: [],
            metadata: {}
          }
        ];
      }
      
      // Propagar el error para que pueda ser manejado por el componente
      throw error;
      
    } finally {
      console.groupEnd();
    }
  },

  /**
   * Obtiene un tema por su ID
   */
  getTopicById: async (id: string): Promise<Topic> => {
    try {
      const response = await api.get<Topic>(config.api.endpoints.topic(id));
      return response.data;
    } catch (error) {
      console.error(`Error al obtener el tema con ID ${id}:`, error);
      throw error;
    }
  },
};

export { topicService };
export default api;
