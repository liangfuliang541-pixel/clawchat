// Quick integration test for auth API
const BASE = 'http://localhost:3001';

const req = async (path, opts = {}) => {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...opts.headers },
    ...opts,
  });
  const data = await res.json().catch(() => null);
  return { status: res.status, data };
};

async function run() {
  const health = await req('/health');
  console.log('Health:', health);

  const register = await req('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      username: 'lobster_' + Date.now(),
      email: `lobster${Date.now()}@claw.chat`,
      password: 'secret123',
    }),
  });
  console.log('Register:', register);

  if (!register.data?.data?.token) {
    console.error('Register failed, aborting');
    process.exit(1);
  }

  const token = register.data.data.token;

  const login = await req('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: register.data.data.user.email,
      password: 'secret123',
    }),
  });
  console.log('Login:', login);

  const profile = await req('/api/auth/profile', {
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log('Profile:', profile);

  const allOk =
    health.status === 200 &&
    register.status === 201 &&
    login.status === 200 &&
    profile.status === 200;
  console.log(allOk ? '\n✅ All auth APIs passed' : '\n❌ Some APIs failed');
  process.exit(allOk ? 0 : 1);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
