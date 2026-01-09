// Test script to verify expenses fix
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testExpensesSetup() {
  console.log('🔍 Testing expenses setup...\n')

  try {
    // Test 1: Check if expenses table exists
    console.log('1. Checking if expenses table exists...')
    const { data: tableTest, error: tableError } = await supabase
      .from('expenses')
      .select('*')
      .limit(1)

    if (tableError) {
      console.error('❌ Expenses table does not exist or is not accessible')
      console.error('Error:', tableError.message)
      console.log('\n💡 Solution: Run the SQL schema from supabase_setup.sql')
      console.log('   You can do this in your Supabase dashboard SQL editor')
      return false
    } else {
      console.log('✅ Expenses table exists and is accessible')
    }

    // Test 2: Test getExpenses function
    console.log('\n2. Testing getExpenses function...')
    const { data: expenses, error: expensesError } = await supabase
      .from('expenses')
      .select('*')
      .order('created_at', { ascending: false })

    if (expensesError) {
      console.error('❌ Error fetching expenses:', expensesError)
      return false
    } else {
      console.log(`✅ Successfully fetched ${expenses?.length || 0} expenses`)
      if (expenses && expenses.length > 0) {
        console.log('Sample expense:', expenses[0].description)
      }
    }

    // Test 3: Check table structure
    console.log('\n3. Checking expenses table structure...')
    const sampleExpense = expenses?.[0]
    if (sampleExpense) {
      const requiredFields = ['id', 'company_id', 'description', 'amount', 'category', 'date', 'vendor', 'tax_rate', 'tax_amount', 'total_amount', 'status']
      const missingFields = requiredFields.filter(field => !(field in sampleExpense))
      
      if (missingFields.length > 0) {
        console.log('❌ Missing fields:', missingFields)
      } else {
        console.log('✅ All required fields present')
      }
    }

    console.log('\n🎉 Expenses setup test completed successfully!')
    return true

  } catch (error) {
    console.error('❌ Unexpected error:', error)
    return false
  }
}

// Run the test
testExpensesSetup()
  .then(success => {
    if (!success) {
      console.log('\n⚠️  Fix needed: Please run the SQL schema to create the expenses table')
      process.exit(1)
    }
    process.exit(0)
  })
  .catch(error => {
    console.error('Test failed:', error)
    process.exit(1)
  })
