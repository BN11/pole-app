import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Check if data already exists
  const fieldCount = await prisma.field.count()
  if (fieldCount > 0) {
    console.log(`Seed skipped: ${fieldCount} fields already in DB`)
    return
  }

  console.log('Seeding test data...')

  // Find or create super admin as owner
  let owner = await prisma.user.findFirst({ where: { telegramId: '495248129' } })
  if (!owner) {
    owner = await prisma.user.create({
      data: {
        telegramId: '495248129',
        firstName: 'Admin',
        lastName: 'ПОЛЕ',
        role: 'FIELD_OWNER',
        referralCode: 'ADMIN001',
      },
    })
  }

  // Create test fields in Tashkent
  const fields = await Promise.all([
    prisma.field.create({
      data: {
        name: 'Поле Yunusabad',
        description: 'Современное футбольное поле с искусственным покрытием в центре Юнусабада.',
        address: 'Юнусабадский район, ул. Амира Темура 15, Ташкент',
        lat: 41.3615,
        lng: 69.2956,
        sportTypes: ['FOOTBALL'],
        pricePerHour: 250000,
        currency: 'сум',
        status: 'APPROVED',
        rating: 4.8,
        reviewCount: 24,
        hasLighting: true,
        hasParking: true,
        hasLockerRoom: true,
        hasShower: true,
        hasBallRent: true,
        ownerId: owner.id,
        photos: [],
      },
    }),
    prisma.field.create({
      data: {
        name: 'Chilonzor Arena',
        description: 'Просторный спортивный комплекс с полями для футбола и баскетбола.',
        address: 'Чиланзарский район, ул. Катартал 22, Ташкент',
        lat: 41.2995,
        lng: 69.2167,
        sportTypes: ['FOOTBALL', 'BASKETBALL'],
        pricePerHour: 200000,
        currency: 'сум',
        status: 'APPROVED',
        rating: 4.5,
        reviewCount: 18,
        hasLighting: true,
        hasParking: true,
        hasCafeteria: true,
        ownerId: owner.id,
        photos: [],
      },
    }),
    prisma.field.create({
      data: {
        name: 'Mirzo-Ulugbek Sport',
        description: 'Теннисный корт и волейбольная площадка в тихом районе.',
        address: 'Мирзо-Улугбекский район, ул. Фаробий 5, Ташкент',
        lat: 41.3312,
        lng: 69.3589,
        sportTypes: ['TENNIS', 'VOLLEYBALL'],
        pricePerHour: 150000,
        currency: 'сум',
        status: 'APPROVED',
        rating: 4.2,
        reviewCount: 11,
        hasLighting: false,
        hasParking: true,
        ownerId: owner.id,
        photos: [],
      },
    }),
    prisma.field.create({
      data: {
        name: 'Bektemir FC',
        description: '5x5 мини-футбол с отличным газоном и ночным освещением.',
        address: 'Бектемирский район, ул. Бектемир 8, Ташкент',
        lat: 41.2785,
        lng: 69.3712,
        sportTypes: ['FOOTBALL'],
        pricePerHour: 180000,
        currency: 'сум',
        status: 'APPROVED',
        rating: 4.6,
        reviewCount: 31,
        hasLighting: true,
        hasBallRent: true,
        hasLockerRoom: true,
        ownerId: owner.id,
        photos: [],
      },
    }),
    prisma.field.create({
      data: {
        name: 'Sergeli Basketball',
        description: 'Баскетбольная площадка NBA-стандарта с трибунами.',
        address: 'Сергелийский район, пр. Нурафшон 12, Ташкент',
        lat: 41.2312,
        lng: 69.2587,
        sportTypes: ['BASKETBALL'],
        pricePerHour: 120000,
        currency: 'сум',
        status: 'APPROVED',
        rating: 4.3,
        reviewCount: 9,
        hasParking: true,
        hasLighting: true,
        ownerId: owner.id,
        photos: [],
      },
    }),
  ])

  // Create a test tournament
  await prisma.tournament.create({
    data: {
      title: 'Кубок Ташкента 2026',
      description: 'Ежегодный городской турнир по мини-футболу. 5x5, нокаут-система.',
      sportType: 'FOOTBALL',
      format: '5x5',
      location: 'Поле Yunusabad, Ташкент',
      startDate: new Date('2026-05-01'),
      endDate: new Date('2026-05-15'),
      registrationDeadline: new Date('2026-04-25'),
      maxTeams: 16,
      registeredTeams: 4,
      prizePool: 5000000,
      entryFee: 200000,
      status: 'APPROVED',
      operatorId: owner.id,
    },
  })

  console.log(`✅ Seeded: ${fields.length} fields, 1 tournament`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
