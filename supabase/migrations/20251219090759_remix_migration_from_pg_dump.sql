CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "plpgsql" WITH SCHEMA "pg_catalog";
CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";
--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



--
-- Name: app_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.app_role AS ENUM (
    'admin',
    'moderator',
    'user'
);


--
-- Name: archive_user_tasks(text, text[]); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.archive_user_tasks(target_week_key text, target_task_types text[] DEFAULT NULL::text[]) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public', 'pg_temp'
    AS $$
BEGIN
  -- Move matching tasks to archived_tasks
  INSERT INTO public.archived_tasks (
    original_task_id, user_id, task_type, week_key, title, completed, original_data
  )
  SELECT 
    id, user_id, task_type, week_key, title, completed,
    jsonb_build_object(
      'day', day,
      'day_of_week', day_of_week,
      'priority', priority,
      'is_key_point', is_key_point,
      'list_type', list_type,
      'selected', selected,
      'position', position
    )
  FROM public.user_tasks
  WHERE user_id = auth.uid()
    AND week_key = target_week_key
    AND (target_task_types IS NULL OR task_type = ANY(target_task_types));
  
  -- Now delete from user_tasks (safe because we have archive)
  DELETE FROM public.user_tasks
  WHERE user_id = auth.uid()
    AND week_key = target_week_key
    AND (target_task_types IS NULL OR task_type = ANY(target_task_types));
END;
$$;


--
-- Name: auto_set_hot_list_defaults(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.auto_set_hot_list_defaults() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public', 'pg_temp'
    AS $$
BEGIN
  IF NEW.user_id IS NULL THEN
    NEW.user_id := auth.uid();
  END IF;
  
  IF NEW.week_key IS NULL THEN
    NEW.week_key := 'door-week-' || to_char(now(), 'IYYY-IW');
  END IF;
  
  RETURN NEW;
END;
$$;


--
-- Name: auto_set_user_task_defaults(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.auto_set_user_task_defaults() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public', 'pg_temp'
    AS $$
BEGIN
  -- Auto-set user_id if missing
  IF NEW.user_id IS NULL THEN
    NEW.user_id := auth.uid();
  END IF;
  
  -- Auto-set week_key if missing (current week)
  IF NEW.week_key IS NULL THEN
    NEW.week_key := 'door-week-' || to_char(now(), 'IYYY-IW');
  END IF;
  
  RETURN NEW;
END;
$$;


--
-- Name: clear_user_task_history(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.clear_user_task_history(target_user_id uuid) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public', 'pg_temp'
    AS $$
BEGIN
  -- Only allow admins or the user themselves to clear history
  IF auth.uid() != target_user_id AND NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  
  DELETE FROM public.user_tasks WHERE user_id = target_user_id;
  DELETE FROM public.hot_list_items WHERE user_id = target_user_id;
END;
$$;


--
-- Name: has_role(uuid, public.app_role); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.has_role(_user_id uuid, _role public.app_role) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public', 'pg_temp'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public', 'pg_temp'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


SET default_table_access_method = heap;

--
-- Name: anger_stack_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.anger_stack_sessions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    session_id text NOT NULL,
    data jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: archived_tasks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.archived_tasks (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    original_task_id uuid NOT NULL,
    user_id uuid NOT NULL,
    task_type text NOT NULL,
    week_key text,
    title text NOT NULL,
    completed boolean DEFAULT false,
    archived_at timestamp with time zone DEFAULT now(),
    original_data jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: course_modules; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.course_modules (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    course_id uuid NOT NULL,
    title text NOT NULL,
    description text,
    order_index integer NOT NULL,
    duration text,
    video_url text,
    text_content text,
    pdf_url text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: course_submodules; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.course_submodules (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    module_id uuid NOT NULL,
    title text NOT NULL,
    description text,
    order_index integer NOT NULL,
    duration text,
    video_url text,
    text_content text,
    pdf_url text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: courses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.courses (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    title text NOT NULL,
    description text,
    thumbnail_url text,
    category text,
    difficulty_level text,
    duration text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    is_published boolean DEFAULT true
);


--
-- Name: daily_progress; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.daily_progress (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    date date NOT NULL,
    progress_data jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    notes text
);


--
-- Name: daily_progress_stats; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.daily_progress_stats (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    date date NOT NULL,
    total_tasks integer DEFAULT 0,
    completed_tasks integer DEFAULT 0,
    hot_list_items integer DEFAULT 0,
    hit_list_items integer DEFAULT 0,
    do_list_items integer DEFAULT 0,
    completion_rate numeric(5,2) DEFAULT 0,
    streak_days integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: daily_tracking; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.daily_tracking (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    date date DEFAULT CURRENT_DATE NOT NULL,
    stack_completed boolean DEFAULT false,
    journal_completed boolean DEFAULT false,
    core_score integer DEFAULT 0,
    daily_four_score integer DEFAULT 0,
    weekly_two_score integer DEFAULT 0,
    door_tasks_completed integer DEFAULT 0,
    tracking_data jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: divine_coaching_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.divine_coaching_sessions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    session_id text NOT NULL,
    step_number integer,
    question text,
    answer text,
    answers text,
    message text,
    type text,
    is_system_response boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: error_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.error_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    error_message text NOT NULL,
    stack_trace text,
    component_name text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: fact_maps; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.fact_maps (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    title text NOT NULL,
    category text NOT NULL,
    goals jsonb DEFAULT '[]'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    items jsonb DEFAULT '[]'::jsonb
);


--
-- Name: game_journey_maps; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.game_journey_maps (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    category text NOT NULL,
    map_type text DEFAULT 'foundation'::text NOT NULL,
    annual_goal jsonb,
    monthly_goal jsonb,
    fact_answers jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT game_journey_maps_category_check CHECK ((category = ANY (ARRAY['body'::text, 'being'::text, 'balance'::text, 'business'::text]))),
    CONSTRAINT game_journey_maps_map_type_check CHECK ((map_type = ANY (ARRAY['foundation'::text, 'monthly'::text, 'annual'::text])))
);


--
-- Name: hot_list_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.hot_list_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    week_key text NOT NULL,
    item_id text NOT NULL,
    title text NOT NULL,
    list_type text NOT NULL,
    priority integer,
    day text,
    completed boolean DEFAULT false,
    selected boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    day_of_week text,
    CONSTRAINT hot_list_items_list_type_check CHECK ((list_type = ANY (ARRAY['hot'::text, 'hit'::text, 'do'::text])))
);


--
-- Name: knowledge_base_files; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.knowledge_base_files (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    file_name text NOT NULL,
    file_path text NOT NULL,
    file_type text,
    file_size integer,
    created_at timestamp with time zone DEFAULT now(),
    upload_date timestamp with time zone DEFAULT now(),
    content_preview text,
    project_id uuid
);


--
-- Name: lifebook_drafts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.lifebook_drafts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    subcategory text NOT NULL,
    section text NOT NULL,
    messages jsonb DEFAULT '[]'::jsonb NOT NULL,
    last_saved_at timestamp with time zone DEFAULT now() NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: lifebook_entries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.lifebook_entries (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    category text NOT NULL,
    subcategory text NOT NULL,
    section text NOT NULL,
    content jsonb DEFAULT '{}'::jsonb NOT NULL,
    messages jsonb DEFAULT '[]'::jsonb,
    summary text,
    status text DEFAULT 'in_progress'::text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: migration_status; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.migration_status (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    migration_type text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    items_total integer DEFAULT 0,
    items_migrated integer DEFAULT 0,
    error_message text,
    backup_data jsonb,
    created_at timestamp with time zone DEFAULT now(),
    completed_at timestamp with time zone
);


--
-- Name: missions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.missions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    category text NOT NULL,
    mission_type text DEFAULT 'monthly'::text NOT NULL,
    title text,
    goal_data jsonb DEFAULT '{}'::jsonb NOT NULL,
    measurable_result text,
    end_goal_value text,
    period text,
    is_impossible_game boolean DEFAULT false,
    completed boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT missions_category_check CHECK ((category = ANY (ARRAY['body'::text, 'being'::text, 'balance'::text, 'business'::text]))),
    CONSTRAINT missions_mission_type_check CHECK ((mission_type = ANY (ARRAY['monthly'::text, 'annual'::text, 'impossible'::text])))
);


--
-- Name: napoleon_hill_notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.napoleon_hill_notifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    email_notifications boolean DEFAULT true,
    notification_day integer DEFAULT 1,
    notification_time text DEFAULT '09:00'::text,
    last_sent_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: napoleon_hill_principle_drafts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.napoleon_hill_principle_drafts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    project_id uuid NOT NULL,
    principle_number integer NOT NULL,
    messages jsonb DEFAULT '[]'::jsonb NOT NULL,
    last_saved_at timestamp with time zone DEFAULT now() NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT napoleon_hill_principle_drafts_principle_number_check CHECK (((principle_number >= 1) AND (principle_number <= 14)))
);


--
-- Name: napoleon_hill_projects; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.napoleon_hill_projects (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    project_name text NOT NULL,
    goal_description text NOT NULL,
    goal_amount text,
    goal_deadline text,
    current_principle integer DEFAULT 0 NOT NULL,
    principle_answers jsonb DEFAULT '{}'::jsonb,
    principle_summaries jsonb DEFAULT '{}'::jsonb,
    action_items jsonb DEFAULT '[]'::jsonb,
    status text DEFAULT 'active'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT napoleon_hill_projects_current_principle_check CHECK (((current_principle >= 0) AND (current_principle <= 14)))
);


--
-- Name: objectives; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.objectives (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    week_key text NOT NULL,
    category text NOT NULL,
    description text NOT NULL,
    completed boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: rate_limits; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.rate_limits (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    endpoint text NOT NULL,
    request_count integer DEFAULT 1,
    window_start timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: security_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.security_events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    event_type text NOT NULL,
    event_details jsonb DEFAULT '{}'::jsonb,
    ip_address text,
    user_agent text,
    severity text DEFAULT 'low'::text,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT security_events_severity_check CHECK ((severity = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text, 'critical'::text])))
);


--
-- Name: stack_library; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.stack_library (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    title text NOT NULL,
    type text NOT NULL,
    content jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    transcript_path text,
    has_transcript boolean DEFAULT false
);


--
-- Name: stack_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.stack_sessions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    session_id text NOT NULL,
    stack_type text NOT NULL,
    data jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    completed boolean DEFAULT false,
    answers jsonb DEFAULT '{}'::jsonb
);


--
-- Name: user_progress; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_progress (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    activity_type text NOT NULL,
    activity_data jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    role public.app_role NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: user_statistics; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_statistics (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    total_stacks_completed integer DEFAULT 0,
    total_journal_entries integer DEFAULT 0,
    total_core4_sessions integer DEFAULT 0,
    last_activity_date timestamp with time zone,
    current_streak integer DEFAULT 0,
    longest_streak integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: user_tasks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_tasks (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    task_id text,
    title text NOT NULL,
    list_type text NOT NULL,
    week_key text,
    priority integer,
    day text,
    completed boolean DEFAULT false,
    selected boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    day_of_week text,
    task_type text,
    is_key_point boolean DEFAULT false,
    "position" integer DEFAULT 0,
    CONSTRAINT user_tasks_list_type_check CHECK ((list_type = ANY (ARRAY['hot'::text, 'hit'::text, 'do'::text])))
);


--
-- Name: voice_recordings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.voice_recordings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    session_id text NOT NULL,
    stack_type text NOT NULL,
    question_number integer,
    question_text text,
    storage_path text NOT NULL,
    duration_seconds numeric,
    transcript text,
    created_at timestamp with time zone DEFAULT now(),
    metadata jsonb DEFAULT '{}'::jsonb,
    sentiment_analysis jsonb
);


--
-- Name: weekly_planning; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.weekly_planning (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    week_key text NOT NULL,
    plan_data jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    domino_title text,
    week_goal text,
    key_points jsonb DEFAULT '[]'::jsonb,
    review_data jsonb DEFAULT '{}'::jsonb
);


--
-- Name: weekly_planning_drafts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.weekly_planning_drafts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    week_key text NOT NULL,
    messages jsonb DEFAULT '[]'::jsonb NOT NULL,
    questions_answered integer DEFAULT 0 NOT NULL,
    is_skipping_review boolean DEFAULT false NOT NULL,
    last_saved_at timestamp with time zone DEFAULT now() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: anger_stack_sessions anger_stack_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.anger_stack_sessions
    ADD CONSTRAINT anger_stack_sessions_pkey PRIMARY KEY (id);


--
-- Name: anger_stack_sessions anger_stack_sessions_user_id_session_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.anger_stack_sessions
    ADD CONSTRAINT anger_stack_sessions_user_id_session_id_key UNIQUE (user_id, session_id);


--
-- Name: archived_tasks archived_tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.archived_tasks
    ADD CONSTRAINT archived_tasks_pkey PRIMARY KEY (id);


--
-- Name: course_modules course_modules_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_modules
    ADD CONSTRAINT course_modules_pkey PRIMARY KEY (id);


--
-- Name: course_submodules course_submodules_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_submodules
    ADD CONSTRAINT course_submodules_pkey PRIMARY KEY (id);


--
-- Name: courses courses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_pkey PRIMARY KEY (id);


--
-- Name: daily_progress daily_progress_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.daily_progress
    ADD CONSTRAINT daily_progress_pkey PRIMARY KEY (id);


--
-- Name: daily_progress_stats daily_progress_stats_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.daily_progress_stats
    ADD CONSTRAINT daily_progress_stats_pkey PRIMARY KEY (id);


--
-- Name: daily_progress_stats daily_progress_stats_user_id_date_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.daily_progress_stats
    ADD CONSTRAINT daily_progress_stats_user_id_date_key UNIQUE (user_id, date);


--
-- Name: daily_progress daily_progress_user_date_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.daily_progress
    ADD CONSTRAINT daily_progress_user_date_unique UNIQUE (user_id, date);


--
-- Name: daily_progress daily_progress_user_id_date_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.daily_progress
    ADD CONSTRAINT daily_progress_user_id_date_key UNIQUE (user_id, date);


--
-- Name: daily_tracking daily_tracking_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.daily_tracking
    ADD CONSTRAINT daily_tracking_pkey PRIMARY KEY (id);


--
-- Name: daily_tracking daily_tracking_user_id_date_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.daily_tracking
    ADD CONSTRAINT daily_tracking_user_id_date_key UNIQUE (user_id, date);


--
-- Name: divine_coaching_sessions divine_coaching_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.divine_coaching_sessions
    ADD CONSTRAINT divine_coaching_sessions_pkey PRIMARY KEY (id);


--
-- Name: error_logs error_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.error_logs
    ADD CONSTRAINT error_logs_pkey PRIMARY KEY (id);


--
-- Name: fact_maps fact_maps_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fact_maps
    ADD CONSTRAINT fact_maps_pkey PRIMARY KEY (id);


--
-- Name: game_journey_maps game_journey_maps_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.game_journey_maps
    ADD CONSTRAINT game_journey_maps_pkey PRIMARY KEY (id);


--
-- Name: game_journey_maps game_journey_maps_user_id_category_map_type_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.game_journey_maps
    ADD CONSTRAINT game_journey_maps_user_id_category_map_type_key UNIQUE (user_id, category, map_type);


--
-- Name: hot_list_items hot_list_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hot_list_items
    ADD CONSTRAINT hot_list_items_pkey PRIMARY KEY (id);


--
-- Name: knowledge_base_files knowledge_base_files_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.knowledge_base_files
    ADD CONSTRAINT knowledge_base_files_pkey PRIMARY KEY (id);


--
-- Name: lifebook_drafts lifebook_drafts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lifebook_drafts
    ADD CONSTRAINT lifebook_drafts_pkey PRIMARY KEY (id);


--
-- Name: lifebook_drafts lifebook_drafts_user_id_subcategory_section_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lifebook_drafts
    ADD CONSTRAINT lifebook_drafts_user_id_subcategory_section_key UNIQUE (user_id, subcategory, section);


--
-- Name: lifebook_entries lifebook_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lifebook_entries
    ADD CONSTRAINT lifebook_entries_pkey PRIMARY KEY (id);


--
-- Name: lifebook_entries lifebook_entries_user_id_subcategory_section_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lifebook_entries
    ADD CONSTRAINT lifebook_entries_user_id_subcategory_section_key UNIQUE (user_id, subcategory, section);


--
-- Name: migration_status migration_status_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.migration_status
    ADD CONSTRAINT migration_status_pkey PRIMARY KEY (id);


--
-- Name: migration_status migration_status_user_id_migration_type_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.migration_status
    ADD CONSTRAINT migration_status_user_id_migration_type_key UNIQUE (user_id, migration_type);


--
-- Name: missions missions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.missions
    ADD CONSTRAINT missions_pkey PRIMARY KEY (id);


--
-- Name: napoleon_hill_notifications napoleon_hill_notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.napoleon_hill_notifications
    ADD CONSTRAINT napoleon_hill_notifications_pkey PRIMARY KEY (id);


--
-- Name: napoleon_hill_principle_drafts napoleon_hill_principle_drafts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.napoleon_hill_principle_drafts
    ADD CONSTRAINT napoleon_hill_principle_drafts_pkey PRIMARY KEY (id);


--
-- Name: napoleon_hill_principle_drafts napoleon_hill_principle_drafts_project_id_principle_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.napoleon_hill_principle_drafts
    ADD CONSTRAINT napoleon_hill_principle_drafts_project_id_principle_number_key UNIQUE (project_id, principle_number);


--
-- Name: napoleon_hill_projects napoleon_hill_projects_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.napoleon_hill_projects
    ADD CONSTRAINT napoleon_hill_projects_pkey PRIMARY KEY (id);


--
-- Name: objectives objectives_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.objectives
    ADD CONSTRAINT objectives_pkey PRIMARY KEY (id);


--
-- Name: objectives objectives_user_id_week_key_category_description_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.objectives
    ADD CONSTRAINT objectives_user_id_week_key_category_description_key UNIQUE (user_id, week_key, category, description);


--
-- Name: rate_limits rate_limits_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rate_limits
    ADD CONSTRAINT rate_limits_pkey PRIMARY KEY (id);


--
-- Name: rate_limits rate_limits_user_id_endpoint_window_start_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rate_limits
    ADD CONSTRAINT rate_limits_user_id_endpoint_window_start_key UNIQUE (user_id, endpoint, window_start);


--
-- Name: security_events security_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.security_events
    ADD CONSTRAINT security_events_pkey PRIMARY KEY (id);


--
-- Name: stack_library stack_library_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stack_library
    ADD CONSTRAINT stack_library_pkey PRIMARY KEY (id);


--
-- Name: stack_sessions stack_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stack_sessions
    ADD CONSTRAINT stack_sessions_pkey PRIMARY KEY (id);


--
-- Name: stack_sessions stack_sessions_session_id_stack_type_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stack_sessions
    ADD CONSTRAINT stack_sessions_session_id_stack_type_key UNIQUE (session_id, stack_type);


--
-- Name: stack_sessions stack_sessions_user_id_session_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stack_sessions
    ADD CONSTRAINT stack_sessions_user_id_session_id_key UNIQUE (user_id, session_id);


--
-- Name: weekly_planning_drafts unique_user_week_draft; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.weekly_planning_drafts
    ADD CONSTRAINT unique_user_week_draft UNIQUE (user_id, week_key);


--
-- Name: user_progress user_progress_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_progress
    ADD CONSTRAINT user_progress_pkey PRIMARY KEY (id);


--
-- Name: user_progress user_progress_user_activity_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_progress
    ADD CONSTRAINT user_progress_user_activity_unique UNIQUE (user_id, activity_type);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_user_id_role_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role);


--
-- Name: user_statistics user_statistics_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_statistics
    ADD CONSTRAINT user_statistics_pkey PRIMARY KEY (id);


--
-- Name: user_statistics user_statistics_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_statistics
    ADD CONSTRAINT user_statistics_user_id_key UNIQUE (user_id);


--
-- Name: user_tasks user_tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_tasks
    ADD CONSTRAINT user_tasks_pkey PRIMARY KEY (id);


--
-- Name: user_tasks user_tasks_user_id_task_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_tasks
    ADD CONSTRAINT user_tasks_user_id_task_id_key UNIQUE (user_id, task_id);


--
-- Name: voice_recordings voice_recordings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.voice_recordings
    ADD CONSTRAINT voice_recordings_pkey PRIMARY KEY (id);


--
-- Name: weekly_planning_drafts weekly_planning_drafts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.weekly_planning_drafts
    ADD CONSTRAINT weekly_planning_drafts_pkey PRIMARY KEY (id);


--
-- Name: weekly_planning weekly_planning_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.weekly_planning
    ADD CONSTRAINT weekly_planning_pkey PRIMARY KEY (id);


--
-- Name: weekly_planning weekly_planning_user_id_week_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.weekly_planning
    ADD CONSTRAINT weekly_planning_user_id_week_key_key UNIQUE (user_id, week_key);


--
-- Name: idx_course_modules_course_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_course_modules_course_id ON public.course_modules USING btree (course_id);


--
-- Name: idx_course_submodules_module_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_course_submodules_module_id ON public.course_submodules USING btree (module_id);


--
-- Name: idx_courses_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_courses_user_id ON public.courses USING btree (user_id);


--
-- Name: idx_daily_progress_stats_user_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_daily_progress_stats_user_date ON public.daily_progress_stats USING btree (user_id, date);


--
-- Name: idx_daily_tracking_user_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_daily_tracking_user_date ON public.daily_tracking USING btree (user_id, date DESC);


--
-- Name: idx_game_journey_maps_user_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_game_journey_maps_user_category ON public.game_journey_maps USING btree (user_id, category);


--
-- Name: idx_hot_list_items_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_hot_list_items_user_id ON public.hot_list_items USING btree (user_id);


--
-- Name: idx_hot_list_items_week_key; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_hot_list_items_week_key ON public.hot_list_items USING btree (week_key);


--
-- Name: idx_knowledge_base_files_project_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_knowledge_base_files_project_id ON public.knowledge_base_files USING btree (project_id);


--
-- Name: idx_missions_user_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_missions_user_category ON public.missions USING btree (user_id, category);


--
-- Name: idx_missions_user_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_missions_user_type ON public.missions USING btree (user_id, mission_type);


--
-- Name: idx_napoleon_hill_notifications_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_napoleon_hill_notifications_user_id ON public.napoleon_hill_notifications USING btree (user_id);


--
-- Name: idx_napoleon_hill_projects_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_napoleon_hill_projects_status ON public.napoleon_hill_projects USING btree (status);


--
-- Name: idx_napoleon_hill_projects_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_napoleon_hill_projects_user_id ON public.napoleon_hill_projects USING btree (user_id);


--
-- Name: idx_objectives_user_week; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_objectives_user_week ON public.objectives USING btree (user_id, week_key);


--
-- Name: idx_principle_drafts_project_principle; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_principle_drafts_project_principle ON public.napoleon_hill_principle_drafts USING btree (project_id, principle_number);


--
-- Name: idx_principle_drafts_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_principle_drafts_user_id ON public.napoleon_hill_principle_drafts USING btree (user_id);


--
-- Name: idx_rate_limits_user_endpoint; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_rate_limits_user_endpoint ON public.rate_limits USING btree (user_id, endpoint, window_start);


--
-- Name: idx_security_events_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_security_events_created_at ON public.security_events USING btree (created_at DESC);


--
-- Name: idx_security_events_severity; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_security_events_severity ON public.security_events USING btree (severity);


--
-- Name: idx_security_events_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_security_events_user_id ON public.security_events USING btree (user_id);


--
-- Name: idx_user_progress_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_progress_user_id ON public.user_progress USING btree (user_id);


--
-- Name: idx_user_statistics_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_statistics_user_id ON public.user_statistics USING btree (user_id);


--
-- Name: idx_user_tasks_position; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_tasks_position ON public.user_tasks USING btree (user_id, list_type, "position");


--
-- Name: idx_user_tasks_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_tasks_user_id ON public.user_tasks USING btree (user_id);


--
-- Name: idx_user_tasks_week_key; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_tasks_week_key ON public.user_tasks USING btree (week_key);


--
-- Name: idx_voice_recordings_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_voice_recordings_created_at ON public.voice_recordings USING btree (created_at DESC);


--
-- Name: idx_voice_recordings_sentiment; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_voice_recordings_sentiment ON public.voice_recordings USING gin (sentiment_analysis);


--
-- Name: idx_voice_recordings_user_session; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_voice_recordings_user_session ON public.voice_recordings USING btree (user_id, session_id);


--
-- Name: idx_weekly_planning_drafts_user_week; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_weekly_planning_drafts_user_week ON public.weekly_planning_drafts USING btree (user_id, week_key);


--
-- Name: idx_weekly_planning_user_week; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_weekly_planning_user_week ON public.weekly_planning USING btree (user_id, week_key);


--
-- Name: hot_list_items set_hot_list_defaults; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_hot_list_defaults BEFORE INSERT ON public.hot_list_items FOR EACH ROW EXECUTE FUNCTION public.auto_set_hot_list_defaults();


--
-- Name: user_tasks set_user_task_defaults; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_user_task_defaults BEFORE INSERT ON public.user_tasks FOR EACH ROW EXECUTE FUNCTION public.auto_set_user_task_defaults();


--
-- Name: anger_stack_sessions update_anger_stack_sessions_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_anger_stack_sessions_updated_at BEFORE UPDATE ON public.anger_stack_sessions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: course_modules update_course_modules_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_course_modules_updated_at BEFORE UPDATE ON public.course_modules FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: course_submodules update_course_submodules_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_course_submodules_updated_at BEFORE UPDATE ON public.course_submodules FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: courses update_courses_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON public.courses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: daily_progress_stats update_daily_progress_stats_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_daily_progress_stats_updated_at BEFORE UPDATE ON public.daily_progress_stats FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: daily_tracking update_daily_tracking_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_daily_tracking_updated_at BEFORE UPDATE ON public.daily_tracking FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: fact_maps update_fact_maps_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_fact_maps_updated_at BEFORE UPDATE ON public.fact_maps FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: game_journey_maps update_game_journey_maps_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_game_journey_maps_updated_at BEFORE UPDATE ON public.game_journey_maps FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: hot_list_items update_hot_list_items_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_hot_list_items_updated_at BEFORE UPDATE ON public.hot_list_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: lifebook_drafts update_lifebook_drafts_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_lifebook_drafts_updated_at BEFORE UPDATE ON public.lifebook_drafts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: lifebook_entries update_lifebook_entries_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_lifebook_entries_updated_at BEFORE UPDATE ON public.lifebook_entries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: missions update_missions_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_missions_updated_at BEFORE UPDATE ON public.missions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: napoleon_hill_notifications update_napoleon_hill_notifications_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_napoleon_hill_notifications_updated_at BEFORE UPDATE ON public.napoleon_hill_notifications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: napoleon_hill_principle_drafts update_napoleon_hill_principle_drafts_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_napoleon_hill_principle_drafts_updated_at BEFORE UPDATE ON public.napoleon_hill_principle_drafts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: napoleon_hill_projects update_napoleon_hill_projects_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_napoleon_hill_projects_updated_at BEFORE UPDATE ON public.napoleon_hill_projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: objectives update_objectives_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_objectives_updated_at BEFORE UPDATE ON public.objectives FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: rate_limits update_rate_limits_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_rate_limits_updated_at BEFORE UPDATE ON public.rate_limits FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: stack_library update_stack_library_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_stack_library_updated_at BEFORE UPDATE ON public.stack_library FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: stack_sessions update_stack_sessions_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_stack_sessions_updated_at BEFORE UPDATE ON public.stack_sessions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: user_progress update_user_progress_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_user_progress_updated_at BEFORE UPDATE ON public.user_progress FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: user_statistics update_user_statistics_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_user_statistics_updated_at BEFORE UPDATE ON public.user_statistics FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: user_tasks update_user_tasks_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_user_tasks_updated_at BEFORE UPDATE ON public.user_tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: weekly_planning_drafts update_weekly_planning_drafts_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_weekly_planning_drafts_updated_at BEFORE UPDATE ON public.weekly_planning_drafts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: weekly_planning update_weekly_planning_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_weekly_planning_updated_at BEFORE UPDATE ON public.weekly_planning FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: anger_stack_sessions anger_stack_sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.anger_stack_sessions
    ADD CONSTRAINT anger_stack_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: course_modules course_modules_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_modules
    ADD CONSTRAINT course_modules_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;


--
-- Name: course_submodules course_submodules_module_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_submodules
    ADD CONSTRAINT course_submodules_module_id_fkey FOREIGN KEY (module_id) REFERENCES public.course_modules(id) ON DELETE CASCADE;


--
-- Name: courses courses_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: daily_progress_stats daily_progress_stats_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.daily_progress_stats
    ADD CONSTRAINT daily_progress_stats_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: daily_progress daily_progress_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.daily_progress
    ADD CONSTRAINT daily_progress_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: daily_tracking daily_tracking_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.daily_tracking
    ADD CONSTRAINT daily_tracking_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: divine_coaching_sessions divine_coaching_sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.divine_coaching_sessions
    ADD CONSTRAINT divine_coaching_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: error_logs error_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.error_logs
    ADD CONSTRAINT error_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: fact_maps fact_maps_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fact_maps
    ADD CONSTRAINT fact_maps_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: game_journey_maps game_journey_maps_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.game_journey_maps
    ADD CONSTRAINT game_journey_maps_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: hot_list_items hot_list_items_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hot_list_items
    ADD CONSTRAINT hot_list_items_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: knowledge_base_files knowledge_base_files_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.knowledge_base_files
    ADD CONSTRAINT knowledge_base_files_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.napoleon_hill_projects(id) ON DELETE CASCADE;


--
-- Name: knowledge_base_files knowledge_base_files_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.knowledge_base_files
    ADD CONSTRAINT knowledge_base_files_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: migration_status migration_status_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.migration_status
    ADD CONSTRAINT migration_status_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: missions missions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.missions
    ADD CONSTRAINT missions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: napoleon_hill_principle_drafts napoleon_hill_principle_drafts_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.napoleon_hill_principle_drafts
    ADD CONSTRAINT napoleon_hill_principle_drafts_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.napoleon_hill_projects(id) ON DELETE CASCADE;


--
-- Name: objectives objectives_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.objectives
    ADD CONSTRAINT objectives_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: rate_limits rate_limits_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rate_limits
    ADD CONSTRAINT rate_limits_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: security_events security_events_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.security_events
    ADD CONSTRAINT security_events_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: stack_library stack_library_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stack_library
    ADD CONSTRAINT stack_library_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: stack_sessions stack_sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stack_sessions
    ADD CONSTRAINT stack_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_progress user_progress_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_progress
    ADD CONSTRAINT user_progress_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_statistics user_statistics_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_statistics
    ADD CONSTRAINT user_statistics_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_tasks user_tasks_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_tasks
    ADD CONSTRAINT user_tasks_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: voice_recordings voice_recordings_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.voice_recordings
    ADD CONSTRAINT voice_recordings_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: weekly_planning weekly_planning_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.weekly_planning
    ADD CONSTRAINT weekly_planning_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: courses Admins can view all courses; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all courses" ON public.courses FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: daily_progress_stats Admins can view all daily progress stats; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all daily progress stats" ON public.daily_progress_stats FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: migration_status Admins can view all migration statuses; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all migration statuses" ON public.migration_status FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: course_modules Admins can view all modules; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all modules" ON public.course_modules FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: security_events Admins can view all security events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all security events" ON public.security_events FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: user_statistics Admins can view all statistics; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all statistics" ON public.user_statistics FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: course_submodules Admins can view all submodules; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all submodules" ON public.course_submodules FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: user_roles Only admins can delete roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Only admins can delete roles" ON public.user_roles FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: user_roles Only admins can manage roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Only admins can manage roles" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: user_roles Only admins can update roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Only admins can update roles" ON public.user_roles FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: user_roles Service role can check all roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role can check all roles" ON public.user_roles FOR SELECT TO authenticated USING (true);


--
-- Name: rate_limits Service role can manage rate limits; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role can manage rate limits" ON public.rate_limits TO service_role USING (true) WITH CHECK (true);


--
-- Name: weekly_planning_drafts Users can delete their own planning drafts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own planning drafts" ON public.weekly_planning_drafts FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: security_events Users can insert security events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert security events" ON public.security_events FOR INSERT TO authenticated WITH CHECK (((auth.uid() = user_id) OR (user_id IS NULL)));


--
-- Name: error_logs Users can insert their own error logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own error logs" ON public.error_logs FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id));


--
-- Name: migration_status Users can insert their own migration status; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own migration status" ON public.migration_status FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id));


--
-- Name: weekly_planning_drafts Users can insert their own planning drafts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own planning drafts" ON public.weekly_planning_drafts FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: user_statistics Users can insert their own statistics; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own statistics" ON public.user_statistics FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id));


--
-- Name: course_modules Users can manage modules of their courses; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage modules of their courses" ON public.course_modules TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.courses
  WHERE ((courses.id = course_modules.course_id) AND (courses.user_id = auth.uid())))));


--
-- Name: course_submodules Users can manage submodules of their courses; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage submodules of their courses" ON public.course_submodules TO authenticated USING ((EXISTS ( SELECT 1
   FROM (public.course_modules
     JOIN public.courses ON ((courses.id = course_modules.course_id)))
  WHERE ((course_modules.id = course_submodules.module_id) AND (courses.user_id = auth.uid())))));


--
-- Name: napoleon_hill_projects Users can manage their own Napoleon Hill projects; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage their own Napoleon Hill projects" ON public.napoleon_hill_projects USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: anger_stack_sessions Users can manage their own anger stack sessions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage their own anger stack sessions" ON public.anger_stack_sessions TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: archived_tasks Users can manage their own archived tasks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage their own archived tasks" ON public.archived_tasks USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: courses Users can manage their own courses; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage their own courses" ON public.courses TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: daily_progress Users can manage their own daily progress; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage their own daily progress" ON public.daily_progress TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: daily_progress_stats Users can manage their own daily progress stats; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage their own daily progress stats" ON public.daily_progress_stats TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: daily_tracking Users can manage their own daily tracking; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage their own daily tracking" ON public.daily_tracking TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: divine_coaching_sessions Users can manage their own divine coaching sessions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage their own divine coaching sessions" ON public.divine_coaching_sessions TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: fact_maps Users can manage their own fact maps; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage their own fact maps" ON public.fact_maps TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: game_journey_maps Users can manage their own game journey maps; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage their own game journey maps" ON public.game_journey_maps TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: hot_list_items Users can manage their own hot list items; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage their own hot list items" ON public.hot_list_items TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: knowledge_base_files Users can manage their own knowledge base files; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage their own knowledge base files" ON public.knowledge_base_files TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: lifebook_drafts Users can manage their own lifebook drafts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage their own lifebook drafts" ON public.lifebook_drafts USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: lifebook_entries Users can manage their own lifebook entries; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage their own lifebook entries" ON public.lifebook_entries USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: missions Users can manage their own missions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage their own missions" ON public.missions TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: napoleon_hill_notifications Users can manage their own notification preferences; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage their own notification preferences" ON public.napoleon_hill_notifications USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: objectives Users can manage their own objectives; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage their own objectives" ON public.objectives TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: napoleon_hill_principle_drafts Users can manage their own principle drafts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage their own principle drafts" ON public.napoleon_hill_principle_drafts USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: user_progress Users can manage their own progress; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage their own progress" ON public.user_progress TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: stack_library Users can manage their own stack library; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage their own stack library" ON public.stack_library TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: stack_sessions Users can manage their own stack sessions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage their own stack sessions" ON public.stack_sessions TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: user_tasks Users can manage their own tasks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage their own tasks" ON public.user_tasks TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: voice_recordings Users can manage their own voice recordings metadata; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage their own voice recordings metadata" ON public.voice_recordings TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: weekly_planning Users can manage their own weekly planning; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage their own weekly planning" ON public.weekly_planning TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: migration_status Users can update their own migration status; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own migration status" ON public.migration_status FOR UPDATE TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: weekly_planning_drafts Users can update their own planning drafts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own planning drafts" ON public.weekly_planning_drafts FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: user_statistics Users can update their own statistics; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own statistics" ON public.user_statistics FOR UPDATE TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: rate_limits Users can view own rate limits; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own rate limits" ON public.rate_limits FOR SELECT TO authenticated USING ((auth.uid() = user_id));


--
-- Name: user_roles Users can view own roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT TO authenticated USING ((auth.uid() = user_id));


--
-- Name: migration_status Users can view their own migration status; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own migration status" ON public.migration_status FOR SELECT TO authenticated USING ((auth.uid() = user_id));


--
-- Name: weekly_planning_drafts Users can view their own planning drafts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own planning drafts" ON public.weekly_planning_drafts FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: user_statistics Users can view their own statistics; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own statistics" ON public.user_statistics FOR SELECT TO authenticated USING ((auth.uid() = user_id));


--
-- Name: anger_stack_sessions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.anger_stack_sessions ENABLE ROW LEVEL SECURITY;

--
-- Name: archived_tasks; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.archived_tasks ENABLE ROW LEVEL SECURITY;

--
-- Name: course_modules; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.course_modules ENABLE ROW LEVEL SECURITY;

--
-- Name: course_submodules; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.course_submodules ENABLE ROW LEVEL SECURITY;

--
-- Name: courses; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

--
-- Name: daily_progress; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.daily_progress ENABLE ROW LEVEL SECURITY;

--
-- Name: daily_progress_stats; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.daily_progress_stats ENABLE ROW LEVEL SECURITY;

--
-- Name: daily_tracking; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.daily_tracking ENABLE ROW LEVEL SECURITY;

--
-- Name: divine_coaching_sessions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.divine_coaching_sessions ENABLE ROW LEVEL SECURITY;

--
-- Name: error_logs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;

--
-- Name: fact_maps; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.fact_maps ENABLE ROW LEVEL SECURITY;

--
-- Name: game_journey_maps; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.game_journey_maps ENABLE ROW LEVEL SECURITY;

--
-- Name: hot_list_items; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.hot_list_items ENABLE ROW LEVEL SECURITY;

--
-- Name: knowledge_base_files; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.knowledge_base_files ENABLE ROW LEVEL SECURITY;

--
-- Name: lifebook_drafts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.lifebook_drafts ENABLE ROW LEVEL SECURITY;

--
-- Name: lifebook_entries; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.lifebook_entries ENABLE ROW LEVEL SECURITY;

--
-- Name: migration_status; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.migration_status ENABLE ROW LEVEL SECURITY;

--
-- Name: missions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;

--
-- Name: napoleon_hill_notifications; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.napoleon_hill_notifications ENABLE ROW LEVEL SECURITY;

--
-- Name: napoleon_hill_principle_drafts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.napoleon_hill_principle_drafts ENABLE ROW LEVEL SECURITY;

--
-- Name: napoleon_hill_projects; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.napoleon_hill_projects ENABLE ROW LEVEL SECURITY;

--
-- Name: objectives; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.objectives ENABLE ROW LEVEL SECURITY;

--
-- Name: rate_limits; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

--
-- Name: security_events; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

--
-- Name: stack_library; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.stack_library ENABLE ROW LEVEL SECURITY;

--
-- Name: stack_sessions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.stack_sessions ENABLE ROW LEVEL SECURITY;

--
-- Name: user_progress; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

--
-- Name: user_roles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

--
-- Name: user_statistics; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_statistics ENABLE ROW LEVEL SECURITY;

--
-- Name: user_tasks; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_tasks ENABLE ROW LEVEL SECURITY;

--
-- Name: voice_recordings; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.voice_recordings ENABLE ROW LEVEL SECURITY;

--
-- Name: weekly_planning; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.weekly_planning ENABLE ROW LEVEL SECURITY;

--
-- Name: weekly_planning_drafts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.weekly_planning_drafts ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--


