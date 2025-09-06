import { signOut } from 'firebase/auth';
import { auth } from '../utils/firebase';

export const logout = async () => {
  await signOut(auth);
};
