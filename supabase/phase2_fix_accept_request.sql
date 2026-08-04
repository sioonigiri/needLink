-- ============================================================
-- Fix: メッセージリクエスト許可時に初回メッセージを挿入できるよう RLS を調整
-- Supabase SQL Editor で実行してください
-- ============================================================
--
-- 原因:
-- messages_insert が auth.uid() = sender_id を要求していたため、
-- 受信者が「許可する」際に送信者名義の初回メッセージを INSERT できなかった。
--

DROP POLICY IF EXISTS "messages_insert" ON public.messages;

CREATE POLICY "messages_insert" ON public.messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id
        AND (c.participant_one = auth.uid() OR c.participant_two = auth.uid())
    )
    AND (
      -- 通常送信: 自分のメッセージ
      auth.uid() = sender_id
      OR
      -- リクエスト許可時: 受信者が、pending リクエストの送信者メッセージを代理挿入
      EXISTS (
        SELECT 1 FROM public.message_requests mr
        WHERE mr.receiver_id = auth.uid()
          AND mr.sender_id = sender_id
          AND mr.status = 'pending'
      )
    )
  );

NOTIFY pgrst, 'reload schema';
