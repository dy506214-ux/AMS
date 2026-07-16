const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding initial announcements...');

  // Clear existing announcements
  await prisma.announcement.deleteMany();

  const announcements = [
    {
      title: 'PTM Meeting',
      content: 'PTM will be held on July 20, 2026.',
      category: 'PTM',
      dateInfo: 'July 20, 2026'
    },
    {
      title: 'Holiday Notice',
      content: 'School will remain closed on July 18.',
      category: 'Holiday',
      dateInfo: 'July 18, 2026'
    },
    {
      title: 'Science Exhibition',
      content: 'Science exhibition on July 25, 2026.',
      category: 'Event',
      dateInfo: 'July 25, 2026'
    }
  ];

  for (const item of announcements) {
    await prisma.announcement.create({
      data: item
    });
  }

  console.log('Announcements seeded successfully!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
