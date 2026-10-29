# ELUDA Data Model and Authorization

**Status:** Approved design (owner decisions, 2026-10-29). Nothing in this document is implemented. The hosted Supabase project was verified empty on 2026-10-28.
**Authority:** `PRODUCT_BRIEF.md` is authoritative for product rules. If this document and the brief differ, stop and ask the owner.

## 1. Principles
- The app user ID equals the Supabase Auth user ID (uuid). Times are UTC `timestamptz`. Money is integer UGX.
- Access is computed from stored Plan records on every request. There is no stored "is paid" flag.
- Every table we create has Row Level Security enabled and no policies, and the `anon` and `authenticated` privileges are revoked, in the same migration that creates the table. The single exception is a narrow SELECT-only policy on Supabase's own `realtime.messages` table (Section 6). Supabase advisors are re-run after every applied migration.
- Only the server-only data-access layer talks to Prisma. Prisma uses a role that bypasses RLS, so every rule in this document is enforced in server code and covered by automated tests.
- Gender for all rules is the gender chosen at signup. It is not editable afterwards; corrections are made by the owner through a reviewed script, not a feature. No orientation data is collected.
- No rate limits are added beyond the generic, invisible technical limits already described in `docs/SECURITY_REQUIREMENTS.md`. There is no new-conversation cap.

## 2. Opposite-gender rule (MVP)
Men see and message women, and women see and message men. Discovery, Daily Picks, likes, viewing a profile, creating a conversation and sending a message all require exactly one MALE and one FEMALE participant. The server rejects same-gender attempts on every one of these paths.

## 3. Tables (MVP)
| Table | Key columns | Notes |
|---|---|---|
| `users` | id, gender (FEMALE/MALE), date_of_birth, display_name, deleted_at | 18+ check |
| `profiles` | user_id, intent (MEETUPS/DATING/MARRIAGE/FRIENDS), availability (AVAILABLE/BUSY/HIDDEN, women only), bio, published_at | one intent, changeable; `published_at` requires at least 2 photos |
| `profile_photos` | id, user_id, storage_path, position | private bucket, signed URLs only |
| `likes` | liker_id, liked_id, created_at | built after messaging and LivePay; not a messaging gate |
| `conversations` | id, user_a_id, user_b_id (ordered), status, closed_at, last_seq | unique per pair |
| `messages` | id, conversation_id, seq, sender_id, recipient_id, kind (PRESET/CUSTOM), preset_key, sent_at | no body column; unique (conversation_id, seq) |
| `message_contents` | message_id, body | CUSTOM messages only |
| `message_unlocks` | message_id (unique), recipient_id, unlocked_at, reason | reason: NOT_REQUIRED, ACTIVE_PLAN_AT_ARRIVAL, PLAN_ACTIVATION |
| `icebreaker_daily_counts` | user_id, day (Africa/Kampala), count | atomic upsert, maximum 15 |
| `payments` | id, user_id (nullable), plan_code, amount_ugx, provider_reference (unique), status | LivePay |
| `plan_entitlements` | id, payment_id (unique), user_id, plan_code, starts_at, ends_at | active Plan: starts_at <= now < ends_at |
| `webhook_events` | provider, event_id (unique), received_at, processed_at | idempotency |
| `blocks`, `reports` | blocker/blocked; reporter/reported, conversation, message, reason, status | free safety controls |

`messages.seq` is a per-conversation counter assigned under a row lock on the conversation (`conversations.last_seq`). A global identity column is not used: a later-committing transaction could receive a lower number and a catch-up cursor would skip it.

## 4. Message rules
- Who may send what: PRESET only from a MALE with no active Plan at the time of sending, at most 15 per day (the day resets at midnight Africa/Kampala). CUSTOM only from a FEMALE, or from a MALE with an active Plan, with no daily total cap; a man with an active Plan can start conversations.
- A MALE without an active Plan can send nothing in a conversation once the other participant has written in it (the locked input bar). Before that, only the 15-preset daily limit applies.
- A HIDDEN woman cannot receive new conversations from anyone. She can start conversations herself. Once she writes, the conversation works normally in both directions and the man can view her profile through it. Existing conversations keep working if she later becomes HIDDEN.
- Presets are constants in code (Appendix A). Messages store only the preset key, never the text, so wording can change later. The server accepts a key only if it applies to "Any" or to the recipient's intent at send time. The text is resolved server-side from the key, only after the unlock check. A locked message exposes no preset key.
- A sender always sees their own messages. A recipient needs an unlock row.
- A locked message returns only `{ locked: true }`: no text, no length, no preview and no preset key.
- Notifications for a locked message carry no sender name and no text. In the signed-in conversation list, a locked conversation shows the sender's name and photo plus a lock bubble, with no text, preview, preset key or message length.
- Message endpoints send `Cache-Control: private, no-store`.

## 5. Unlock flow
- A message to a female recipient gets an unlock row at insert (reason NOT_REQUIRED).
- A message to a male recipient with an active Plan gets an unlock row at insert (reason ACTIVE_PLAN_AT_ARRIVAL). Without an active Plan it gets no row, and no row means locked.
- When a Plan is activated, the webhook transaction records the entitlement and inserts unlock rows (reason PLAN_ACTIVATION, `ON CONFLICT DO NOTHING`) for every locked message waiting for that man, in the same transaction.
- Each unlock row stores its unlock time. When a Plan expires nothing is deleted: existing unlock rows persist, so those messages stay readable, and messages arriving after expiry get no row.

## 6. Real-time chat: signal, then fetch
- Channels: one private Supabase Realtime Broadcast channel per user, topic `user:<user id>`. The client sets `private: true` and uses the user's session token.
- The only policy exception to the "RLS with no policies" rule: a SELECT-only policy on `realtime.messages` for the `authenticated` role, allowed only when the extension is `broadcast` and the topic equals `user:` followed by the caller's own `auth.uid()`. There is no INSERT policy, so clients can never publish. The exact SQL is verified against the current Supabase documentation in the realtime task.
- The owner turns off "Allow public access" in the Supabase Realtime settings so that only private channels are accepted. The Builder never changes Supabase settings.
- Signals are sent server-side from a route handler, after the database transaction commits, using a server-only Supabase key. The key never uses a `NEXT_PUBLIC_` name and never reaches the client bundle; the module that reads it imports `server-only`. The env var name is decided in the realtime task (expected: `SUPABASE_SECRET_KEY`). Docs name env vars only, never values.
- A signal contains only the conversation ID and an event type (`message-arrived` or `entitlement-changed`). It never contains a message body, preset key, sender name or any content-derived data. Locked and unlocked arrivals have the identical shape. No signal is sent to a blocked or deleted user.
- After a signal the client fetches through the normal authenticated endpoint, which applies the lock. Each fetch response includes the Plan's `endsAt`, so the client refetches when the Plan expires.
- Catch-up: realtime does not replay missed events. On reconnect, and as a polling fallback, the client sends its last `seq` per conversation and the `syncToken` the server issued with its previous fetch. The server returns messages above the per-conversation `seq` cursor plus messages unlocked after the token's time minus an overlap of about 2 minutes, which covers commit-order races. The client dedupes by message id. The client never supplies a timestamp. Authorization is re-applied on every fetch, so a forged or stale token can never widen access.
- Before launch, check the Supabase plan's limits for concurrent Realtime connections and message volume.

## 7. Authorization matrix (enforced in server code and tested)
| Action | Allowed when |
|---|---|
| View a profile | signed in; viewer and owner are of opposite gender; profile published; no block either way; owner not deleted. Discovery lists also exclude HIDDEN profiles. A HIDDEN woman's profile is viewable by a man only through an existing conversation. |
| Create a conversation | opposite genders; no block either way; target not deleted and not HIDDEN (a HIDDEN woman can create conversations herself) |
| Like | opposite genders (feature built later) |
| See a photo | the server issues a short-lived signed URL only to a viewer authorized to see that profile |
| Send a message | participant; conversation open; no block; kind rules in Section 4 |
| Read message text | the sender (own messages), or the recipient with an unlock row |
| Receive a realtime signal | own channel only; no signal for blocked or deleted users |
| Create a payment | signed in, for self only |
| Webhook | verified authenticity; idempotent by `event_id` |
| Delete account | owner only, immediate effect |
| Block, report, unmatch | participants only, always free; unmatch closes the conversation and removes the mutual like |

## 8. Required automated tests
- Lock bypass: a direct API call, a list endpoint, server-rendered HTML and a notification payload for a locked message each return no body; another user's message ID gives the same response as a missing one.
- Unlock: activation unlocks the waiting backlog in one transaction; arrival after expiry stays locked; previously unlocked messages stay readable after expiry; a message arriving during activation is unlocked exactly once.
- Sending: concurrent presets never exceed 15; a plan-less man cannot send after the other participant has written; a preset key must match "Any" or the recipient's intent; CUSTOM is rejected for a plan-less man; PRESET is rejected for women and for men with an active Plan.
- Gender and visibility: same-gender attempts are rejected on discovery, profile view, like, conversation creation and message send; a new conversation with a HIDDEN woman is rejected; a conversation that already exists with her keeps working both ways; a HIDDEN woman can start a conversation.
- Realtime: another user's token cannot subscribe to a channel; a client cannot publish; an unauthenticated subscription is refused; a locked-message signal contains no content; blocked or deleted users receive no signals; reconnect catch-up never duplicates or skips messages, including under concurrent sends.
- Secrets: CI fails if a server-only env var name appears in any client component (`"use client"` file), and CI fails if a canary secret value appears anywhere in the client bundle (`.next/static`).
- Payments: a replayed webhook creates no second entitlement.

## 9. Provisional and deferred decisions
- Plan stacking: a second purchase starts when the current Plan ends (revisit in the LivePay task).
- Account deletion: the account becomes inaccessible instantly, then personal data and photos are purged; payment records are kept but detached from personal data (`user_id` set to null).
- Moderation access to message content is deferred.
- Likes and matches are not a gate for messaging. They are built after messaging and LivePay, and the `likes` table stays in the schema.
- The authentication sign-in method (email, phone or both) is not decided.
- Launch blockers (not blocking the MVP build): verification for women before they can message men; data-protection obligations and the 18+ approach; Supabase Realtime plan limits.

## Appendix A: Icebreaker catalogue (owner-approved wording, 2026-10-29)
Stored as constants in code with a stable key and the intents each applies to ("Any" means all four). Messages store only the key. The picker shows "Any" presets plus those matching the recipient's intent. Presets are only for men without an active Plan.

| Key | Applies to | Text |
|---|---|---|
| ANY_01 | Any | Hi! Your profile caught my eye. How's your day going? |
| ANY_02 | Any | Oli otya? I'd love to get to know you a little. |
| ANY_03 | Any | Hello! What's the best part of your week so far? |
| ANY_04 | Any | Hi there! If you could be anywhere in Uganda right now, where would it be? |
| ANY_05 | Any | Hey! What's something you're really enjoying lately? |
| ANY_06 | Any | Hi! You seem like someone with good stories. What's one you love telling? |
| ANY_07 | Any | Hello! Tea, coffee or juice: where do you stand? |
| DAT_01 | Dating | Hi! I'd love to take things slowly and see where a conversation goes. |
| DAT_02 | Dating | Hey! What does a perfect weekend look like for you? |
| DAT_03 | Dating | Hello! What's something small that always makes you smile? |
| DAT_04 | Dating | Hi! What are you looking for here? I'm looking for someone genuine. |
| MAR_01 | Marriage | Hello! I'm here looking for something serious and lasting. What about you? |
| MAR_02 | Marriage | Hi! What do you value most in a life partner? |
| MAR_03 | Marriage | Hey! Family matters a lot to me. How about you? |
| MAR_04 | Marriage | Hi! I'd like to get to know you with a serious future in mind. Can we talk? |
| FRI_01 | Make New Friends | Hi! I'm here to meet good people. What do you like doing for fun? |
| FRI_02 | Make New Friends | Hello! What kind of music are you into these days? |
| FRI_03 | Make New Friends | Hey! Any good place in Kampala you'd recommend? |
| FRI_04 | Make New Friends | Hi! What's the last thing that made you laugh properly? |
| MEE_01 | Meetups | Hi! I'd like to meet up soon if we get along. Are you free this week? |
| MEE_02 | Meetups | Hello! I'm not one for long chatting. Coffee sometime if we click? |
| MEE_03 | Meetups | Hey! Would you be up for meeting in person soon? |
| MEE_04 | Meetups | Hi! I'd rather meet than text for days. What area are you in? |