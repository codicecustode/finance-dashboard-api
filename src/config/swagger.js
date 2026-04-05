import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Finance Dashboard API',
      version: '1.0.0',
      description: `
## Finance Dashboard Backend API

A RESTful API for managing financial records with role-based access control.

### Roles
- **Viewer** — Read-only access to records and dashboard summaries
- **Analyst** — Viewer permissions + access to advanced analytics
- **Admin** — Full access: manage users, records, and all operations

### Authentication
Use the \`/api/auth/login\` endpoint to obtain a JWT token, then include it as:
\`Authorization: Bearer <token>\`
      `,
      contact: {
        name: 'Finance Dashboard API',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
            errors: { type: 'array', items: { type: 'object' } },
          },
        },
        Success: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string' },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/routes/*.js', './src/models/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
