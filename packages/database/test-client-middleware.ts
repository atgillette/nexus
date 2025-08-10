import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '../../apps/client/.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

async function testClientMiddleware() {
  console.log('🔍 Testing client middleware logic for john.doe@acmecorp.com...\n')
  
  try {
    // Step 1: Sign in to get user
    const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'john.doe@acmecorp.com',
      password: 'client123!'
    })
    
    if (signInError || !authData.user) {
      console.error('❌ Auth failed:', signInError?.message)
      return
    }
    
    const userId = authData.user.id
    console.log(`✅ Auth successful - User ID: ${userId}`)
    
    // Step 2: This is exactly what the middleware does
    console.log('\n🔍 Testing middleware database query...')
    
    const { data: userData, error: dbError } = await supabase
      .from("users")
      .select("role, companyId")
      .eq("id", userId)
      .single()
    
    console.log('Database query result:')
    console.log('  Data:', userData)
    console.log('  Error:', dbError)
    
    if (dbError) {
      console.log('\n❌ Middleware would REDIRECT to /auth/unauthorized')
      console.log('   Reason: Database query failed')
      console.log('   Error:', dbError.message)
    } else if (!userData) {
      console.log('\n❌ Middleware would REDIRECT to /auth/unauthorized') 
      console.log('   Reason: No user data returned')
    } else if (userData.role !== "client") {
      console.log('\n❌ Middleware would REDIRECT to /auth/unauthorized')
      console.log(`   Reason: Wrong role - expected 'client', got '${userData.role}'`)
    } else if (!userData.companyId) {
      console.log('\n❌ Middleware would REDIRECT to /auth/unauthorized')
      console.log('   Reason: No companyId associated with user')
    } else {
      console.log('\n✅ Middleware would ALLOW access')
      console.log(`   User role: ${userData.role}`)
      console.log(`   Company ID: ${userData.companyId}`)
    }
    
    // Let's also check what's in the database by email
    console.log('\n🔍 Checking database by email...')
    const { data: emailData } = await supabase
      .from("users")
      .select("*")
      .eq("email", "john.doe@acmecorp.com")
    
    console.log('Users with matching email:', emailData)
    
    await supabase.auth.signOut()
    
  } catch (error) {
    console.error('❌ Test error:', error)
  }
}

testClientMiddleware().catch(console.error)