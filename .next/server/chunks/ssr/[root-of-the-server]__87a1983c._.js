module.exports=[93695,(a,b,c)=>{b.exports=a.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},54799,(a,b,c)=>{b.exports=a.x("crypto",()=>require("crypto"))},91279,a=>a.a(async(b,c)=>{try{let b=await a.y("pg-dcf270bf3659e986");a.n(b),c()}catch(a){c(a)}},!0),23748,a=>{a.n(a.i(22509))},54495,a=>{a.n(a.i(52474))},91987,a=>{a.n(a.i(93291))},93108,a=>{a.n(a.i(3423))},5336,a=>{a.n(a.i(16270))},73064,a=>{"use strict";function b(a){return a.toISOString().slice(0,10)}function c(){return b(new Date)}function d(a){let c=[],d=new Date;for(let e=0;e<a;e+=1){let a=new Date(d);a.setUTCDate(d.getUTCDate()-e),c.push(b(a))}return c}a.s(["lastNDaysKeys",()=>d,"toDateKey",()=>b,"todayKey",()=>c])},65846,a=>a.a(async(b,c)=>{try{var d=a.i(59611),e=a.i(73064),f=b([d]);async function g(a){let b=await (0,d.query)(`SELECT c.id, c.name, c.username, c.email
     FROM clients c
     LEFT JOIN client_trainer_assignments cta ON cta.client_id = c.id
     WHERE $1::uuid IS NULL OR cta.trainer_id = $1
     ORDER BY c.created_at DESC`,[a??null]),c=(0,e.todayKey)();return await Promise.all(b.rows.map(async a=>{let b=await (0,d.query)(`SELECT dc.id,
                COUNT(dci.id)::int AS total,
                COALESCE(SUM(CASE WHEN dci.checked THEN 1 ELSE 0 END),0)::int AS checked
         FROM daily_checklists dc
         LEFT JOIN daily_checklist_items dci ON dci.daily_checklist_id = dc.id
         WHERE dc.client_id = $1 AND dc.date = $2
         GROUP BY dc.id`,[a.id,c]),e=await (0,d.query)("SELECT updated_at FROM daily_checklists WHERE client_id = $1 ORDER BY updated_at DESC LIMIT 1",[a.id]),f=b.rows[0]?.total||0,g=b.rows[0]?.checked||0,h=f>0?Math.round(g/f*100):0;return{id:a.id,name:a.name,username:a.username,email:a.email,todayCompletion:h,lastActivity:e.rows[0]?.updated_at||null}}))}async function h(a){let b=await (0,d.query)(`SELECT c.id, c.name, c.username, tn.note AS trainer_note
     FROM clients c
     LEFT JOIN trainer_notes tn ON tn.client_id = c.id
     WHERE c.id = $1`,[a]);if(0===b.rows.length)return null;let c=await (0,d.query)(`SELECT to_char(dc.date::date, 'YYYY-MM-DD') AS date,
            COUNT(dci.id)::int AS total,
            COALESCE(SUM(CASE WHEN dci.checked THEN 1 ELSE 0 END),0)::int AS checked
     FROM daily_checklists dc
     LEFT JOIN daily_checklist_items dci ON dci.daily_checklist_id = dc.id
     WHERE dc.client_id = $1
       AND dc.date <> 'template'
       AND dc.date::date >= (CURRENT_DATE - INTERVAL '30 days')
     GROUP BY dc.date::date
     ORDER BY dc.date::date DESC`,[a]),f=(0,e.todayKey)(),g=await (0,d.query)("SELECT id FROM daily_checklists WHERE client_id = $1 AND date = $2 LIMIT 1",[a,f]),h=g.rows[0]?.id,i=h?await (0,d.query)(`SELECT id, label, sort_order, video_url
         FROM daily_checklist_items
         WHERE daily_checklist_id = $1
         ORDER BY sort_order ASC`,[h]):{rows:[]};return{id:b.rows[0].id,name:b.rows[0].name,username:b.rows[0].username,trainerDietNote:b.rows[0].trainer_note,exerciseItems:i.rows.map((b,c)=>({id:b.id||`${a}-${c}`,label:b.label,sortOrder:b.sort_order,videoUrl:b.video_url??null})),checklistHistory:c.rows.map(a=>{let b="string"==typeof a.date?a.date:new Date(a.date).toISOString().slice(0,10),c=a.total||0,d=a.checked||0,e=c>0?Math.round(d/c*100):0;return{date:b,totalItems:c,completedItems:d,completionPct:e}})}}async function i(){let a=await (0,d.query)("SELECT COUNT(*)::int AS count FROM admins");return parseInt(a.rows[0]?.count||"0",10)}async function j(){return(await (0,d.query)("SELECT id, username, created_at FROM admins ORDER BY created_at DESC")).rows.map(a=>({id:a.id,username:a.username,joinedDate:a.created_at}))}[d]=f.then?(await f)():f,a.s(["getClientDetail",()=>h,"getClientsWithStats",()=>g,"getTrainerCount",()=>i,"getTrainersWithStats",()=>j]),c()}catch(a){c(a)}},!1),94091,a=>{"use strict";a.s(["ClientDetail",()=>b]);let b=(0,a.i(69e3).registerClientReference)(function(){throw Error("Attempted to call ClientDetail() from the server but ClientDetail is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"[project]/brutal-fit/components/admin/ClientDetail.tsx <module evaluation>","ClientDetail")},69656,a=>{"use strict";a.s(["ClientDetail",()=>b]);let b=(0,a.i(69e3).registerClientReference)(function(){throw Error("Attempted to call ClientDetail() from the server but ClientDetail is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"[project]/brutal-fit/components/admin/ClientDetail.tsx","ClientDetail")},74807,a=>{"use strict";a.i(94091);var b=a.i(69656);a.n(b)},65753,a=>a.a(async(b,c)=>{try{var d=a.i(94794);a.i(3166);var e=a.i(70079),f=a.i(76926),g=a.i(65846),h=a.i(74807),i=b([f,g]);async function j({params:a}){await (0,f.requireHQ)();let{id:b}=await a,c=await (0,g.getClientDetail)(b);return c||(0,e.notFound)(),(0,d.jsx)("section",{className:"section-space py-16",children:(0,d.jsx)(h.ClientDetail,{client:c,isHQ:!0})})}[f,g]=i.then?(await i)():i,a.s(["default",()=>j]),c()}catch(a){c(a)}},!1)];

//# sourceMappingURL=%5Broot-of-the-server%5D__87a1983c._.js.map