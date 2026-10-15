-- Appends one message to a conversation and bumps updated_at in a single statement,
-- so concurrent writes can't overwrite each other. The message timestamp and
-- updated_at both come from the database clock (now()), so they always match.
--
-- Run this once in the Supabase SQL editor. Re-running it is safe.

create or replace function public.append_message(
  p_conversation_id uuid,
  p_role text,
  p_content text
)
returns public.conversations
language plpgsql
as $$
declare
  updated_row public.conversations;
begin
  if p_role not in ('user', 'ai') then
    raise exception 'Invalid message role: % (expected user or ai)', p_role;
  end if;

  update public.conversations
  set conversation = coalesce(conversation, '[]'::jsonb) || jsonb_build_array(
        jsonb_build_object('role', p_role, 'content', p_content, 'timestamp', now())
      ),
      updated_at = now()
  where id = p_conversation_id
  returning * into updated_row;

  if not found then
    raise exception 'Conversation % not found', p_conversation_id;
  end if;

  return updated_row;
end;
$$;
