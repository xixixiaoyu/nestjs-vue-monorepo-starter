import 'dotenv/config'

const DEFAULT_DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/appdb?schema=public'

const config = {
  schema: 'prisma/schema.prisma',
  datasource: {
    url: process.env.DATABASE_URL ?? DEFAULT_DATABASE_URL,
  },
}

export default config
