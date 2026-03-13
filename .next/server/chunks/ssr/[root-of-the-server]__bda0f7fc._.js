module.exports=[93695,(a,b,c)=>{b.exports=a.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},54799,(a,b,c)=>{b.exports=a.x("crypto",()=>require("crypto"))},23862,a=>a.a(async(b,c)=>{try{let b=await a.y("pg-587764f78a6c7a9c");a.n(b),c()}catch(a){c(a)}},!0),70864,a=>{a.n(a.i(33290))},43619,a=>{a.n(a.i(79962))},13718,a=>{a.n(a.i(85523))},18198,a=>{a.n(a.i(45518))},62212,a=>{a.n(a.i(66114))},25387,a=>{"use strict";function b(a){return a.toISOString().slice(0,10)}function c(){return b(new Date)}function d(a){let c=[],d=new Date;for(let e=0;e<a;e+=1){let a=new Date(d);a.setUTCDate(d.getUTCDate()-e),c.push(b(a))}return c}a.s(["lastNDaysKeys",()=>d,"toDateKey",()=>b,"todayKey",()=>c])},24655,a=>a.a(async(b,c)=>{try{var d=a.i(66879),e=a.i(9223),f=b([d,e]);async function g(a,b){let c=await (0,d.query)("SELECT id, client_id, trainer_id, created_at FROM conversations WHERE client_id = $1 LIMIT 1",[a]);return c.rows[0]?c.rows[0]:await (0,d.transaction)(async c=>(await c.query(`INSERT INTO conversations (client_id, trainer_id)
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
     ORDER BY c.name`,[a])).rows}[d,e]=f.then?(await f)():f,a.s(["getConversationMetaForClient",()=>k,"getConversationMetaForHQ",()=>m,"getConversationMetaForTrainer",()=>l,"getMessagesForConversation",()=>h,"getUnreadCount",()=>j,"listAllConversationsForHQ",()=>n,"listAssignedClientsWithUnread",()=>o,"markMessagesRead",()=>i]),c()}catch(a){c(a)}},!1),67751,a=>a.a(async(b,c)=>{try{var d=a.i(66879),e=b([d]);function f(){let a=new Date,b=new Date(a),c=b.getUTCDay();b.setUTCDate(b.getUTCDate()-(0===c?6:c-1)),b.setUTCHours(0,0,0,0);let d=new Date(b);return d.setUTCDate(d.getUTCDate()+7),{start:b,end:d}}function g(){return f().end}function h(){let a=g(),b=new Date,c=a.getTime()-b.getTime();return Math.max(0,Math.ceil(c/864e5))}async function i(a){let{start:b,end:c}=f();return(await (0,d.query)(`SELECT *
     FROM weekly_checkins
     WHERE client_id = $1
       AND created_at >= $2
       AND created_at < $3
     ORDER BY created_at DESC
     LIMIT 1`,[a,b.toISOString(),c.toISOString()])).rows[0]||null}async function j(a){return(await (0,d.query)(`SELECT *
     FROM weekly_checkins
     WHERE client_id = $1
     ORDER BY created_at DESC`,[a])).rows}[d]=e.then?(await e)():e,a.s(["getClientCheckinHistory",()=>j,"getCurrentWeekCheckin",()=>i,"getDaysUntilNextWeek",()=>h,"getNextWeekStart",()=>g]),c()}catch(a){c(a)}},!1),85204,a=>a.a(async(b,c)=>{try{var d=a.i(66879),e=a.i(67751),f=a.i(25387),g=b([d,e]);async function h(a,b){let{checklistId:c}=await l(a,b),e=await (0,d.query)(`SELECT COUNT(*)::int AS total,
            COALESCE(SUM(CASE WHEN checked THEN 1 ELSE 0 END),0)::int AS checked
     FROM daily_checklist_items
     WHERE daily_checklist_id = $1`,[c]),f=e.rows[0]?.total||0,g=e.rows[0]?.checked||0,h=f>0?Math.floor(g/f*100):0;return{totalItems:f,completedItems:g,completionPct:h,isWinDay:h>=60}}async function i(a,b,c,e){let f={total:c.totalItems,completed:c.completedItems,pct:c.completionPct,win:c.isWinDay};e?.submitted?await (0,d.query)(`INSERT INTO client_day_summaries
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
       updated_at = NOW()`,[a,b,f.total,f.completed,f.pct,f.win])}async function j(a,b){return(await (0,d.query)(`SELECT date, total_items, completed_items, completion_pct, is_submitted, is_win_day, submitted_at
     FROM client_day_summaries
     WHERE client_id = $1 AND date = $2
     LIMIT 1`,[a,b])).rows[0]||null}async function k(a){let b=new Date,c=new Date(b);c.setUTCDate(c.getUTCDate()-365);let e=(0,f.toDateKey)(c),g=(0,f.toDateKey)(b),h=await (0,d.query)(`SELECT date, is_submitted, is_win_day
     FROM client_day_summaries
     WHERE client_id = $1 AND date BETWEEN $2 AND $3`,[a,e,g]),i=new Map(h.rows.map(a=>[(0,f.toDateKey)(new Date(a.date)),{isSubmitted:a.is_submitted,isWinDay:a.is_win_day}])),j=0,k=0,l=new Date(c);for(;l<=b;){let a=(0,f.toDateKey)(l),b=i.get(a);b?.isSubmitted&&b.isWinDay?(k+=1)>j&&(j=k):k=0,l.setUTCDate(l.getUTCDate()+1)}let m=0,n=(0,f.toDateKey)(b),o=i.get(n),p=new Date(b);if(o?.isSubmitted){if(!o.isWinDay)return{current:0,best:j}}else p.setUTCDate(p.getUTCDate()-1);for(;;){let a=(0,f.toDateKey)(p),b=i.get(a);if(b?.isSubmitted&&b.isWinDay){m+=1,p.setUTCDate(p.getUTCDate()-1);continue}break}return{current:m,best:j}}async function l(a,b){let c=await (0,d.query)("SELECT id FROM daily_checklists WHERE client_id = $1 AND date = $2 LIMIT 1",[a,b]);return 0===c.rows.length?{checklistId:await (0,d.transaction)(async c=>(await c.query("INSERT INTO daily_checklists (client_id, date) VALUES ($1, $2) RETURNING id",[a,b])).rows[0].id),templateItems:[]}:{checklistId:c.rows[0].id,templateItems:[]}}async function m(a){let b=(0,f.todayKey)(),{checklistId:c}=await l(a,b),e=await h(a,b);await i(a,b,e);let g=await j(a,b),k=await (0,d.query)(`SELECT id, label, block_name, exercise_name, prescription, exercise_notes, checked, video_url
     FROM daily_checklist_items
     WHERE daily_checklist_id = $1
     ORDER BY sort_order ASC`,[c]),m=await (0,d.query)("SELECT note, note_html FROM trainer_notes WHERE client_id = $1 LIMIT 1",[a]);return{date:b,note:m.rows[0]?.note||"",noteHtml:m.rows[0]?.note_html||"",items:k.rows.map(a=>({id:a.id,label:a.label,blockName:a.block_name??"Workout",exerciseName:a.exercise_name??a.label,prescription:a.prescription??"",notes:a.exercise_notes??"",checked:a.checked,videoUrl:a.video_url??null})),summary:g?{date:g.date,totalItems:g.total_items,completedItems:g.completed_items,completionPct:g.completion_pct,isSubmitted:g.is_submitted,isWinDay:g.is_win_day}:{date:b,totalItems:e.totalItems,completedItems:e.completedItems,completionPct:e.completionPct,isSubmitted:!1,isWinDay:e.isWinDay}}}async function n(a){let b=(0,f.lastNDaysKeys)(7),c=await (0,d.query)(`SELECT dc.date,
            COUNT(dci.id)::int AS total,
            COALESCE(SUM(CASE WHEN dci.checked THEN 1 ELSE 0 END),0)::int AS checked
     FROM daily_checklists dc
     LEFT JOIN daily_checklist_items dci ON dci.daily_checklist_id = dc.id
     WHERE dc.client_id = $1 AND dc.date = ANY($2)
     GROUP BY dc.date`,[a,b]),e=new Map(c.rows.map(a=>[a.date,a]));return b.map(a=>{let b=e.get(a),c=b?.total||0,d=b?.checked||0,f=c>0?Math.round(d/c*100):0;return{date:a,completion:f,total:c,checked:d}})}async function o(a){return(await (0,d.query)(`SELECT id FROM client_undertakings
     WHERE client_id = $1 AND all_checkboxes_confirmed = true
     LIMIT 1`,[a])).rows.length>0}async function p(a){return await (0,e.getCurrentWeekCheckin)(a)?{canSubmit:!1,daysRemaining:(0,e.getDaysUntilNextWeek)(),nextUnlockDate:(0,e.getNextWeekStart)()}:{canSubmit:!0,daysRemaining:0,nextUnlockDate:null}}async function q(a,b=30){return(await (0,d.query)(`WITH params AS (
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
     ORDER BY d.day ASC`,[a])).rows.map(a=>({date:new Date(a.date).toISOString(),completion:Number(a.completion_pct)||0}))}[d,e]=g.then?(await g)():g,a.s(["checkUndertakingExists",()=>o,"getClientCheckinStatus",()=>p,"getClientProgressSeries",()=>q,"getHistoryPayload",()=>n,"getStreaks",()=>k,"getTodayPayload",()=>m]),c()}catch(a){c(a)}},!1),14857,a=>{"use strict";a.s(["ClientToday",()=>b]);let b=(0,a.i(11857).registerClientReference)(function(){throw Error("Attempted to call ClientToday() from the server but ClientToday is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"[project]/components/portal/ClientToday.tsx <module evaluation>","ClientToday")},57956,a=>{"use strict";a.s(["ClientToday",()=>b]);let b=(0,a.i(11857).registerClientReference)(function(){throw Error("Attempted to call ClientToday() from the server but ClientToday is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"[project]/components/portal/ClientToday.tsx","ClientToday")},42460,a=>{"use strict";a.i(14857);var b=a.i(57956);a.n(b)},91254,a=>{"use strict";a.s(["UndertakingLockPage",()=>b]);let b=(0,a.i(11857).registerClientReference)(function(){throw Error("Attempted to call UndertakingLockPage() from the server but UndertakingLockPage is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"[project]/components/UndertakingLockPage.tsx <module evaluation>","UndertakingLockPage")},71898,a=>{"use strict";a.s(["UndertakingLockPage",()=>b]);let b=(0,a.i(11857).registerClientReference)(function(){throw Error("Attempted to call UndertakingLockPage() from the server but UndertakingLockPage is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"[project]/components/UndertakingLockPage.tsx","UndertakingLockPage")},6503,a=>{"use strict";a.i(91254);var b=a.i(71898);a.n(b)},56597,a=>a.a(async(b,c)=>{try{var d=a.i(7997),e=a.i(9223),f=a.i(85204),g=a.i(24655),h=a.i(42460),i=a.i(6503),j=b([e,f,g]);async function k(){let a=await (0,e.requireClient)(),b=0;try{let{conversation:c}=await (0,g.getConversationMetaForClient)(a.id);b=await (0,g.getUnreadCount)(c.id,{id:a.id,type:"client"})}catch(a){b=0}if(!await (0,f.checkUndertakingExists)(a.id))return(0,d.jsx)(i.UndertakingLockPage,{client:a});let c=await (0,f.getTodayPayload)(a.id),j=await (0,f.getStreaks)(a.id),k=await (0,f.getClientCheckinStatus)(a.id),l=await (0,f.getClientProgressSeries)(a.id,90);return(0,d.jsx)("section",{className:"section-space py-16 space-y-6",children:(0,d.jsx)(h.ClientToday,{clientId:a.id,name:a.name,note:c.note,noteHtml:c.noteHtml,items:c.items,date:c.date,summary:c.summary,streaks:j,weeklyStatus:k,progressData:l,unreadMessages:b})})}[e,f,g]=j.then?(await j)():j,a.s(["default",()=>k]),c()}catch(a){c(a)}},!1)];

//# sourceMappingURL=%5Broot-of-the-server%5D__bda0f7fc._.js.map