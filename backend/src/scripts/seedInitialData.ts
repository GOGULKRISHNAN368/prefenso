import bcrypt from 'bcrypt';
import { connectDatabase, closeDatabase } from '../config/database';
import { env } from '../config/env';
import { User } from '../modules/users/user.model';
import { Block } from '../modules/blocks/block.model';

async function seed() {
  await connectDatabase();
  let admin = await User.findOne({ username: env.INITIAL_ADMIN_USERNAME.toLowerCase(), role: 'ADMIN' });
  if (!admin) {
    admin = await User.create({ name: env.INITIAL_ADMIN_NAME, username: env.INITIAL_ADMIN_USERNAME.toLowerCase(), passwordHash: await bcrypt.hash(env.INITIAL_ADMIN_PASSWORD, env.BCRYPT_ROUNDS), role: 'ADMIN', blockId: null, isActive: true });
    console.log(`Created initial admin: ${admin.username}`);
  } else console.log(`Initial admin already exists: ${admin.username}`);
  for (let index = 1; index <= 6; index += 1) {
    const block = await Block.findOneAndUpdate({ code: `BLOCK-${index}` }, { $setOnInsert: { name: `Block ${index}`, code: `BLOCK-${index}`, displayOrder: index, isActive: true, credentialsConfigured: false, createdBy: admin._id } }, { upsert: true, new: true });
    console.log(`Ensured ${block.name}`);
  }
  await closeDatabase();
}
seed().catch(async (error) => { console.error(error); await closeDatabase(); process.exit(1); });
