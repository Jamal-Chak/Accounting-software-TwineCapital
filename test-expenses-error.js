// Test script to verify error handling fix
console.log('Testing error handling...')

// Simulate the error object from Supabase
const mockError = {
  code: 'PGRST205',
  details: null,
  hint: "Perhaps you meant the table 'public.companies'",
  message: "Could not find the table 'public.expenses' in the schema cache"
}

// Test the new error handling logic
function testErrorHandling(error) {
  const message = error.message || JSON.stringify(error) || error
  console.log('Error handling result:', message)
}

console.log('Before fix - would show: {}')
console.log('After fix - shows:')
testErrorHandling(mockError)

// Test with different error formats
testErrorHandling({ message: 'Simple error message' })
testErrorHandling('String error')
testErrorHandling(null)
