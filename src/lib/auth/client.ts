'use client';

import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  onAuthStateChanged, 
  User as FirebaseUser, 
  getIdTokenResult 
} from "firebase/auth";
import { auth } from "../../firebase/firebaseConfig";

import type { User } from '@/types/user';

export interface SignUpParams {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface SignInWithPasswordParams {
  email: string;
  password: string;
}

export interface ResetPasswordParams {
  email: string;
}

class AuthClient {
  async signUp(params: SignUpParams): Promise<{ error?: string }> {
    try {
      const { email, password } = params;
      await createUserWithEmailAndPassword(auth, email, password);
      return {};
    } catch (error: any) {
      return { error: error.message };
    }
  }

  async signInWithPassword(params: SignInWithPasswordParams): Promise<{ error?: string }> {
    try {
      const { email, password } = params;
      await signInWithEmailAndPassword(auth, email, password);
      return {};
    } catch (error: any) {
      return { error: error.message };
    }
  }

  async getUser(): Promise<{ data?: User | null; error?: string }> {
    return new Promise((resolve) => {
      onAuthStateChanged(auth, async (firebaseUser) => {
        if (!firebaseUser) {
          resolve({ data: null });
          return;
        }

        // Verifica se é admin via custom claims
        const tokenResult = await getIdTokenResult(firebaseUser);
        const isAdmin = !!tokenResult.claims.admin;

        if (!isAdmin) {
          await this.signOut();
          resolve({ data: null, error: "Acesso restrito a administradores" });
          return;
        }

        const user: User = {
          id: firebaseUser.uid,
          avatar: firebaseUser.photoURL || "/assets/avatar.png",
          firstName: firebaseUser.displayName?.split(" ")[0] || "",
          lastName: firebaseUser.displayName?.split(" ")[1] || "",
          email: firebaseUser.email || "",
        };

        resolve({ data: user });
      });
    });
  }

  async resetPassword(params: ResetPasswordParams): Promise<{ error?: string }> {
    // pode implementar com sendPasswordResetEmail(auth, params.email)
    return { error: "Password reset not implemented" };
  }

  async signOut(): Promise<{ error?: string }> {
    try {
      await firebaseSignOut(auth);
      return {};
    } catch (error: any) {
      return { error: error.message };
    }
  }
}

export const authClient = new AuthClient();