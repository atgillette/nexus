import { createClient } from '@supabase/supabase-js'
import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'

dotenv.config({ path: '../../.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const prisma = new PrismaClient()

async function diagnoseAuth() {
  console.log('🔍 Diagnosing authentication issue...\n')
  
  try {
    // Test login with admin user
    const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'admin@braintrust.dev',
      password: 'admin123!'
    })
    
    if (signInError) {
      console.error('❌ Auth sign-in failed:', signInError.message)
      return
    }
    
    if (!authData.user) {
      console.error('❌ No user data returned from auth')
      return
    }
    
    const authUserId = authData.user.id
    const authEmail = authData.user.email
    
    console.log(`✅ Auth Login Successful:`)
    console.log(`   Email: ${authEmail}`)
    console.log(`   Auth User ID: ${authUserId}`)
    console.log(`   Email Confirmed: ${authData.user.email_confirmed_at ? 'Yes' : 'No'}`)
    
    // Check if user exists in database
    console.log(`\n🔍 Checking database for user...`)
    
    const dbUserById = await prisma.user.findUnique({
      where: { id: authUserId }
    })
    
    const dbUserByEmail = await prisma.user.findUnique({
      where: { email: authEmail! }
    })
    
    console.log(`Database user by ID (${authUserId}):`, dbUserById ? {
      id: dbUserById.id,
      email: dbUserById.email,
      role: dbUserById.role,
      firstName: dbUserById.firstName,
      lastName: dbUserById.lastName
    } : 'Not found')
    
    console.log(`Database user by email (${authEmail}):`, dbUserByEmail ? {
      id: dbUserByEmail.id,
      email: dbUserByEmail.email,
      role: dbUserByEmail.role,
      firstName: dbUserByEmail.firstName,
      lastName: dbUserByEmail.lastName
    } : 'Not found')
    
    // Show what the middleware is checking
    console.log(`\n🔍 Middleware Check Simulation:`)
    console.log(`Looking for user with ID: ${authUserId}`)
    
    const middlewareQuery = await prisma.user.findUnique({
      where: { id: authUserId },
      select: { role: true }
    })
    
    console.log(`Middleware would find:`, middlewareQuery)
    
    if (middlewareQuery) {
      const isAuthorized = middlewareQuery.role === 'admin' || middlewareQuery.role === 'se'
      console.log(`✅ Role check: ${middlewareQuery.role} -> ${isAuthorized ? 'AUTHORIZED' : 'UNAUTHORIZED'}`)
    } else {
      console.log(`❌ Middleware would NOT find user -> UNAUTHORIZED`)
    }
    
    // List all users in database
    console.log(`\n📋 All users in database:`)
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true
      }
    })
    
    allUsers.forEach(user => {
      console.log(`   - ${user.email} (${user.role}) - ID: ${user.id}`)
    })
    
    await supabase.auth.signOut()
    
  } catch (error) {
    console.error('❌ Diagnostic error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

diagnoseAuth().catch(console.error)