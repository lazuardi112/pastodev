import bcrypt from 'bcryptjs';
(async()=>{
  const hash = await bcrypt.hash('ardigg12', 10);
  console.log(hash);
})();
