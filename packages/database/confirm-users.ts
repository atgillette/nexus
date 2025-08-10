import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '../../.env.local' })

// Create admin client using service role key (if available)
// Note: For this to work, you need to set SUPABASE_SERVICE_ROLE_KEY in your .env.local
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

const testEmails = [
  'admin@braintrust.dev',
  'se@braintrust.dev', 
  'john.doe@acmecorp.com',
  'jane.smith@techflow.io'
]

async function confirmUsers() {
  console.log('Confirming user email addresses...\n')
  
  for (const email of testEmails) {
    try {
      // Get the user by email
      const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers()
      
      if (listError) {
        console.error(`❌ Error listing users: ${listError.message}`)
        continue
      }
      
      const user = users.users.find(u => u.email === email)
      
      if (!user) {
        console.log(`⚠️  User not found: ${email}`)
        continue
      }
      
      if (user.email_confirmed_at) {
        console.log(`✅ Already confirmed: ${email}`)
        continue
      }
      
      // Confirm the user's email
      const { error: confirmError } = await supabaseAdmin.auth.admin.updateUserById(
        user.id,
        { email_confirm: true }
      )
      
      if (confirmError) {
        console.error(`❌ Failed to confirm ${email}: ${confirmError.message}`)
      } else {
        console.log(`✅ Confirmed: ${email}`)
      }
      
    } catch (err) {
      console.error(`❌ Error confirming ${email}:`, err)
    }
  }
  
  console.log('\n✅ User confirmation complete!')
}

confirmUsers().catch(console.error)