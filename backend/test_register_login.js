import axios from 'axios';

async function test() {
  const email = `test_${Date.now()}@example.com`;
  const password = 'password123';
  const name = 'Test User';

  try {
    console.log('--- Testing Register ---');
    const regRes = await axios.post('http://localhost:5000/api/auth/register', {
      name, email, password
    });
    console.log('Register Success:', regRes.data.success);
    console.log('Token received:', !!regRes.data.data.token);

    console.log('\n--- Testing Login ---');
    const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
      email, password
    });
    console.log('Login Success:', loginRes.data.success);
    console.log('Login Role:', loginRes.data.data.role);
    console.log('Login Token:', !!loginRes.data.data.token);

    process.exit(0);
  } catch (err) {
    console.error('Test failed:', err.response?.data || err.message);
    process.exit(1);
  }
}

test();
