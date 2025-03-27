export default () => ({
  app: {
    env: process.env.NODE_ENV || 'dev',
  },

  defaultConnection: {
    type: 'postgres',
    url: process.env.DATABASE_URL || '',
    entities: [__dirname + '/**/*.entity{.ts,.js}'],
    migrations: [__dirname + '/migrations/*{.ts,.js}'],
    synchronize: false, // Set to false in production environments
    logging: true, // Enable logging if needed,
    autoLoadEntities: true,
    options: { encrypt: false },
  },
  mimeType: {
    extension: {
      'application/pdf': 'pdf',
      'image/jpeg': 'jpg',
      'image/png': 'png',
    },
  },
});
