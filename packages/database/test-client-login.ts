import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '../../apps/client/.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

async function testClientLogin() {
  console.log('🔍 Testing client login for john.doe@acmecorp.com...\n')
  
  try {
    // Step 1: Try to sign in
    const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'john.doe@acmecorp.com',
      password: 'client123!'
    })
    
    if (signInError) {
      console.error('❌ Auth sign-in failed:', signInError.message)
      return
    }
    
    console.log('✅ Auth sign-in successful')
    console.log(`   User ID: ${authData.user?.id}`)
    console.log(`   Email: ${authData.user?.email}`)
    console.log(`   Email Confirmed: ${authData.user?.email_confirmed_at ? 'Yes' : 'No'}`)
    
    // Step 2: Try to query user data (this is what's failing)
    console.log('\n🔍 Testing database query...')
    
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("role, companyId")
      .eq("email", 'john.doe@acmecorp.com')
      .single()
    
    if (userError) {
      console.error('❌ Database query failed:', userError.message)
      console.error('   Error code:', userError.code)
      console.error('   Error details:', userError.details)
      console.error('   Error hint:', userError.hint)
    } else {
      console.log('✅ Database query successful')
      console.log('   User data:', userData)
    }
    
    // Step 3: Try querying by ID instead
    console.log('\n🔍 Testing query by auth user ID...')
    
    const { data: userByIdData, error: userByIdError } = await supabase
      .from("users")
      .select("role, companyId")
      .eq("id", authData.user?.id)
      .single()
    
    if (userByIdError) {
      console.error('❌ Query by ID failed:', userByIdError.message)
    } else {
      console.log('✅ Query by ID successful')
      console.log('   User data:', userByIdData)
    }
    
    await supabase.auth.signOut()
    
  } catch (error) {
    console.error('❌ Test error:', error)
  }
}

testClientLogin().catch(console.error)