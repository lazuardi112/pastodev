import bcrypt from 'bcryptjs';
(async () => {
  const pw = 'ardigg12';
  const hash = await bcrypt.hash(pw, 10);
  console.log('Hash length:', hash.length);
  console.log('Hash:', hash);
})();
