module.exports=[20635,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/action-async-storage.external.js",()=>require("next/dist/server/app-render/action-async-storage.external.js"))},18622,(e,t,r)=>{t.exports=e.x("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js",()=>require("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js"))},56704,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/work-async-storage.external.js",()=>require("next/dist/server/app-render/work-async-storage.external.js"))},32319,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/work-unit-async-storage.external.js",()=>require("next/dist/server/app-render/work-unit-async-storage.external.js"))},24725,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/after-task-async-storage.external.js",()=>require("next/dist/server/app-render/after-task-async-storage.external.js"))},54799,(e,t,r)=>{t.exports=e.x("crypto",()=>require("crypto"))},23862,e=>e.a(async(t,r)=>{try{let t=await e.y("pg-587764f78a6c7a9c");e.n(t),r()}catch(e){r(e)}},!0),70406,(e,t,r)=>{t.exports=e.x("next/dist/compiled/@opentelemetry/api",()=>require("next/dist/compiled/@opentelemetry/api"))},93695,(e,t,r)=>{t.exports=e.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},62294,e=>e.a(async(t,r)=>{try{var n=e.i(23862),a=t([n]);[n]=a.then?(await a)():a;let o=process.env.DATABASE_URL;if(!o)throw Error("DATABASE_URL is not set.");let d=new n.Pool({connectionString:o});async function i(e,t=[]){return await d.query(e,t)}async function s(e){let t=await d.connect();try{await t.query("BEGIN");let r=await e(t);return await t.query("COMMIT"),r}catch(e){throw await t.query("ROLLBACK"),e}finally{t.release()}}e.s(["query",()=>i,"transaction",()=>s]),r()}catch(e){r(e)}},!1),93759,e=>e.a(async(t,r)=>{try{var n=e.i(54799),a=e.i(62294),i=t([a]);[a]=i.then?(await i)():i;async function s(e){let t=n.default.randomBytes(32).toString("hex"),r=new Date(Date.now()+6048e5);return await (0,a.query)(`INSERT INTO sessions (session_token, type, admin_id, client_id, expires_at)
     VALUES ($1, $2, $3, $4, $5)`,[t,e.type,e.adminId||null,e.clientId||null,r]),{sessionToken:t,expiresAt:r}}async function o(e){await (0,a.query)("DELETE FROM sessions WHERE session_token = $1",[e])}e.s(["createSession",()=>s,"deleteSession",()=>o]),r()}catch(e){r(e)}},!1),40997,e=>e.a(async(t,r)=>{try{var n=e.i(62294),a=e.i(68105),i=t([n,a]);async function s(e,t){let r=await (0,n.query)("SELECT id, client_id, trainer_id, created_at FROM conversations WHERE client_id = $1 LIMIT 1",[e]);return r.rows[0]?r.rows[0]:await (0,n.transaction)(async r=>(await r.query(`INSERT INTO conversations (client_id, trainer_id)
       VALUES ($1, $2)
       ON CONFLICT (client_id) DO UPDATE SET trainer_id = EXCLUDED.trainer_id
       RETURNING id, client_id, trainer_id, created_at`,[e,t])).rows[0])}async function o(e){return(await (0,n.query)("SELECT id, client_id, trainer_id, created_at FROM conversations WHERE id = $1 LIMIT 1",[e])).rows[0]||null}async function d(e,t){let r=await o(t);if(!r)throw Error("Conversation not found.");if("client"===e.role&&r.client_id!==e.userId||"trainer"===e.role&&r.trainer_id!==e.userId)throw Error("Forbidden");return r}async function c(e,t){let r=t?.limit??30,a=t?.cursor;if(a){let t=(await (0,n.query)(`SELECT id, conversation_id, sender_id, sender_role,
              COALESCE(sender_type, sender_role)::text AS sender_type,
              COALESCE(content, message_text) AS content,
              client_id, trainer_id, message_text, image_url, client_temp_id, is_read, read_at, created_at
       FROM messages
       WHERE conversation_id = $1 AND created_at < $2
       ORDER BY created_at DESC
       LIMIT $3`,[e,a,r+1])).rows,i=t.length>r;return{messages:t.slice(0,r).reverse(),hasMore:i}}let i=(await (0,n.query)(`SELECT id, conversation_id, sender_id, sender_role,
          COALESCE(sender_type, sender_role)::text AS sender_type,
          COALESCE(content, message_text) AS content,
          client_id, trainer_id, message_text, image_url, client_temp_id, is_read, read_at, created_at
     FROM messages
     WHERE conversation_id = $1
     ORDER BY created_at DESC
     LIMIT $2`,[e,r+1])).rows,s=i.length>r;return{messages:i.slice(0,r).reverse(),hasMore:s}}async function l(e){let t=(e.content||"").trim(),r=e.imageUrl?.trim()||null;if(!t&&!r)throw Error("Message text or image is required.");let a=t.length?t:null,i="trainer"===e.senderType?"trainer":"client";return(await (0,n.query)(`INSERT INTO messages (conversation_id, sender_id, sender_role, sender_type, client_id, trainer_id, content, message_text, image_url, client_temp_id, is_read)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, false)
     RETURNING id, conversation_id, sender_id, sender_role,
       COALESCE(sender_type, sender_role)::text AS sender_type,
       COALESCE(content, message_text) AS content,
       client_id, trainer_id, message_text, image_url, client_temp_id, is_read, read_at, created_at`,[e.conversationId,e.senderId,i,i,e.clientId,e.trainerId??null,a,a,r,e.clientTempId??null])).rows[0]}async function _(e,t){"hq"!==t.type&&await (0,n.query)(`UPDATE messages
     SET is_read = true,
         read_at = COALESCE(read_at, NOW())
     WHERE conversation_id = $1 AND sender_type <> $2 AND is_read = false`,[e,t.type])}async function u(e,t){if("hq"===t.type)return 0;let r=await (0,n.query)(`SELECT COUNT(*)::int AS count
     FROM messages
     WHERE conversation_id = $1 AND sender_type <> $2 AND is_read = false`,[e,t.type]);return parseInt(r.rows[0]?.count||"0",10)}async function E(){let e=await (0,a.getAdminSession)();if(e?.admin)return{role:"trainer",userId:e.admin.id};let t=await (0,a.getClientSession)();if(t?.client)return{role:"client",userId:t.client.id};let r=await (0,a.getHQSession)();if(r?.hq)return{role:"hq",userId:"hq"};throw Error("Unauthorized")}async function y(e){let t=await (0,n.query)(`SELECT a.id, a.username
     FROM client_trainer_assignments cta
     JOIN admins a ON a.id = cta.trainer_id
     WHERE cta.client_id = $1
     LIMIT 1`,[e]);if(!t.rows[0])throw Error("No trainer assigned to this client.");return{conversation:await s(e,t.rows[0].id),trainerName:t.rows[0].username}}async function p(e,t){let r=await (0,n.query)(`SELECT c.id, c.name, c.username
     FROM client_trainer_assignments cta
     JOIN clients c ON c.id = cta.client_id
     WHERE cta.client_id = $1 AND cta.trainer_id = $2
     LIMIT 1`,[t,e]);if(!r.rows[0])throw Error("You are not assigned to this client.");return{conversation:await s(t,e),clientName:r.rows[0].name,clientUsername:r.rows[0].username}}async function m(e){if("hq"===e.role)return 0;if("client"===e.role){let t=await (0,n.query)(`SELECT COUNT(*)::int AS count
       FROM messages m
       JOIN conversations c ON c.id = m.conversation_id
       WHERE c.client_id = $1 AND m.sender_type <> 'client' AND m.is_read = false`,[e.userId]);return parseInt(t.rows[0]?.count||"0",10)}let t=await (0,n.query)(`SELECT COUNT(*)::int AS count
     FROM messages m
     JOIN conversations c ON c.id = m.conversation_id
     WHERE c.trainer_id = $1 AND m.sender_type <> 'trainer' AND m.is_read = false`,[e.userId]);return parseInt(t.rows[0]?.count||"0",10)}[n,a]=i.then?(await i)():i,e.s(["assertConversationAccess",()=>d,"ensureConversation",()=>s,"getConversationById",()=>o,"getConversationMetaForClient",()=>y,"getConversationMetaForTrainer",()=>p,"getMessagesForConversation",()=>c,"getTotalUnreadForUser",()=>m,"getUnreadCount",()=>u,"insertMessage",()=>l,"markMessagesRead",()=>_,"resolveChatAccess",()=>E]),r()}catch(e){r(e)}},!1)];

//# sourceMappingURL=%5Broot-of-the-server%5D__194a4c7f._.js.map