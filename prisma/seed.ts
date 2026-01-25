import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create admin user in AdminUser table
  const adminEmail = 'superadmin@admin.local'
  const adminPassword = 'superadmin'
  const hashedPassword = await bcrypt.hash(adminPassword, 10)

  const existingAdmin = await prisma.adminUser.findUnique({
    where: { email: adminEmail },
  })

  if (existingAdmin) {
    console.log('Admin user already exists, updating...')
    await prisma.adminUser.update({
      where: { email: adminEmail },
      data: {
        password: hashedPassword,
      },
    })
  } else {
    console.log('Creating admin user...')
    await prisma.adminUser.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        name: 'Super Admin',
      },
    })
  }

  console.log('Admin user created/updated:')
  console.log('  Email: superadmin@admin.local')
  console.log('  Password: superadmin')
  console.log('')
  console.log('Seeding completed!')
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
