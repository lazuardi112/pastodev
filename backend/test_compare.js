import bcrypt from 'bcryptjs';

(async () => {
  const hash = '$2a$10$K0P9EEXpPSY2EBL6C9L7WOGVsFkZqcHWbqjBAqLmEg7xM9F5LxKMO';
  const ok = await bcrypt.compare('ardigg12', hash);
  console.log('compare result:', ok);
})();
