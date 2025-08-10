import { createClient } from '@supabase/supabase-js'
import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'

// Load environment variables  
dotenv.config({ path: '../../.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const prisma = new PrismaClient()

const testCredentials = [
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

async function syncAuthWithDatabase() {
  console.log('Syncing Supabase Auth users with database...\n')
  
  for (const cred of testCredentials) {
    try {
      // Sign in to get the auth user
      const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
        email: cred.email,
        password: cred.password
      })
      
      if (signInError) {
        console.error(`❌ Failed to sign in ${cred.email}: ${signInError.message}`)
        continue
      }
      
      if (!authData.user) {
        console.error(`❌ No user data for ${cred.email}`)
        continue
      }
      
      const authUserId = authData.user.id
      console.log(`🔍 Auth user ID for ${cred.email}: ${authUserId}`)
      
      // Find the database user by email
      const dbUser = await prisma.user.findUnique({
        where: { email: cred.email }
      })
      
      if (!dbUser) {
        console.error(`❌ Database user not found for ${cred.email}`)
        continue
      }
      
      // Update the database user ID to match the auth user ID
      if (dbUser.id !== authUserId) {
        await prisma.user.update({
          where: { email: cred.email },
          data: { id: authUserId }
        })
        console.log(`✅ Updated database user ID for ${cred.email}`)
      } else {
        console.log(`✅ User ID already synced for ${cred.email}`)
      }
      
      // Sign out
      await supabase.auth.signOut()
      
    } catch (err) {
      console.error(`❌ Error syncing ${cred.email}:`, err)
    }
  }
  
  console.log('\n✅ Sync complete!')
  await prisma.$disconnect()
}

syncAuthWithDatabase().catch(console.error)