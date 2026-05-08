import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Student Organization Management System API',
      version: '1.0.0',
      description: 'RESTful API for SOMS - manages students, organizations, events, and documents',
    },
    servers: [
      { url: 'http://localhost:3000', description: 'Development server' },
      { url: 'https://soms-api.onrender.com', description: 'Production server' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
