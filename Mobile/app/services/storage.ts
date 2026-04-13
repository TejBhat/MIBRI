import AsyncStorage from "@react-native-async-storage/async-storage";
import type { User, Resume, Interview, AppState } from "../types";

const STORAGE_KEYS = {
  USER: "@mibri/user",
  RESUME: "@mibri/resume",
  CURRENT_INTERVIEW: "@mibri/current_interview",
  EMAIL: "@mibri/user_email",
  FULL_NAME: "@mibri/full_name",
};

class StorageService {
  /**
   * Save user data
   */
  async saveUser(user: User): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } catch (error) {
      console.error("Save user error:", error);
    }
  }

  /**
   * Get saved user data
   */
  async getUser(): Promise<User | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.USER);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("Get user error:", error);
      return null;
    }
  }

  /**
   * Save resume data
   */
  async saveResume(resume: Resume): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.RESUME, JSON.stringify(resume));
    } catch (error) {
      console.error("Save resume error:", error);
    }
  }

  /**
   * Get saved resume data
   */
  async getResume(): Promise<Resume | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.RESUME);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("Get resume error:", error);
      return null;
    }
  }

  /**
   * Save current interview
   */
  async saveCurrentInterview(interview: Interview): Promise<void> {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.CURRENT_INTERVIEW,
        JSON.stringify(interview)
      );
    } catch (error) {
      console.error("Save interview error:", error);
    }
  }

  /**
   * Get current interview
   */
  async getCurrentInterview(): Promise<Interview | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_INTERVIEW);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("Get interview error:", error);
      return null;
    }
  }

  /**
   * Save email
   */
  async saveEmail(email: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.EMAIL, email);
    } catch (error) {
      console.error("Save email error:", error);
    }
  }

  /**
   * Get saved email
   */
  async getEmail(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.EMAIL);
    } catch (error) {
      console.error("Get email error:", error);
      return null;
    }
  }

  /**
   * Save full name
   */
  async saveFullName(fullName: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.FULL_NAME, fullName);
    } catch (error) {
      console.error("Save name error:", error);
    }
  }

  /**
   * Get saved full name
   */
  async getFullName(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.FULL_NAME);
    } catch (error) {
      console.error("Get name error:", error);
      return null;
    }
  }

  /**
   * Clear all data
   */
  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
    } catch (error) {
      console.error("Clear all error:", error);
    }
  }

  /**
   * Clear specific data
   */
  async clear(key: keyof typeof STORAGE_KEYS): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS[key]);
    } catch (error) {
      console.error(`Clear ${key} error:`, error);
    }
  }
}

export const storageService = new StorageService();