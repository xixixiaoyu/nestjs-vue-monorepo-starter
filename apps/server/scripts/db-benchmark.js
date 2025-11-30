const { PrismaClient } = require('@prisma/client')
const { performance } = require('perf_hooks')

const prisma = new PrismaClient()

async function benchmarkDatabase() {
  const results = {
    timestamp: new Date().toISOString(),
    tests: [],
  }

  console.log('Starting database performance benchmarks...')

  // 测试 1: 查询性能
  console.log('Running query performance test...')
  const queryStart = performance.now()

  for (let i = 0; i < 1000; i++) {
    await prisma.user.findMany({
      take: 10,
      select: {
        id: true,
        email: true,
        name: true,
      },
    })
  }

  const queryEnd = performance.now()
  const queryTime = queryEnd - queryStart

  results.tests.push({
    name: 'Query Performance',
    operations: 1000,
    totalTime: queryTime,
    avgTime: queryTime / 1000,
    opsPerSecond: (1000 / queryTime) * 1000,
  })

  // 测试 2: 插入性能
  console.log('Running insert performance test...')
  const insertStart = performance.now()

  const users = []
  for (let i = 0; i < 100; i++) {
    users.push({
      email: `benchmark-${i}-${Date.now()}@example.com`,
      name: `Benchmark User ${i}`,
      password: 'hashedpassword',
    })
  }

  await prisma.user.createMany({
    data: users,
  })

  const insertEnd = performance.now()
  const insertTime = insertEnd - insertStart

  results.tests.push({
    name: 'Insert Performance',
    operations: 100,
    totalTime: insertTime,
    avgTime: insertTime / 100,
    opsPerSecond: (100 / insertTime) * 1000,
  })

  // 测试 3: 更新性能
  console.log('Running update performance test...')
  const updateStart = performance.now()

  const testUsers = await prisma.user.findMany({
    take: 50,
    where: {
      email: {
        startsWith: 'benchmark-',
      },
    },
  })

  for (const user of testUsers) {
    await prisma.user.update({
      where: { id: user.id },
      data: { name: `${user.name} (updated)` },
    })
  }

  const updateEnd = performance.now()
  const updateTime = updateEnd - updateStart

  results.tests.push({
    name: 'Update Performance',
    operations: 50,
    totalTime: updateTime,
    avgTime: updateTime / 50,
    opsPerSecond: (50 / updateTime) * 1000,
  })

  // 测试 4: 删除性能
  console.log('Running delete performance test...')
  const deleteStart = performance.now()

  await prisma.user.deleteMany({
    where: {
      email: {
        startsWith: 'benchmark-',
      },
    },
  })

  const deleteEnd = performance.now()
  const deleteTime = deleteEnd - deleteStart

  results.tests.push({
    name: 'Delete Performance',
    operations: testUsers.length,
    totalTime: deleteTime,
    avgTime: deleteTime / testUsers.length,
    opsPerSecond: (testUsers.length / deleteTime) * 1000,
  })

  // 测试 5: 复杂查询性能
  console.log('Running complex query performance test...')
  const complexStart = performance.now()

  for (let i = 0; i < 100; i++) {
    await prisma.user.findMany({
      where: {
        AND: [
          {
            OR: [{ email: { contains: 'example' } }, { name: { contains: 'User' } }],
          },
          {
            createdAt: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
            },
          },
        ],
      },
      include: {
        // 如果有关联关系，可以在这里添加
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 20,
    })
  }

  const complexEnd = performance.now()
  const complexTime = complexEnd - complexStart

  results.tests.push({
    name: 'Complex Query Performance',
    operations: 100,
    totalTime: complexTime,
    avgTime: complexTime / 100,
    opsPerSecond: (100 / complexTime) * 1000,
  })

  // 计算总体统计
  results.summary = {
    totalTests: results.tests.length,
    avgOpsPerSecond:
      results.tests.reduce((sum, test) => sum + test.opsPerSecond, 0) / results.tests.length,
    fastestTest: results.tests.reduce((fastest, test) =>
      test.avgTime < fastest.avgTime ? test : fastest
    ),
    slowestTest: results.tests.reduce((slowest, test) =>
      test.avgTime > slowest.avgTime ? test : slowest
    ),
  }

  // 输出结果
  console.log('\n=== Database Performance Benchmark Results ===')
  console.log(`Timestamp: ${results.timestamp}`)
  console.log('\nTest Results:')
  results.tests.forEach((test) => {
    console.log(`\n${test.name}:`)
    console.log(`  Operations: ${test.operations}`)
    console.log(`  Total Time: ${test.totalTime.toFixed(2)}ms`)
    console.log(`  Average Time: ${test.avgTime.toFixed(2)}ms`)
    console.log(`  Operations/Second: ${test.opsPerSecond.toFixed(2)}`)
  })

  console.log('\nSummary:')
  console.log(`  Average Ops/Second: ${results.summary.avgOpsPerSecond.toFixed(2)}`)
  console.log(
    `  Fastest Test: ${results.summary.fastestTest.name} (${results.summary.fastestTest.avgTime.toFixed(2)}ms avg)`
  )
  console.log(
    `  Slowest Test: ${results.summary.slowestTest.name} (${results.summary.slowestTest.avgTime.toFixed(2)}ms avg)`
  )

  // 保存结果到文件
  const fs = require('fs')
  fs.writeFileSync('db-benchmark-results.json', JSON.stringify(results, null, 2))
  console.log('\nResults saved to db-benchmark-results.json')

  await prisma.$disconnect()
}

benchmarkDatabase().catch(console.error)
