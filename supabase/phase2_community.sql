-- ============================================================
-- NeedLink Phase 2 - Community
-- Supabase SQL Editor で実行してください
-- ============================================================

-- ------------------------------------------------------------
-- 1. フィードバック（コメント）
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id UUID REFERENCES public.services(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  body TEXT NOT NULL CHECK (char_length(body) > 0 AND char_length(body) <= 2000),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS feedback_service_id_created_at_idx
  ON public.feedback (service_id, created_at ASC);

-- ------------------------------------------------------------
-- 2. 開発ログ
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.development_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id UUID REFERENCES public.services(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  body TEXT NOT NULL CHECK (char_length(body) > 0 AND char_length(body) <= 5000),
  logged_at DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS development_logs_service_id_logged_at_idx
  ON public.development_logs (service_id, logged_at DESC, created_at DESC);

-- ------------------------------------------------------------
-- 3. アップデート履歴
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.update_histories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id UUID REFERENCES public.services(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  version TEXT NOT NULL CHECK (char_length(version) > 0 AND char_length(version) <= 40),
  body TEXT NOT NULL CHECK (char_length(body) > 0 AND char_length(body) <= 5000),
  released_at DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS update_histories_service_id_released_at_idx
  ON public.update_histories (service_id, released_at DESC, created_at DESC);

-- ------------------------------------------------------------
-- 4. 会話（DM）
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  participant_one UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  participant_two UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  last_message_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CHECK (participant_one < participant_two),
  UNIQUE (participant_one, participant_two)
);

CREATE INDEX IF NOT EXISTS conversations_participant_one_idx
  ON public.conversations (participant_one);
CREATE INDEX IF NOT EXISTS conversations_participant_two_idx
  ON public.conversations (participant_two);

-- ------------------------------------------------------------
-- 5. メッセージ
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  body TEXT NOT NULL CHECK (char_length(body) > 0 AND char_length(body) <= 5000),
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS messages_conversation_id_created_at_idx
  ON public.messages (conversation_id, created_at ASC);

-- ------------------------------------------------------------
-- 6. メッセージリクエスト
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.message_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  body TEXT NOT NULL CHECK (char_length(body) > 0 AND char_length(body) <= 5000),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'accepted', 'rejected')),
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CHECK (sender_id <> receiver_id)
);

CREATE UNIQUE INDEX IF NOT EXISTS message_requests_pending_unique
  ON public.message_requests (sender_id, receiver_id)
  WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS message_requests_receiver_status_idx
  ON public.message_requests (receiver_id, status, created_at DESC);

-- ------------------------------------------------------------
-- 7. 通知
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('feedback', 'dm', 'message_request')),
  title TEXT NOT NULL,
  body TEXT,
  link TEXT,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS notifications_user_id_created_at_idx
  ON public.notifications (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS notifications_user_id_unread_idx
  ON public.notifications (user_id)
  WHERE read_at IS NULL;

-- ============================================================
-- RLS
-- ============================================================

ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.development_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.update_histories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- feedback
DROP POLICY IF EXISTS "feedback_select" ON public.feedback;
CREATE POLICY "feedback_select" ON public.feedback FOR SELECT USING (true);

DROP POLICY IF EXISTS "feedback_insert" ON public.feedback;
CREATE POLICY "feedback_insert" ON public.feedback FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "feedback_delete" ON public.feedback;
CREATE POLICY "feedback_delete" ON public.feedback FOR DELETE
  USING (auth.uid() = user_id);

-- development_logs
DROP POLICY IF EXISTS "development_logs_select" ON public.development_logs;
CREATE POLICY "development_logs_select" ON public.development_logs FOR SELECT USING (true);

DROP POLICY IF EXISTS "development_logs_insert" ON public.development_logs;
CREATE POLICY "development_logs_insert" ON public.development_logs FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.services s
      WHERE s.id = service_id AND s.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "development_logs_update" ON public.development_logs;
CREATE POLICY "development_logs_update" ON public.development_logs FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.services s
      WHERE s.id = service_id AND s.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "development_logs_delete" ON public.development_logs;
CREATE POLICY "development_logs_delete" ON public.development_logs FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.services s
      WHERE s.id = service_id AND s.user_id = auth.uid()
    )
  );

-- update_histories
DROP POLICY IF EXISTS "update_histories_select" ON public.update_histories;
CREATE POLICY "update_histories_select" ON public.update_histories FOR SELECT USING (true);

DROP POLICY IF EXISTS "update_histories_insert" ON public.update_histories;
CREATE POLICY "update_histories_insert" ON public.update_histories FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.services s
      WHERE s.id = service_id AND s.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "update_histories_update" ON public.update_histories;
CREATE POLICY "update_histories_update" ON public.update_histories FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.services s
      WHERE s.id = service_id AND s.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "update_histories_delete" ON public.update_histories;
CREATE POLICY "update_histories_delete" ON public.update_histories FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.services s
      WHERE s.id = service_id AND s.user_id = auth.uid()
    )
  );

-- conversations
DROP POLICY IF EXISTS "conversations_select" ON public.conversations;
CREATE POLICY "conversations_select" ON public.conversations FOR SELECT
  USING (auth.uid() = participant_one OR auth.uid() = participant_two);

DROP POLICY IF EXISTS "conversations_insert" ON public.conversations;
CREATE POLICY "conversations_insert" ON public.conversations FOR INSERT
  WITH CHECK (auth.uid() = participant_one OR auth.uid() = participant_two);

DROP POLICY IF EXISTS "conversations_update" ON public.conversations;
CREATE POLICY "conversations_update" ON public.conversations FOR UPDATE
  USING (auth.uid() = participant_one OR auth.uid() = participant_two);

-- messages
DROP POLICY IF EXISTS "messages_select" ON public.messages;
CREATE POLICY "messages_select" ON public.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id
        AND (c.participant_one = auth.uid() OR c.participant_two = auth.uid())
    )
  );

DROP POLICY IF EXISTS "messages_insert" ON public.messages;
CREATE POLICY "messages_insert" ON public.messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id
        AND (c.participant_one = auth.uid() OR c.participant_two = auth.uid())
    )
    AND (
      auth.uid() = sender_id
      OR EXISTS (
        SELECT 1 FROM public.message_requests mr
        WHERE mr.receiver_id = auth.uid()
          AND mr.sender_id = sender_id
          AND mr.status = 'pending'
      )
    )
  );

DROP POLICY IF EXISTS "messages_update" ON public.messages;
CREATE POLICY "messages_update" ON public.messages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id
        AND (c.participant_one = auth.uid() OR c.participant_two = auth.uid())
    )
  );

-- message_requests
DROP POLICY IF EXISTS "message_requests_select" ON public.message_requests;
CREATE POLICY "message_requests_select" ON public.message_requests FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

DROP POLICY IF EXISTS "message_requests_insert" ON public.message_requests;
CREATE POLICY "message_requests_insert" ON public.message_requests FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

DROP POLICY IF EXISTS "message_requests_update" ON public.message_requests;
CREATE POLICY "message_requests_update" ON public.message_requests FOR UPDATE
  USING (auth.uid() = receiver_id OR auth.uid() = sender_id);

DROP POLICY IF EXISTS "message_requests_delete" ON public.message_requests;
CREATE POLICY "message_requests_delete" ON public.message_requests FOR DELETE
  USING (auth.uid() = receiver_id OR auth.uid() = sender_id);

-- notifications
DROP POLICY IF EXISTS "notifications_select" ON public.notifications;
CREATE POLICY "notifications_select" ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "notifications_insert" ON public.notifications;
CREATE POLICY "notifications_insert" ON public.notifications FOR INSERT
  WITH CHECK (auth.uid() = actor_id);

DROP POLICY IF EXISTS "notifications_update" ON public.notifications;
CREATE POLICY "notifications_update" ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "notifications_delete" ON public.notifications;
CREATE POLICY "notifications_delete" ON public.notifications FOR DELETE
  USING (auth.uid() = user_id);

NOTIFY pgrst, 'reload schema';
