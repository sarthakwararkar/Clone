import { SignJWT } from 'jose';

const emails = [
  'testuser@example.com',
  'tejas123@gmail.com',
  'test@example.com',
  'sarthak@gmail.com',
  'yogeshpimpalkar96@gmail.com',
  'sarthakwararkar2@gmail.com',
  'rameshwararkar9@gmail.com',
  'beastultra59@gmail.com'
];

async function testEmail(email) {
  const secret = new TextEncoder().encode('my-super-secret-local-firebase-token-key-123456');
  const token = await new SignJWT({
    sub: 'test-uid-123',
    email: email,
    firebase: {
      sign_in_provider: 'password'
    }
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('2h')
    .sign(secret);

  const url = 'https://coupondunia-backend.sarthakwararkar2.workers.dev/api/admin/stats';
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  console.log(`Email: ${email.padEnd(30)} => Status: ${res.status}`);
}

async function main() {
  for (const email of emails) {
    await testEmail(email);
  }
}

main().catch(console.error);
