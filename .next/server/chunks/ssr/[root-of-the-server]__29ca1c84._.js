module.exports=[93695,(a,b,c)=>{b.exports=a.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},54799,(a,b,c)=>{b.exports=a.x("crypto",()=>require("crypto"))},91279,a=>a.a(async(b,c)=>{try{let b=await a.y("pg-dcf270bf3659e986");a.n(b),c()}catch(a){c(a)}},!0),23748,a=>{a.n(a.i(22509))},54495,a=>{a.n(a.i(52474))},91987,a=>{a.n(a.i(93291))},93108,a=>{a.n(a.i(3423))},5336,a=>{a.n(a.i(16270))},73064,a=>{"use strict";function b(a){return a.toISOString().slice(0,10)}function c(){return b(new Date)}function d(a){let c=[],d=new Date;for(let e=0;e<a;e+=1){let a=new Date(d);a.setUTCDate(d.getUTCDate()-e),c.push(b(a))}return c}a.s(["lastNDaysKeys",()=>d,"toDateKey",()=>b,"todayKey",()=>c])},41820,a=>a.a(async(b,c)=>{try{var d=a.i(59611),e=a.i(76926),f=b([d,e]);async function g(a,b){let c=await (0,d.query)("SELECT id, client_id, trainer_id, created_at FROM conversations WHERE client_id = $1 LIMIT 1",[a]);return c.rows[0]?c.rows[0]:await (0,d.transaction)(async c=>(await c.query(`INSERT INTO conversations (client_id, trainer_id)
       VALUES ($1, $2)
       ON CONFLICT (client_id) DO UPDATE SET trainer_id = EXCLUDED.trainer_id
       RETURNING id, client_id, trainer_id, created_at`,[a,b])).rows[0])}async function h(a,b){let c=b?.limit??30,e=b?.cursor;if(e){let b=(await (0,d.query)(`SELECT id, conversation_id, sender_id, sender_role,
              COALESCE(sender_type, sender_role)::text AS sender_type,
              COALESCE(content, message_text) AS content,
              client_id, trainer_id, message_text, image_url, client_temp_id, is_read, read_at, created_at
       FROM messages
       WHERE conversation_id = $1 AND created_at < $2
       ORDER BY created_at DESC
       LIMIT $3`,[a,e,c+1])).rows,f=b.length>c;return{messages:b.slice(0,c).reverse(),hasMore:f}}let f=(await (0,d.query)(`SELECT id, conversation_id, sender_id, sender_role,
          COALESCE(sender_type, sender_role)::text AS sender_type,
          COALESCE(content, message_text) AS content,
          client_id, trainer_id, message_text, image_url, client_temp_id, is_read, read_at, created_at
     FROM messages
     WHERE conversation_id = $1
     ORDER BY created_at DESC
     LIMIT $2`,[a,c+1])).rows,g=f.length>c;return{messages:f.slice(0,c).reverse(),hasMore:g}}async function i(a,b){"hq"!==b.type&&await (0,d.query)(`UPDATE messages
     SET is_read = true,
         read_at = COALESCE(read_at, NOW())
     WHERE conversation_id = $1 AND sender_type <> $2 AND is_read = false`,[a,b.type])}async function j(a,b){if("hq"===b.type)return 0;let c=await (0,d.query)(`SELECT COUNT(*)::int AS count
     FROM messages
     WHERE conversation_id = $1 AND sender_type <> $2 AND is_read = false`,[a,b.type]);return parseInt(c.rows[0]?.count||"0",10)}async function k(a){let b=await (0,d.query)(`SELECT a.id, a.username
     FROM client_trainer_assignments cta
     JOIN admins a ON a.id = cta.trainer_id
     WHERE cta.client_id = $1
     LIMIT 1`,[a]);if(!b.rows[0])throw Error("No trainer assigned to this client.");return{conversation:await g(a,b.rows[0].id),trainerName:b.rows[0].username}}async function l(a,b){let c=await (0,d.query)(`SELECT c.id, c.name, c.username
     FROM client_trainer_assignments cta
     JOIN clients c ON c.id = cta.client_id
     WHERE cta.client_id = $1 AND cta.trainer_id = $2
     LIMIT 1`,[b,a]);if(!c.rows[0])throw Error("You are not assigned to this client.");return{conversation:await g(b,a),clientName:c.rows[0].name,clientUsername:c.rows[0].username}}async function m(a){let b=(await (0,d.query)(`SELECT c.id as client_id, c.name as client_name, c.username as client_username,
            a.id as trainer_id, a.username as trainer_username
     FROM client_trainer_assignments cta
     JOIN clients c ON c.id = cta.client_id
     JOIN admins a ON a.id = cta.trainer_id
     WHERE cta.client_id = $1
     LIMIT 1`,[a])).rows[0];if(!b)throw Error("No trainer assigned to this client.");return{conversation:await g(b.client_id,b.trainer_id),clientName:b.client_name,clientUsername:b.client_username,trainerName:b.trainer_username}}async function n(){return(await (0,d.query)(`SELECT c.id as client_id, c.name as client_name, c.username as client_username,
            a.username as trainer_name, conv.id as conversation_id,
            COALESCE(unread_client.count, 0)::int as unread_client,
            COALESCE(unread_trainer.count, 0)::int as unread_trainer
     FROM client_trainer_assignments cta
     JOIN clients c ON c.id = cta.client_id
     JOIN admins a ON a.id = cta.trainer_id
     LEFT JOIN conversations conv ON conv.client_id = c.id
     LEFT JOIN LATERAL (
       SELECT COUNT(*)::int as count
       FROM messages m
       WHERE conv.id IS NOT NULL AND m.conversation_id = conv.id AND m.sender_type = 'client' AND m.is_read = false
     ) unread_client ON true
     LEFT JOIN LATERAL (
       SELECT COUNT(*)::int as count
       FROM messages m
       WHERE conv.id IS NOT NULL AND m.conversation_id = conv.id AND m.sender_type = 'trainer' AND m.is_read = false
     ) unread_trainer ON true
     ORDER BY c.name`,[])).rows}async function o(a){return(await (0,d.query)(`SELECT c.id as client_id, c.name, c.username, conv.id as conversation_id,
            COALESCE(unread.unread_count, 0)::int as unread_count
     FROM client_trainer_assignments cta
     JOIN clients c ON c.id = cta.client_id
     LEFT JOIN conversations conv ON conv.client_id = c.id
     LEFT JOIN LATERAL (
       SELECT COUNT(*)::int AS unread_count
       FROM messages m
       WHERE conv.id IS NOT NULL
         AND m.conversation_id = conv.id
         AND m.sender_type <> 'trainer'
         AND m.is_read = false
     ) unread ON true
     WHERE cta.trainer_id = $1
     ORDER BY c.name`,[a])).rows}[d,e]=f.then?(await f)():f,a.s(["getConversationMetaForClient",()=>k,"getConversationMetaForHQ",()=>m,"getConversationMetaForTrainer",()=>l,"getMessagesForConversation",()=>h,"getUnreadCount",()=>j,"listAllConversationsForHQ",()=>n,"listAssignedClientsWithUnread",()=>o,"markMessagesRead",()=>i]),c()}catch(a){c(a)}},!1),17685,a=>a.a(async(b,c)=>{try{var d=a.i(59611),e=a.i(73064),f=b([d]);async function g(a,b){let{checklistId:c}=await k(a,b),e=await (0,d.query)(`SELECT COUNT(*)::int AS total,
            COALESCE(SUM(CASE WHEN checked THEN 1 ELSE 0 END),0)::int AS checked
     FROM daily_checklist_items
     WHERE daily_checklist_id = $1`,[c]),f=e.rows[0]?.total||0,g=e.rows[0]?.checked||0,h=f>0?Math.floor(g/f*100):0;return{totalItems:f,completedItems:g,completionPct:h,isWinDay:h>=60}}async function h(a,b,c,e){let f={total:c.totalItems,completed:c.completedItems,pct:c.completionPct,win:c.isWinDay};e?.submitted?await (0,d.query)(`INSERT INTO client_day_summaries
        (client_id, date, total_items, completed_items, completion_pct, is_win_day, is_submitted, submitted_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, true, NOW(), NOW())
       ON CONFLICT (client_id, date)
       DO UPDATE SET
         total_items = EXCLUDED.total_items,
         completed_items = EXCLUDED.completed_items,
         completion_pct = EXCLUDED.completion_pct,
         is_win_day = EXCLUDED.is_win_day,
         is_submitted = true,
         submitted_at = NOW(),
         updated_at = NOW()`,[a,b,f.total,f.completed,f.pct,f.win]):await (0,d.query)(`INSERT INTO client_day_summaries
      (client_id, date, total_items, completed_items, completion_pct, is_win_day, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, NOW())
     ON CONFLICT (client_id, date)
     DO UPDATE SET
       total_items = EXCLUDED.total_items,
       completed_items = EXCLUDED.completed_items,
       completion_pct = EXCLUDED.completion_pct,
       is_win_day = EXCLUDED.is_win_day,
       updated_at = NOW()`,[a,b,f.total,f.completed,f.pct,f.win])}async function i(a,b){return(await (0,d.query)(`SELECT date, total_items, completed_items, completion_pct, is_submitted, is_win_day, submitted_at
     FROM client_day_summaries
     WHERE client_id = $1 AND date = $2
     LIMIT 1`,[a,b])).rows[0]||null}async function j(a){let b=new Date,c=new Date(b);c.setUTCDate(c.getUTCDate()-365);let f=(0,e.toDateKey)(c),g=(0,e.toDateKey)(b),h=await (0,d.query)(`SELECT date, is_submitted, is_win_day
     FROM client_day_summaries
     WHERE client_id = $1 AND date BETWEEN $2 AND $3`,[a,f,g]),i=new Map(h.rows.map(a=>[(0,e.toDateKey)(new Date(a.date)),{isSubmitted:a.is_submitted,isWinDay:a.is_win_day}])),j=0,k=0,l=new Date(c);for(;l<=b;){let a=(0,e.toDateKey)(l),b=i.get(a);b?.isSubmitted&&b.isWinDay?(k+=1)>j&&(j=k):k=0,l.setUTCDate(l.getUTCDate()+1)}let m=0,n=(0,e.toDateKey)(b),o=i.get(n),p=new Date(b);if(o?.isSubmitted){if(!o.isWinDay)return{current:0,best:j}}else p.setUTCDate(p.getUTCDate()-1);for(;;){let a=(0,e.toDateKey)(p),b=i.get(a);if(b?.isSubmitted&&b.isWinDay){m+=1,p.setUTCDate(p.getUTCDate()-1);continue}break}return{current:m,best:j}}async function k(a,b){let c=await (0,d.query)("SELECT id FROM daily_checklists WHERE client_id = $1 AND date = $2 LIMIT 1",[a,b]);return 0===c.rows.length?{checklistId:await (0,d.transaction)(async c=>(await c.query("INSERT INTO daily_checklists (client_id, date) VALUES ($1, $2) RETURNING id",[a,b])).rows[0].id),templateItems:[]}:{checklistId:c.rows[0].id,templateItems:[]}}async function l(a){let b=(0,e.todayKey)(),{checklistId:c}=await k(a,b),f=await g(a,b);await h(a,b,f);let j=await i(a,b),l=await (0,d.query)(`SELECT id, label, checked, video_url
     FROM daily_checklist_items
     WHERE daily_checklist_id = $1
     ORDER BY sort_order ASC`,[c]),m=await (0,d.query)("SELECT note FROM trainer_notes WHERE client_id = $1 LIMIT 1",[a]);return{date:b,note:m.rows[0]?.note||"",items:l.rows.map(a=>({id:a.id,label:a.label,checked:a.checked,videoUrl:a.video_url??null})),summary:j?{date:j.date,totalItems:j.total_items,completedItems:j.completed_items,completionPct:j.completion_pct,isSubmitted:j.is_submitted,isWinDay:j.is_win_day}:{date:b,totalItems:f.totalItems,completedItems:f.completedItems,completionPct:f.completionPct,isSubmitted:!1,isWinDay:f.isWinDay}}}async function m(a){let b=(0,e.lastNDaysKeys)(7),c=await (0,d.query)(`SELECT dc.date,
            COUNT(dci.id)::int AS total,
            COALESCE(SUM(CASE WHEN dci.checked THEN 1 ELSE 0 END),0)::int AS checked
     FROM daily_checklists dc
     LEFT JOIN daily_checklist_items dci ON dci.daily_checklist_id = dc.id
     WHERE dc.client_id = $1 AND dc.date = ANY($2)
     GROUP BY dc.date`,[a,b]),f=new Map(c.rows.map(a=>[a.date,a]));return b.map(a=>{let b=f.get(a),c=b?.total||0,d=b?.checked||0,e=c>0?Math.round(d/c*100):0;return{date:a,completion:e,total:c,checked:d}})}async function n(a){return(await (0,d.query)(`SELECT id FROM client_undertakings
     WHERE client_id = $1 AND all_checkboxes_confirmed = true
     LIMIT 1`,[a])).rows.length>0}async function o(a){let b=await (0,d.query)(`SELECT created_at
     FROM weekly_checkins
     WHERE client_id = $1
     ORDER BY created_at DESC
     LIMIT 1`,[a]),c=b.rows[0]?.created_at?new Date(b.rows[0].created_at):null;if(!c)return{canSubmit:!0,daysRemaining:0,nextUnlockDate:null};let e=(new Date().getTime()-c.getTime())/864e5,f=new Date(c);if(f.setDate(f.getDate()+7),e>=7)return{canSubmit:!0,daysRemaining:0,nextUnlockDate:f};let g=Math.max(0,Math.ceil(7-e));return{canSubmit:!1,daysRemaining:g,nextUnlockDate:f}}async function p(a,b=30){return(await (0,d.query)(`WITH params AS (
       SELECT (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata')::date AS today_local, $1::uuid AS cid
     ), day_range AS (
       SELECT generate_series(
         (SELECT today_local FROM params) - INTERVAL '${b-1} days',
         (SELECT today_local FROM params),
         INTERVAL '1 day'
       )::date AS day
     ), submitted AS (
       SELECT
         DATE(created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kolkata') AS day,
         completion_pct
       FROM client_day_summaries
       WHERE client_id = (SELECT cid FROM params)
         AND is_submitted = true
         AND created_at >= ((SELECT today_local FROM params) - INTERVAL '${b-1} days')
     )
     SELECT d.day AS date, COALESCE(s.completion_pct, 0) AS completion_pct
     FROM day_range d
     LEFT JOIN submitted s ON s.day = d.day
     ORDER BY d.day ASC`,[a])).rows.map(a=>({date:new Date(a.date).toISOString(),completion:Number(a.completion_pct)||0}))}[d]=f.then?(await f)():f,a.s(["checkUndertakingExists",()=>n,"getClientCheckinStatus",()=>o,"getClientProgressSeries",()=>p,"getHistoryPayload",()=>m,"getStreaks",()=>j,"getTodayPayload",()=>l]),c()}catch(a){c(a)}},!1),92526,a=>{"use strict";a.s(["ClientToday",()=>b]);let b=(0,a.i(69e3).registerClientReference)(function(){throw Error("Attempted to call ClientToday() from the server but ClientToday is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"[project]/brutal-fit/components/portal/ClientToday.tsx <module evaluation>","ClientToday")},98879,a=>{"use strict";a.s(["ClientToday",()=>b]);let b=(0,a.i(69e3).registerClientReference)(function(){throw Error("Attempted to call ClientToday() from the server but ClientToday is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"[project]/brutal-fit/components/portal/ClientToday.tsx","ClientToday")},13333,a=>{"use strict";a.i(92526);var b=a.i(98879);a.n(b)},97137,a=>{"use strict";a.s(["UndertakingLockPage",()=>b]);let b=(0,a.i(69e3).registerClientReference)(function(){throw Error("Attempted to call UndertakingLockPage() from the server but UndertakingLockPage is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"[project]/brutal-fit/components/UndertakingLockPage.tsx <module evaluation>","UndertakingLockPage")},45199,a=>{"use strict";a.s(["UndertakingLockPage",()=>b]);let b=(0,a.i(69e3).registerClientReference)(function(){throw Error("Attempted to call UndertakingLockPage() from the server but UndertakingLockPage is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"[project]/brutal-fit/components/UndertakingLockPage.tsx","UndertakingLockPage")},31206,a=>{"use strict";a.i(97137);var b=a.i(45199);a.n(b)},33303,a=>a.a(async(b,c)=>{try{var d=a.i(94794),e=a.i(76926),f=a.i(17685),g=a.i(41820),h=a.i(13333),i=a.i(31206),j=b([e,f,g]);async function k(){let a=await (0,e.requireClient)(),b=0;try{let{conversation:c}=await (0,g.getConversationMetaForClient)(a.id);b=await (0,g.getUnreadCount)(c.id,"client")}catch(a){b=0}if(!await (0,f.checkUndertakingExists)(a.id))return(0,d.jsx)(i.UndertakingLockPage,{client:a});let c=await (0,f.getTodayPayload)(a.id),j=await (0,f.getStreaks)(a.id),k=await (0,f.getClientCheckinStatus)(a.id),l=await (0,f.getClientProgressSeries)(a.id,90);return(0,d.jsx)("section",{className:"section-space py-16 space-y-6",children:(0,d.jsx)(h.ClientToday,{clientId:a.id,name:a.name,note:c.note,items:c.items,date:c.date,summary:c.summary,streaks:j,weeklyStatus:k,progressData:l,unreadMessages:b})})}[e,f,g]=j.then?(await j)():j,a.s(["default",()=>k]),c()}catch(a){c(a)}},!1)];

//# sourceMappingURL=%5Broot-of-the-server%5D__29ca1c84._.js.map