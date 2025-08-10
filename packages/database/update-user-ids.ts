import { createClient } from '@supabase/supabase-js'
import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'

dotenv.config({ path: '../../apps/admin/.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const prisma = new PrismaClient()

const testUsers = [
  {
    email: 'admin@braintrust.dev',
    password: 'admin123!'
  },
  {
    email: 'se@braintrust.dev', 
    password: 'se123!'
  },
  {
    email: 'john.doe@acmecorp.com',
    password: 'client123!'
  },
  {
    email: 'jane.smith@techflow.io',
    password: 'client123!'
  }
]

async function updateUserIds() {
  console.log('🔄 Updating database user IDs to match Auth user IDs...\n')
  
  for (const user of testUsers) {
    try {
      // Sign in to get the auth user ID
      const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: user.password
      })
      
      if (signInError || !authData.user) {
        console.error(`❌ Failed to get auth ID for ${user.email}`)
        continue
      }
      
      const authUserId = authData.user.id
      console.log(`🔍 ${user.email} -> Auth ID: ${authUserId}`)
      
      // Update the database user ID
      try {
        const updatedUser = await prisma.user.update({
          where: { email: user.email },
          data: { id: authUserId }
        })
        
        console.log(`✅ Updated database record for ${user.email}`)
      } catch (dbError: any) {
        if (dbError.code === 'P2025') {
          console.error(`❌ Database user not found for ${user.email}`)
        } else {
          console.error(`❌ Database error for ${user.email}:`, dbError.message)
        }
      }
      
      await supabase.auth.signOut()
      
    } catch (err) {
      console.error(`❌ Error processing ${user.email}:`, err)
    }
  }
  
  console.log('\n✅ User ID sync complete!')
  
  // Show final state
  console.log('\n📋 Final database users:')
  try {
    const allUsers = await prisma.user.findMany({
      select: { id: true, email: true, role: true }
    })
    
    allUsers.forEach(user => {
      console.log(`   - ${user.email} (${user.role}) -> ${user.id}`)
    })
  } catch (err) {
    console.error('❌ Could not fetch final user list:', err)
  }
  
  await prisma.$disconnect()
}

updateUserIds().catch(console.error)