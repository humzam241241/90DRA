import { supabase } from './supabaseClient';

// Map PascalCase entity names to snake_case table names
const tableMap = {
  Workout: 'workouts',
  NutritionLog: 'nutrition_logs',
  ProgressEntry: 'progress_entries',
  CommunityPost: 'community_posts',
  MindsetLesson: 'mindset_lessons',
  Journal: 'journals',
  HabitLog: 'habit_logs',
  Habit: 'habits',
  DopamineDaily: 'dopamine_daily',
  SwapMap: 'swap_maps',
};

function parseSortField(field) {
  if (!field) return null;
  const desc = field.startsWith('-');
  let column = desc ? field.slice(1) : field;
  if (column === 'created_date') column = 'created_at';
  return { column, ascending: !desc };
}

function addCompat(record) {
  if (record && record.created_at && !record.created_date) {
    record.created_date = record.created_at;
  }
  return record;
}

function createEntityProxy(tableName) {
  return {
    async list(sortField) {
      const sort = parseSortField(sortField);
      let query = supabase.from(tableName).select('*');
      if (sort) query = query.order(sort.column, { ascending: sort.ascending });
      const { data, error } = await query;
      if (error) throw error;
      return (data || []).map(addCompat);
    },

    async filter(conditions, sortField, limit) {
      let query = supabase.from(tableName).select('*');

      for (const [key, value] of Object.entries(conditions || {})) {
        if (key === 'created_by') {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) query = query.eq('user_id', user.id);
        } else {
          query = query.eq(key, value);
        }
      }

      const sort = parseSortField(sortField);
      if (sort) query = query.order(sort.column, { ascending: sort.ascending });
      if (limit) query = query.limit(limit);

      const { data, error } = await query;
      if (error) throw error;
      return (data || []).map(addCompat);
    },

    async create(record) {
      const { data: { user } } = await supabase.auth.getUser();
      const row = { ...record };
      delete row.created_by;
      if (user) row.user_id = user.id;
      const { data, error } = await supabase.from(tableName).insert(row).select().single();
      if (error) throw error;
      return addCompat(data);
    },

    async update(id, updates) {
      const clean = { ...updates };
      delete clean.created_by;
      const { data, error } = await supabase.from(tableName).update(clean).eq('id', id).select().single();
      if (error) throw error;
      return addCompat(data);
    },

    async delete(id) {
      const { error } = await supabase.from(tableName).delete().eq('id', id);
      if (error) throw error;
    },
  };
}

const auth = {
  async me() {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw { status: 401, message: 'Not authenticated' };

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    return {
      id: user.id,
      email: user.email,
      full_name: profile?.full_name || user.user_metadata?.full_name || '',
      role: profile?.role || 'user',
      ...(profile || {}),
    };
  },

  async updateMe(updates) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw { status: 401, message: 'Not authenticated' };

    const { data, error } = await supabase
      .from('profiles')
      .upsert({ id: user.id, ...updates }, { onConflict: 'id' })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  logout(redirectUrl) {
    supabase.auth.signOut();
    if (redirectUrl) {
      window.location.href = '/login';
    }
  },

  redirectToLogin() {
    window.location.href = '/login';
  },
};

const entities = new Proxy({}, {
  get(_target, prop) {
    const tableName = tableMap[prop];
    if (!tableName) {
      console.warn(`Unknown entity: ${prop}, using lowercase`);
      return createEntityProxy(prop.toLowerCase());
    }
    return createEntityProxy(tableName);
  },
});

const integrations = {
  Core: {
    async InvokeLLM({ prompt, response_json_schema }) {
      // Call Supabase Edge Function to keep API keys server-side
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Must be logged in to use AI features');

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const response = await fetch(`${supabaseUrl}/functions/v1/invoke-llm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ prompt, response_json_schema }),
      });

      if (!response.ok) {
        const err = await response.text();
        throw new Error(`AI request failed: ${err}`);
      }

      return await response.json();
    },
    async SendEmail() { console.warn('SendEmail not implemented'); },
    async SendSMS() { console.warn('SendSMS not implemented'); },
    async UploadFile() { console.warn('UploadFile not implemented'); },
    async GenerateImage() { console.warn('GenerateImage not implemented'); },
    async ExtractDataFromUploadedFile() { console.warn('ExtractDataFromUploadedFile not implemented'); },
  },
};

export const base44 = { auth, entities, integrations };
