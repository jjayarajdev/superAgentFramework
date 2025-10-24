import client from './client';

export const documentsAPI = {
  // Get all documents
  getAll: async () => {
    const response = await client.get('/api/v1/documents');
    return response.data;
  },

  // Get single document
  get: async (id) => {
    const response = await client.get(`/api/v1/documents/${id}`);
    return response.data;
  },

  // Upload document
  upload: async (file, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await client.post('/api/v1/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        }
      },
    });
    return response.data;
  },

  // Delete document
  delete: async (id) => {
    const response = await client.delete(`/api/v1/documents/${id}`);
    return response.data;
  },
};

export default documentsAPI;
