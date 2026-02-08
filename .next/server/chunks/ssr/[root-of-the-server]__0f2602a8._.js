module.exports=[93695,(a,b,c)=>{b.exports=a.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},54799,(a,b,c)=>{b.exports=a.x("crypto",()=>require("crypto"))},23862,a=>a.a(async(b,c)=>{try{let b=await a.y("pg-587764f78a6c7a9c");a.n(b),c()}catch(a){c(a)}},!0),70864,a=>{a.n(a.i(33290))},43619,a=>{a.n(a.i(79962))},13718,a=>{a.n(a.i(85523))},18198,a=>{a.n(a.i(45518))},62212,a=>{a.n(a.i(66114))},64240,(a,b,c)=>{"use strict";function d(a){if("function"!=typeof WeakMap)return null;var b=new WeakMap,c=new WeakMap;return(d=function(a){return a?c:b})(a)}c._=function(a,b){if(!b&&a&&a.__esModule)return a;if(null===a||"object"!=typeof a&&"function"!=typeof a)return{default:a};var c=d(b);if(c&&c.has(a))return c.get(a);var e={__proto__:null},f=Object.defineProperty&&Object.getOwnPropertyDescriptor;for(var g in a)if("default"!==g&&Object.prototype.hasOwnProperty.call(a,g)){var h=f?Object.getOwnPropertyDescriptor(a,g):null;h&&(h.get||h.set)?Object.defineProperty(e,g,h):e[g]=a[g]}return e.default=a,c&&c.set(a,e),e}},790,(a,b,c)=>{let{createClientModuleProxy:d}=a.r(11857);a.n(d("[project]/node_modules/next/dist/client/app-dir/link.js <module evaluation>"))},84707,(a,b,c)=>{let{createClientModuleProxy:d}=a.r(11857);a.n(d("[project]/node_modules/next/dist/client/app-dir/link.js"))},97647,a=>{"use strict";a.i(790);var b=a.i(84707);a.n(b)},95936,(a,b,c)=>{"use strict";Object.defineProperty(c,"__esModule",{value:!0});var d={default:function(){return i},useLinkStatus:function(){return h.useLinkStatus}};for(var e in d)Object.defineProperty(c,e,{enumerable:!0,get:d[e]});let f=a.r(64240),g=a.r(7997),h=f._(a.r(97647));function i(a){let b=a.legacyBehavior,c="string"==typeof a.children||"number"==typeof a.children||"string"==typeof a.children?.type,d=a.children?.type?.$$typeof===Symbol.for("react.client.reference");return!b||c||d||(a.children?.type?.$$typeof===Symbol.for("react.lazy")?console.error("Using a Lazy Component as a direct child of `<Link legacyBehavior>` from a Server Component is not supported. If you need legacyBehavior, wrap your Lazy Component in a Client Component that renders the Link's `<a>` tag."):console.error("Using a Server Component as a direct child of `<Link legacyBehavior>` is not supported. If you need legacyBehavior, wrap your Server Component in a Client Component that renders the Link's `<a>` tag.")),(0,g.jsx)(h.default,{...a})}("function"==typeof c.default||"object"==typeof c.default&&null!==c.default)&&void 0===c.default.__esModule&&(Object.defineProperty(c.default,"__esModule",{value:!0}),Object.assign(c.default,c),b.exports=c.default)},25387,a=>{"use strict";function b(a){return a.toISOString().slice(0,10)}function c(){return b(new Date)}function d(a){let c=[],d=new Date;for(let e=0;e<a;e+=1){let a=new Date(d);a.setUTCDate(d.getUTCDate()-e),c.push(b(a))}return c}a.s(["lastNDaysKeys",()=>d,"toDateKey",()=>b,"todayKey",()=>c])},85204,a=>a.a(async(b,c)=>{try{var d=a.i(66879),e=a.i(25387),f=b([d]);async function g(a,b){let{checklistId:c}=await k(a,b),e=await (0,d.query)(`SELECT COUNT(*)::int AS total,
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
     ORDER BY d.day ASC`,[a])).rows.map(a=>({date:new Date(a.date).toISOString(),completion:Number(a.completion_pct)||0}))}[d]=f.then?(await f)():f,a.s(["checkUndertakingExists",()=>n,"getClientCheckinStatus",()=>o,"getClientProgressSeries",()=>p,"getHistoryPayload",()=>m,"getStreaks",()=>j,"getTodayPayload",()=>l]),c()}catch(a){c(a)}},!1),29259,a=>a.a(async(b,c)=>{try{var d=a.i(7997),e=a.i(95936),f=a.i(9223),g=a.i(85204),h=b([f,g]);async function i(){let a=await (0,f.requireClient)(),b=await (0,g.getHistoryPayload)(a.id);return(0,d.jsxs)("section",{className:"section-space py-16 space-y-8",children:[(0,d.jsxs)("div",{className:"flex flex-col gap-4 md:flex-row md:items-end md:justify-between",children:[(0,d.jsxs)("div",{children:[(0,d.jsx)("p",{className:"text-xs uppercase tracking-[0.2em] text-muted",children:"Client Portal"}),(0,d.jsx)("h1",{className:"text-3xl md:text-4xl font-semibold",children:"7-day history"})]}),(0,d.jsx)(e.default,{href:"/portal",className:"inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/[0.02] px-4 py-2.5 text-sm font-medium text-white/80 transition hover:bg-white/[0.06]",children:"Back to Today"})]}),(0,d.jsx)("div",{className:"rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-8 backdrop-blur-sm space-y-4",children:b.map(a=>(0,d.jsxs)("div",{className:"space-y-2",children:[(0,d.jsxs)("div",{className:"flex items-center justify-between text-sm text-white/60",children:[(0,d.jsx)("span",{children:a.date}),(0,d.jsxs)("span",{children:[a.completion,"%"]})]}),(0,d.jsx)("div",{className:"h-2 rounded-full bg-white/10 overflow-hidden",children:(0,d.jsx)("div",{className:"h-full bg-white transition-all shadow-[0_0_12px_rgba(255,255,255,0.6)]",style:{width:`${a.completion}%`}})})]},a.date))})]})}[f,g]=h.then?(await h)():h,a.s(["default",()=>i]),c()}catch(a){c(a)}},!1)];

//# sourceMappingURL=%5Broot-of-the-server%5D__0f2602a8._.js.map