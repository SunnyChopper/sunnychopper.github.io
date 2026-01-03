import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface RequestContext {
  supabase: ReturnType<typeof createClient>;
  userId: string;
}

const getRequestContext = async (req: Request): Promise<RequestContext | null> => {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? ''
  );

  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    return null;
  }

  return { supabase, userId: user.id };
};

const handleTasksEndpoint = async (
  ctx: RequestContext,
  method: string,
  pathParts: string[],
  body: unknown
) => {
  const { supabase, userId } = ctx;

  if (method === 'GET' && pathParts.length === 0) {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data, total: data?.length || 0 };
  }

  if (method === 'GET' && pathParts.length === 1) {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', pathParts[0])
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('Task not found');
    return { data };
  }

  if (method === 'POST') {
    const { data, error } = await supabase
      .from('tasks')
      .insert({ ...body, user_id: userId })
      .select()
      .single();

    if (error) throw error;
    return { data };
  }

  if (method === 'PUT' && pathParts.length === 1) {
    const { data, error } = await supabase
      .from('tasks')
      .update(body)
      .eq('id', pathParts[0])
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return { data };
  }

  if (method === 'DELETE' && pathParts.length === 1) {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', pathParts[0])
      .eq('user_id', userId);

    if (error) throw error;
    return { data: null };
  }

  throw new Error('Invalid endpoint');
};

const handleHabitsEndpoint = async (
  ctx: RequestContext,
  method: string,
  pathParts: string[],
  body: unknown
) => {
  const { supabase, userId } = ctx;

  if (method === 'GET' && pathParts.length === 0) {
    const { data, error } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data, total: data?.length || 0 };
  }

  if (method === 'GET' && pathParts.length === 1) {
    const { data, error } = await supabase
      .from('habits')
      .select('*')
      .eq('id', pathParts[0])
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('Habit not found');
    return { data };
  }

  if (method === 'POST' && pathParts.length === 0) {
    const { data, error } = await supabase
      .from('habits')
      .insert({ ...body, user_id: userId })
      .select()
      .single();

    if (error) throw error;
    return { data };
  }

  if (method === 'POST' && pathParts.length === 2 && pathParts[1] === 'log') {
    const habitId = pathParts[0];
    const { notes } = body as { notes?: string };

    const { data: logData, error: logError } = await supabase
      .from('habit_logs')
      .insert({
        habit_id: habitId,
        user_id: userId,
        notes: notes || null,
      })
      .select()
      .single();

    if (logError) throw logError;

    const { data: habit } = await supabase
      .from('habits')
      .select('streak')
      .eq('id', habitId)
      .eq('user_id', userId)
      .single();

    await supabase
      .from('habits')
      .update({
        streak: (habit?.streak || 0) + 1,
        last_completed: new Date().toISOString(),
      })
      .eq('id', habitId)
      .eq('user_id', userId);

    return { data: logData };
  }

  if (method === 'PUT' && pathParts.length === 1) {
    const { data, error } = await supabase
      .from('habits')
      .update(body)
      .eq('id', pathParts[0])
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return { data };
  }

  if (method === 'DELETE' && pathParts.length === 1) {
    const { error } = await supabase
      .from('habits')
      .delete()
      .eq('id', pathParts[0])
      .eq('user_id', userId);

    if (error) throw error;
    return { data: null };
  }

  throw new Error('Invalid endpoint');
};

const handleMetricsEndpoint = async (
  ctx: RequestContext,
  method: string,
  pathParts: string[],
  body: unknown
) => {
  const { supabase, userId } = ctx;

  if (method === 'GET' && pathParts.length === 0) {
    const { data, error } = await supabase
      .from('metrics')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data, total: data?.length || 0 };
  }

  if (method === 'GET' && pathParts.length === 1) {
    const { data, error } = await supabase
      .from('metrics')
      .select('*')
      .eq('id', pathParts[0])
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('Metric not found');
    return { data };
  }

  if (method === 'POST') {
    const input = body as { currentValue: number };
    const { data, error } = await supabase
      .from('metrics')
      .insert({ ...body, user_id: userId })
      .select()
      .single();

    if (error) throw error;

    await supabase
      .from('metric_history')
      .insert({
        metric_id: data.id,
        value: input.currentValue,
      });

    return { data };
  }

  if (method === 'PUT' && pathParts.length === 1) {
    const input = body as { currentValue?: number };
    const { data, error } = await supabase
      .from('metrics')
      .update(body)
      .eq('id', pathParts[0])
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;

    if (input.currentValue !== undefined) {
      await supabase
        .from('metric_history')
        .insert({
          metric_id: pathParts[0],
          value: input.currentValue,
        });
    }

    return { data };
  }

  if (method === 'DELETE' && pathParts.length === 1) {
    const { error } = await supabase
      .from('metrics')
      .delete()
      .eq('id', pathParts[0])
      .eq('user_id', userId);

    if (error) throw error;
    return { data: null };
  }

  throw new Error('Invalid endpoint');
};

const handleGoalsEndpoint = async (
  ctx: RequestContext,
  method: string,
  pathParts: string[],
  body: unknown
) => {
  const { supabase, userId } = ctx;

  if (method === 'GET' && pathParts.length === 0) {
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data, total: data?.length || 0 };
  }

  if (method === 'GET' && pathParts.length === 1) {
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('id', pathParts[0])
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('Goal not found');
    return { data };
  }

  if (method === 'POST') {
    const { data, error } = await supabase
      .from('goals')
      .insert({ ...body, user_id: userId })
      .select()
      .single();

    if (error) throw error;
    return { data };
  }

  if (method === 'PUT' && pathParts.length === 1) {
    const { data, error } = await supabase
      .from('goals')
      .update(body)
      .eq('id', pathParts[0])
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return { data };
  }

  if (method === 'DELETE' && pathParts.length === 1) {
    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', pathParts[0])
      .eq('user_id', userId);

    if (error) throw error;
    return { data: null };
  }

  throw new Error('Invalid endpoint');
};

const handleProjectsEndpoint = async (
  ctx: RequestContext,
  method: string,
  pathParts: string[],
  body: unknown
) => {
  const { supabase, userId } = ctx;

  if (method === 'GET' && pathParts.length === 0) {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data, total: data?.length || 0 };
  }

  if (method === 'GET' && pathParts.length === 1) {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', pathParts[0])
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('Project not found');
    return { data };
  }

  if (method === 'POST') {
    const { data, error } = await supabase
      .from('projects')
      .insert({ ...body, user_id: userId })
      .select()
      .single();

    if (error) throw error;
    return { data };
  }

  if (method === 'PUT' && pathParts.length === 1) {
    const { data, error } = await supabase
      .from('projects')
      .update(body)
      .eq('id', pathParts[0])
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return { data };
  }

  if (method === 'DELETE' && pathParts.length === 1) {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', pathParts[0])
      .eq('user_id', userId);

    if (error) throw error;
    return { data: null };
  }

  throw new Error('Invalid endpoint');
};

const handleLogbookEndpoint = async (
  ctx: RequestContext,
  method: string,
  pathParts: string[],
  body: unknown
) => {
  const { supabase, userId } = ctx;

  if (method === 'GET' && pathParts.length === 0) {
    const { data, error } = await supabase
      .from('logbook_entries')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) throw error;
    return { data, total: data?.length || 0 };
  }

  if (method === 'GET' && pathParts.length === 1) {
    const { data, error } = await supabase
      .from('logbook_entries')
      .select('*')
      .eq('id', pathParts[0])
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('Logbook entry not found');
    return { data };
  }

  if (method === 'POST') {
    const { data, error } = await supabase
      .from('logbook_entries')
      .insert({ ...body, user_id: userId })
      .select()
      .single();

    if (error) throw error;
    return { data };
  }

  if (method === 'PUT' && pathParts.length === 1) {
    const { data, error } = await supabase
      .from('logbook_entries')
      .update(body)
      .eq('id', pathParts[0])
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return { data };
  }

  if (method === 'DELETE' && pathParts.length === 1) {
    const { error } = await supabase
      .from('logbook_entries')
      .delete()
      .eq('id', pathParts[0])
      .eq('user_id', userId);

    if (error) throw error;
    return { data: null };
  }

  throw new Error('Invalid endpoint');
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const ctx = await getRequestContext(req);
    if (!ctx) {
      return new Response(
        JSON.stringify({ error: { message: 'Unauthorized', code: 'UNAUTHORIZED' }, success: false }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const url = new URL(req.url);
    const pathSegments = url.pathname.split('/').filter((s) => s);
    const resource = pathSegments[0];
    const remainingPath = pathSegments.slice(1);

    let body = null;
    if (req.method === 'POST' || req.method === 'PUT') {
      body = await req.json().catch(() => null);
    }

    let result;
    switch (resource) {
      case 'tasks':
        result = await handleTasksEndpoint(ctx, req.method, remainingPath, body);
        break;
      case 'habits':
        result = await handleHabitsEndpoint(ctx, req.method, remainingPath, body);
        break;
      case 'metrics':
        result = await handleMetricsEndpoint(ctx, req.method, remainingPath, body);
        break;
      case 'goals':
        result = await handleGoalsEndpoint(ctx, req.method, remainingPath, body);
        break;
      case 'projects':
        result = await handleProjectsEndpoint(ctx, req.method, remainingPath, body);
        break;
      case 'logbook':
        result = await handleLogbookEndpoint(ctx, req.method, remainingPath, body);
        break;
      default:
        throw new Error('Resource not found');
    }

    return new Response(
      JSON.stringify({ ...result, success: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('API Error:', error);

    const errorResponse = {
      error: {
        message: error instanceof Error ? error.message : 'Internal server error',
        code: 'INTERNAL_ERROR',
      },
      success: false,
    };

    return new Response(
      JSON.stringify(errorResponse),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});