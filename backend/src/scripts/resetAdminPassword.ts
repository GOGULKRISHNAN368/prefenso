import bcrypt from 'bcrypt';
import { connectDatabase, closeDatabase } from '../config/database';
import { env } from '../config/env';
import { User } from '../modules/users/user.model';
import { Session } from '../modules/sessions/session.model';

async function resetAdminPassword() {
  await connectDatabase();
  if (env.INITIAL_ADMIN_PASSWORD === 'REPLACE_BEFORE_RUNNING_SEED') throw new Error('Set INITIAL_ADMIN_PASSWORD before resetting the admin password');
  const user = await User.findOne({ username: env.INITIAL_ADMIN_USERNAME.toLowerCase(), role: 'ADMIN' }).select('+passwordHash');
  if (!user) throw new Error('Initial admin does not exist; run npm run seed:initial first');
  user.passwordHash = await bcrypt.hash(env.INITIAL_ADMIN_PASSWORD, env.BCRYPT_ROUNDS);
  user.authVersion += 1;
  await user.save();
  await Session.updateMany({ userId: user._id, revokedAt: null }, { revokedAt: new Date() });
  console.log(`Reset admin password for ${user.username}`);
  await closeDatabase();
}

resetAdminPassword().catch(async (error) => { console.error(error); await closeDatabase(); process.exit(1); });
