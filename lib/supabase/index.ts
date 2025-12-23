/**
 * Supabase Client Exports
 *
 * This barrel export file provides a convenient way to import
 * Supabase clients and utilities from a single location.
 */

// Client exports
export { getSupabaseBrowserClient } from './client';
export type { getSupabaseBrowserClient as GetSupabaseBrowserClient } from './client';

// Server exports
export { getSupabaseServerClient } from './server';
export type { getSupabaseServerClient as GetSupabaseServerClient } from './server';

// Middleware exports
export { updateSession } from './middleware';

// Example exports
export {
  // Auth examples
  signUp,
  signIn,
  signOut,
  getCurrentUser,
  getCurrentUserServer,
  // Database examples
  getTodos,
  getTodoById,
  getTodosByUserId,
  createTodo,
  updateTodo,
  deleteTodo,
  // Realtime examples
  subscribeToTodos,
  subscribeToTodo,
  // Storage examples
  uploadFile,
  getPublicUrl,
  deleteFile,
  getMyTodos,
} from './examples';

export type { User, Todo } from './examples';
