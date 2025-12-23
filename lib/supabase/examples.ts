/**
 * Supabase Usage Examples
 *
 * This file demonstrates common Supabase operations.
 * Copy and adapt these examples to your needs.
 */

import { getSupabaseBrowserClient } from './client';
import { getSupabaseServerClient } from './server';

// ============================================
// TYPES
// ============================================

export type User = {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
};

export type Todo = {
  id: string;
  user_id: string;
  task: string;
  is_complete: boolean;
  created_at: string;
};

// ============================================
// AUTHENTICATION EXAMPLES
// ============================================

/**
 * Sign up a new user
 */
export async function signUp(email: string, password: string) {
  const supabase = getSupabaseBrowserClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    console.error('Sign up error:', error.message);
    return { error: error.message };
  }

  return { data };
}

/**
 * Sign in a user
 */
export async function signIn(email: string, password: string) {
  const supabase = getSupabaseBrowserClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error('Sign in error:', error.message);
    return { error: error.message };
  }

  return { data };
}

/**
 * Sign out the current user
 */
export async function signOut() {
  const supabase = getSupabaseBrowserClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error('Sign out error:', error.message);
    return { error: error.message };
  }

  return { success: true };
}

/**
 * Get the current user (Client Component)
 */
export async function getCurrentUser() {
  const supabase = getSupabaseBrowserClient();

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error) {
    console.error('Get user error:', error.message);
    return { error: error.message };
  }

  return { user };
}

/**
 * Get the current user (Server Component)
 */
export async function getCurrentUserServer() {
  const supabase = await getSupabaseServerClient();

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error) {
    console.error('Get user error:', error.message);
    return { error: error.message };
  }

  return { user };
}

// ============================================
// DATABASE EXAMPLES
// ============================================

/**
 * Fetch all rows from a table
 */
export async function getTodos() {
  const supabase = getSupabaseBrowserClient();

  const { data, error } = await supabase
    .from('todos')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Fetch error:', error.message);
    return { error: error.message };
  }

  return { data };
}

/**
 * Fetch a single row by ID
 */
export async function getTodoById(id: string) {
  const supabase = getSupabaseBrowserClient();

  const { data, error } = await supabase
    .from('todos')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Fetch error:', error.message);
    return { error: error.message };
  }

  return { data };
}

/**
 * Fetch with filters
 */
export async function getTodosByUserId(userId: string) {
  const supabase = getSupabaseBrowserClient();

  const { data, error } = await supabase
    .from('todos')
    .select('*')
    .eq('user_id', userId)
    .eq('is_complete', false);

  if (error) {
    console.error('Fetch error:', error.message);
    return { error: error.message };
  }

  return { data };
}

/**
 * Insert a new row
 */
export async function createTodo(userId: string, task: string) {
  const supabase = getSupabaseBrowserClient();

  const { data, error } = await supabase
    .from('todos')
    .insert({
      user_id: userId,
      task,
      is_complete: false,
    })
    .select()
    .single();

  if (error) {
    console.error('Insert error:', error.message);
    return { error: error.message };
  }

  return { data };
}

/**
 * Update a row
 */
export async function updateTodo(id: string, updates: Partial<Todo>) {
  const supabase = getSupabaseBrowserClient();

  const { data, error } = await supabase
    .from('todos')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Update error:', error.message);
    return { error: error.message };
  }

  return { data };
}

/**
 * Delete a row
 */
export async function deleteTodo(id: string) {
  const supabase = getSupabaseBrowserClient();

  const { error } = await supabase
    .from('todos')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Delete error:', error.message);
    return { error: error.message };
  }

  return { success: true };
}

// ============================================
// REALTIME EXAMPLES
// ============================================

/**
 * Subscribe to realtime changes
 */
export function subscribeToTodos(callback: (payload: any) => void) {
  const supabase = getSupabaseBrowserClient();

  const channel = supabase
    .channel('todos-channel')
    .on(
      'postgres_changes',
      {
        event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
        schema: 'public',
        table: 'todos',
      },
      callback
    )
    .subscribe();

  // Return unsubscribe function
  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Subscribe to changes for a specific row
 */
export function subscribeToTodo(todoId: string, callback: (payload: any) => void) {
  const supabase = getSupabaseBrowserClient();

  const channel = supabase
    .channel(`todo-${todoId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'todos',
        filter: `id=eq.${todoId}`,
      },
      callback
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

// ============================================
// STORAGE EXAMPLES
// ============================================

/**
 * Upload a file to Supabase Storage
 */
export async function uploadFile(bucket: string, path: string, file: File) {
  const supabase = getSupabaseBrowserClient();

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file);

  if (error) {
    console.error('Upload error:', error.message);
    return { error: error.message };
  }

  return { data };
}

/**
 * Get a public URL for a file
 */
export function getPublicUrl(bucket: string, path: string) {
  const supabase = getSupabaseBrowserClient();

  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);

  return data.publicUrl;
}

/**
 * Delete a file from Storage
 */
export async function deleteFile(bucket: string, path: string) {
  const supabase = getSupabaseBrowserClient();

  const { error } = await supabase.storage
    .from(bucket)
    .remove([path]);

  if (error) {
    console.error('Delete error:', error.message);
    return { error: error.message };
  }

  return { success: true };
}

// ============================================
// ROW LEVEL SECURITY (RLS) EXAMPLES
// ============================================

/**
 * Query using RLS policies - the user can only see their own data
 * This requires RLS policies to be set up in Supabase
 */
export async function getMyTodos() {
  const supabase = getSupabaseBrowserClient();

  // With RLS enabled, this automatically filters by the user's ID
  const { data, error } = await supabase
    .from('todos')
    .select('*');

  if (error) {
    console.error('Fetch error:', error.message);
    return { error: error.message };
  }

  return { data };
}
