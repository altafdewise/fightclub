module.exports=[20635,(e,t,a)=>{t.exports=e.x("next/dist/server/app-render/action-async-storage.external.js",()=>require("next/dist/server/app-render/action-async-storage.external.js"))},18622,(e,t,a)=>{t.exports=e.x("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js",()=>require("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js"))},56704,(e,t,a)=>{t.exports=e.x("next/dist/server/app-render/work-async-storage.external.js",()=>require("next/dist/server/app-render/work-async-storage.external.js"))},32319,(e,t,a)=>{t.exports=e.x("next/dist/server/app-render/work-unit-async-storage.external.js",()=>require("next/dist/server/app-render/work-unit-async-storage.external.js"))},24725,(e,t,a)=>{t.exports=e.x("next/dist/server/app-render/after-task-async-storage.external.js",()=>require("next/dist/server/app-render/after-task-async-storage.external.js"))},54799,(e,t,a)=>{t.exports=e.x("crypto",()=>require("crypto"))},23862,e=>e.a(async(t,a)=>{try{let t=await e.y("pg-587764f78a6c7a9c");e.n(t),a()}catch(e){a(e)}},!0),70406,(e,t,a)=>{t.exports=e.x("next/dist/compiled/@opentelemetry/api",()=>require("next/dist/compiled/@opentelemetry/api"))},93695,(e,t,a)=>{t.exports=e.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},62294,e=>e.a(async(t,a)=>{try{var n=e.i(23862),i=t([n]);[n]=i.then?(await i)():i;let o=process.env.DATABASE_URL;if(!o)throw Error("DATABASE_URL is not set.");let l=new n.Pool({connectionString:o});async function r(e,t=[]){return await l.query(e,t)}async function s(e){let t=await l.connect();try{await t.query("BEGIN");let a=await e(t);return await t.query("COMMIT"),a}catch(e){throw await t.query("ROLLBACK"),e}finally{t.release()}}e.s(["query",()=>r,"transaction",()=>s]),a()}catch(e){a(e)}},!1),93759,e=>e.a(async(t,a)=>{try{var n=e.i(54799),i=e.i(62294),r=t([i]);[i]=r.then?(await r)():r;async function s(e){let t=n.default.randomBytes(32).toString("hex"),a=new Date(Date.now()+6048e5);return await (0,i.query)(`INSERT INTO sessions (session_token, type, admin_id, client_id, expires_at)
     VALUES ($1, $2, $3, $4, $5)`,[t,e.type,e.adminId||null,e.clientId||null,a]),{sessionToken:t,expiresAt:a}}async function o(e){await (0,i.query)("DELETE FROM sessions WHERE session_token = $1",[e])}e.s(["createSession",()=>s,"deleteSession",()=>o]),a()}catch(e){a(e)}},!1),24361,(e,t,a)=>{t.exports=e.x("util",()=>require("util"))},14747,(e,t,a)=>{t.exports=e.x("path",()=>require("path"))},58594,e=>e.a(async(t,a)=>{try{var n=e.i(62294),i=t([n]);async function r(e){let t=await (0,n.query)(`SELECT trainer_id
     FROM client_trainer_assignments
     WHERE client_id = $1
     LIMIT 1`,[e]);return t.rows[0]?.trainer_id||null}function s(){let e=new Date,t=new Date(e),a=t.getUTCDay();t.setUTCDate(t.getUTCDate()-(0===a?6:a-1)),t.setUTCHours(0,0,0,0);let n=new Date(t);return n.setUTCDate(n.getUTCDate()+7),{start:t,end:n}}function o(){let e=s().end,t=new Date,a=e.getTime()-t.getTime();return Math.max(0,Math.ceil(a/864e5))}async function l(e){let{start:t,end:a}=s();return(await (0,n.query)(`SELECT *
     FROM weekly_checkins
     WHERE client_id = $1
       AND created_at >= $2
       AND created_at < $3
     ORDER BY created_at DESC
     LIMIT 1`,[e,t.toISOString(),a.toISOString()])).rows[0]||null}async function c(e){let t=await r(e.clientId);return(await (0,n.query)(`INSERT INTO weekly_checkins (
       client_id,
       trainer_id,
       weight,
       energy_level,
       sleep_quality,
       workout_adherence,
       diet_adherence,
       notes
     ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,[e.clientId,t,e.weight??null,e.energyLevel??null,e.sleepQuality??null,e.workoutAdherence??null,e.dietAdherence??null,e.notes??null])).rows[0]}async function d(e,t,a){return(await (0,n.query)(`UPDATE weekly_checkins
     SET trainer_feedback = $1,
         trainer_replied_at = NOW()
     WHERE id = $2 AND trainer_id = $3
     RETURNING *`,[a,e,t])).rows[0]||null}async function u(e){return(await (0,n.query)(`SELECT *
     FROM weekly_checkins
     WHERE client_id = $1
     ORDER BY created_at DESC`,[e])).rows}async function p(e){return(await (0,n.query)(`SELECT wc.*, c.name AS client_name
     FROM weekly_checkins wc
     JOIN clients c ON c.id = wc.client_id
     WHERE wc.id = $1
     LIMIT 1`,[e])).rows[0]||null}[n]=i.then?(await i)():i,e.s(["addTrainerFeedback",()=>d,"createCheckin",()=>c,"getCheckinById",()=>p,"getClientCheckinHistory",()=>u,"getCurrentWeekCheckin",()=>l,"getDaysUntilNextWeek",()=>o]),a()}catch(e){a(e)}},!1),94139,e=>{"use strict";function t(e){return e.toISOString().slice(0,10)}function a(){return t(new Date)}function n(e){let a=[],n=new Date;for(let i=0;i<e;i+=1){let e=new Date(n);e.setUTCDate(n.getUTCDate()-i),a.push(t(e))}return a}e.s(["lastNDaysKeys",()=>n,"toDateKey",()=>t,"todayKey",()=>a])},48088,e=>e.a(async(t,a)=>{try{var n=e.i(62294),i=e.i(58594),r=e.i(94139),s=t([n,i]);async function o(e,t){let{checklistId:a}=await u(e,t),i=await (0,n.query)(`SELECT COUNT(*)::int AS total,
            COALESCE(SUM(CASE WHEN checked THEN 1 ELSE 0 END),0)::int AS checked
     FROM daily_checklist_items
     WHERE daily_checklist_id = $1`,[a]),r=i.rows[0]?.total||0,s=i.rows[0]?.checked||0,o=r>0?Math.floor(s/r*100):0;return{totalItems:r,completedItems:s,completionPct:o,isWinDay:o>=60}}async function l(e,t,a,i){let r={total:a.totalItems,completed:a.completedItems,pct:a.completionPct,win:a.isWinDay};i?.submitted?await (0,n.query)(`INSERT INTO client_day_summaries
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
         updated_at = NOW()`,[e,t,r.total,r.completed,r.pct,r.win]):await (0,n.query)(`INSERT INTO client_day_summaries
      (client_id, date, total_items, completed_items, completion_pct, is_win_day, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, NOW())
     ON CONFLICT (client_id, date)
     DO UPDATE SET
       total_items = EXCLUDED.total_items,
       completed_items = EXCLUDED.completed_items,
       completion_pct = EXCLUDED.completion_pct,
       is_win_day = EXCLUDED.is_win_day,
       updated_at = NOW()`,[e,t,r.total,r.completed,r.pct,r.win])}async function c(e,t){return(await (0,n.query)(`SELECT date, total_items, completed_items, completion_pct, is_submitted, is_win_day, submitted_at
     FROM client_day_summaries
     WHERE client_id = $1 AND date = $2
     LIMIT 1`,[e,t])).rows[0]||null}async function d(e){let t=new Date,a=new Date(t);a.setUTCDate(a.getUTCDate()-365);let i=(0,r.toDateKey)(a),s=(0,r.toDateKey)(t),o=await (0,n.query)(`SELECT date, is_submitted, is_win_day
     FROM client_day_summaries
     WHERE client_id = $1 AND date BETWEEN $2 AND $3`,[e,i,s]),l=new Map(o.rows.map(e=>[(0,r.toDateKey)(new Date(e.date)),{isSubmitted:e.is_submitted,isWinDay:e.is_win_day}])),c=0,d=0,u=new Date(a);for(;u<=t;){let e=(0,r.toDateKey)(u),t=l.get(e);t?.isSubmitted&&t.isWinDay?(d+=1)>c&&(c=d):d=0,u.setUTCDate(u.getUTCDate()+1)}let p=0,m=(0,r.toDateKey)(t),y=l.get(m),g=new Date(t);if(y?.isSubmitted){if(!y.isWinDay)return{current:0,best:c}}else g.setUTCDate(g.getUTCDate()-1);for(;;){let e=(0,r.toDateKey)(g),t=l.get(e);if(t?.isSubmitted&&t.isWinDay){p+=1,g.setUTCDate(g.getUTCDate()-1);continue}break}return{current:p,best:c}}async function u(e,t){let a=await (0,n.query)("SELECT id FROM daily_checklists WHERE client_id = $1 AND date = $2 LIMIT 1",[e,t]);return 0===a.rows.length?{checklistId:await (0,n.transaction)(async a=>(await a.query("INSERT INTO daily_checklists (client_id, date) VALUES ($1, $2) RETURNING id",[e,t])).rows[0].id),templateItems:[]}:{checklistId:a.rows[0].id,templateItems:[]}}async function p(e){let t=(0,r.todayKey)(),{checklistId:a}=await u(e,t),i=await o(e,t);await l(e,t,i);let s=await c(e,t),d=await (0,n.query)(`SELECT id, label, block_name, exercise_name, prescription, exercise_notes, checked, video_url
     FROM daily_checklist_items
     WHERE daily_checklist_id = $1
     ORDER BY sort_order ASC`,[a]),p=await (0,n.query)("SELECT note, note_html FROM trainer_notes WHERE client_id = $1 LIMIT 1",[e]);return{date:t,note:p.rows[0]?.note||"",noteHtml:p.rows[0]?.note_html||"",items:d.rows.map(e=>({id:e.id,label:e.label,blockName:e.block_name??"Workout",exerciseName:e.exercise_name??e.label,prescription:e.prescription??"",notes:e.exercise_notes??"",checked:e.checked,videoUrl:e.video_url??null})),summary:s?{date:s.date,totalItems:s.total_items,completedItems:s.completed_items,completionPct:s.completion_pct,isSubmitted:s.is_submitted,isWinDay:s.is_win_day}:{date:t,totalItems:i.totalItems,completedItems:i.completedItems,completionPct:i.completionPct,isSubmitted:!1,isWinDay:i.isWinDay}}}async function m(e){let t=(0,r.lastNDaysKeys)(7),a=await (0,n.query)(`SELECT dc.date,
            COUNT(dci.id)::int AS total,
            COALESCE(SUM(CASE WHEN dci.checked THEN 1 ELSE 0 END),0)::int AS checked
     FROM daily_checklists dc
     LEFT JOIN daily_checklist_items dci ON dci.daily_checklist_id = dc.id
     WHERE dc.client_id = $1 AND dc.date = ANY($2)
     GROUP BY dc.date`,[e,t]),i=new Map(a.rows.map(e=>[e.date,e]));return t.map(e=>{let t=i.get(e),a=t?.total||0,n=t?.checked||0,r=a>0?Math.round(n/a*100):0;return{date:e,completion:r,total:a,checked:n}})}async function y(e){return(await (0,n.query)(`SELECT id FROM client_undertakings
     WHERE client_id = $1 AND all_checkboxes_confirmed = true
     LIMIT 1`,[e])).rows.length>0}async function g(e,t){let a=await (0,n.query)(`INSERT INTO client_undertakings (client_id, all_checkboxes_confirmed, pdf_url)
     VALUES ($1, true, $2)
     RETURNING id, agreed_at`,[e,t]);if(0===a.rows.length)throw Error("Failed to create undertaking");return{id:a.rows[0].id,agreedAt:a.rows[0].agreed_at}}async function h(e){let t=await (0,n.query)(`SELECT id, agreed_at, pdf_url FROM client_undertakings
     WHERE client_id = $1 LIMIT 1`,[e]);return 0===t.rows.length?null:{id:t.rows[0].id,agreedAt:t.rows[0].agreed_at,pdfUrl:t.rows[0].pdf_url}}[n,i]=s.then?(await s)():s,e.s(["calculateDayStats",()=>o,"checkUndertakingExists",()=>y,"createUndertaking",()=>g,"getDaySummary",()=>c,"getHistoryPayload",()=>m,"getStreaks",()=>d,"getTodayPayload",()=>p,"getUndertakingByClientId",()=>h,"upsertDaySummary",()=>l]),a()}catch(e){a(e)}},!1),53586,e=>{"use strict";let t=new(e.i(46245)).Resend(process.env.RESEND_API_KEY);async function a({clientName:e,clientEmail:a,pdfBuffer:n,agreedAt:i}){let r=`BRUTAL-Undertaking-${e.replace(/\s+/g,"-")}-${i.toISOString().split("T")[0]}.pdf`,{data:s,error:o}=await t.emails.send({from:process.env.FROM_EMAIL||"BRUTAL <hello@brutal.fit>",to:["purvik@brutal.fit"],cc:[a],subject:`Undertaking Agreement - ${e}`,html:`
      <html>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background-color: #f5f5f5; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-top: 0;">New Undertaking Agreement Accepted</h2>

            <p style="color: #666; font-size: 14px; line-height: 1.6;">
              Client <strong>${e}</strong> (${a}) has reviewed and accepted the BRUTAL Coaching Undertaking Agreement.
            </p>

            <div style="background-color: #f9f9f9; border-left: 4px solid #000; padding: 15px; margin: 20px 0;">
              <p style="margin: 0; color: #666; font-size: 13px;">
                <strong>Date Accepted:</strong> ${i.toLocaleString("en-US",{timeZone:"UTC",year:"numeric",month:"long",day:"numeric",hour:"2-digit",minute:"2-digit"})} UTC
              </p>
            </div>

            <p style="color: #666; font-size: 14px;">
              The signed undertaking agreement is attached to this email. All required checkboxes were confirmed during submission.
            </p>

            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;" />

            <p style="color: #999; font-size: 12px;">
              This is an automated notification from the BRUTAL Client Portal system.
            </p>
          </div>
        </body>
      </html>
    `,text:`New Undertaking Agreement Accepted

Client ${e} (${a}) has accepted the BRUTAL Coaching Undertaking Agreement.

Date Accepted: ${i.toLocaleString("en-US")}

The signed agreement is attached.`,attachments:[{filename:r,content:n.toString("base64")}]});return o?(console.error("Failed to send undertaking PDF email:",o),{success:!1,error:o}):{success:!0,data:s}}e.s(["sendUndertakingPDF",()=>a])},46253,e=>e.a(async(t,a)=>{try{var n=e.i(68105),i=e.i(48088),r=e.i(82363),s=e.i(53586),o=t([n,i]);async function l(e){try{let t,a=await (0,n.requireClient)();if(await (0,i.checkUndertakingExists)(a.id))return new Response(JSON.stringify({message:"You have already accepted the undertaking agreement."}),{status:409,headers:{"Content-Type":"application/json"}});let{checkboxes:o}=await e.json();if(!o)return new Response(JSON.stringify({message:"Missing checkboxes data."}),{status:400,headers:{"Content-Type":"application/json"}});if(!(o.medicalNotTreatment&&o.disclosedHealthInfo&&o.trainerNodiagnose&&o.acceptResponsibility&&o.informOfChanges&&o.finalAgreement))return new Response(JSON.stringify({message:"Please confirm all checkboxes before submitting."}),{status:400,headers:{"Content-Type":"application/json"}});let l=new Date;try{t=await (0,r.generateUndertakingPDF)({id:a.id,name:a.name,email:a.email||void 0},l)}catch(e){return console.error("PDF generation error:",e),console.error("Error details:",{message:e.message,stack:e.stack}),new Response(JSON.stringify({message:"Failed to generate PDF.",error:e.message}),{status:500,headers:{"Content-Type":"application/json"}})}try{await (0,s.sendUndertakingPDF)({clientName:a.name,clientEmail:a.email||"",pdfBuffer:t,agreedAt:l})}catch(e){console.error("Email send error:",e)}let c=`undertakings/${a.id}-${l.getTime()}.pdf`;try{let e=await (0,i.createUndertaking)(a.id,c);return new Response(JSON.stringify({ok:!0,message:"Undertaking agreement accepted successfully.",pdfUrl:c,agreedAt:e.agreedAt}),{status:201,headers:{"Content-Type":"application/json"}})}catch(e){return console.error("Database error:",e),new Response(JSON.stringify({message:"Failed to save agreement to database."}),{status:500,headers:{"Content-Type":"application/json"}})}}catch(e){if(console.error("Undertaking submit error:",e),console.error("Error details:",{message:e.message,stack:e.stack}),e.message?.includes("not authenticated"))return new Response(JSON.stringify({message:"Not authenticated."}),{status:401,headers:{"Content-Type":"application/json"}});return new Response(JSON.stringify({message:e.message||"Internal server error."}),{status:500,headers:{"Content-Type":"application/json"}})}}[n,i]=o.then?(await o)():o,e.s(["POST",()=>l]),a()}catch(e){a(e)}},!1),50920,e=>e.a(async(t,a)=>{try{var n=e.i(47909),i=e.i(74017),r=e.i(96250),s=e.i(59756),o=e.i(61916),l=e.i(74677),c=e.i(69741),d=e.i(16795),u=e.i(87718),p=e.i(95169),m=e.i(47587),y=e.i(66012),g=e.i(70101),h=e.i(26937),E=e.i(10372),_=e.i(93695);e.i(52474);var w=e.i(5232),f=e.i(46253),R=t([f]);[f]=R.then?(await R)():R;let D=new n.AppRouteRouteModule({definition:{kind:i.RouteKind.APP_ROUTE,page:"/api/portal/undertaking/submit/route",pathname:"/api/portal/undertaking/submit",filename:"route",bundlePath:""},distDir:".next",relativeProjectDir:"",resolvedPagePath:"[project]/app/api/portal/undertaking/submit/route.ts",nextConfigOutput:"",userland:f}),{workAsyncStorage:C,workUnitAsyncStorage:x,serverHooks:S}=D;function T(){return(0,r.patchFetch)({workAsyncStorage:C,workUnitAsyncStorage:x})}async function k(e,t,a){D.isDev&&(0,s.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let n="/api/portal/undertaking/submit/route";n=n.replace(/\/index$/,"")||"/";let r=await D.prepare(e,t,{srcPage:n,multiZoneDraftMode:!1});if(!r)return t.statusCode=400,t.end("Bad Request"),null==a.waitUntil||a.waitUntil.call(a,Promise.resolve()),null;let{buildId:f,params:R,nextConfig:T,parsedUrl:k,isDraftMode:C,prerenderManifest:x,routerServerContext:S,isOnDemandRevalidate:N,revalidateOnlyGenerated:U,resolvedPathname:A,clientReferenceManifest:b,serverActionsManifest:O}=r,I=(0,c.normalizeAppPath)(n),v=!!(x.dynamicRoutes[I]||x.routes[A]),$=async()=>((null==S?void 0:S.render404)?await S.render404(e,t,k,!1):t.end("This page could not be found"),null);if(v&&!C){let e=!!x.routes[A],t=x.dynamicRoutes[I];if(t&&!1===t.fallback&&!e){if(T.experimental.adapterPath)return await $();throw new _.NoFallbackError}}let L=null;!v||D.isDev||C||(L=A,L="/index"===L?"/":L);let q=!0===D.isDev||!v,M=v&&!q;O&&b&&(0,l.setManifestsSingleton)({page:n,clientReferenceManifest:b,serverActionsManifest:O});let P=e.method||"GET",H=(0,o.getTracer)(),W=H.getActiveScopeSpan(),F={params:R,prerenderManifest:x,renderOpts:{experimental:{authInterrupts:!!T.experimental.authInterrupts},cacheComponents:!!T.cacheComponents,supportsDynamicResponse:q,incrementalCache:(0,s.getRequestMeta)(e,"incrementalCache"),cacheLifeProfiles:T.cacheLife,waitUntil:a.waitUntil,onClose:e=>{t.on("close",e)},onAfterTaskError:void 0,onInstrumentationRequestError:(t,a,n,i)=>D.onRequestError(e,t,n,i,S)},sharedContext:{buildId:f}},j=new d.NodeNextRequest(e),B=new d.NodeNextResponse(t),K=u.NextRequestAdapter.fromNodeNextRequest(j,(0,u.signalFromNodeResponse)(t));try{let r=async e=>D.handle(K,F).finally(()=>{if(!e)return;e.setAttributes({"http.status_code":t.statusCode,"next.rsc":!1});let a=H.getRootSpanAttributes();if(!a)return;if(a.get("next.span_type")!==p.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${a.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let i=a.get("next.route");if(i){let t=`${P} ${i}`;e.setAttributes({"next.route":i,"http.route":i,"next.span_name":t}),e.updateName(t)}else e.updateName(`${P} ${n}`)}),l=!!(0,s.getRequestMeta)(e,"minimalMode"),c=async s=>{var o,c;let d=async({previousCacheEntry:i})=>{try{if(!l&&N&&U&&!i)return t.statusCode=404,t.setHeader("x-nextjs-cache","REVALIDATED"),t.end("This page could not be found"),null;let n=await r(s);e.fetchMetrics=F.renderOpts.fetchMetrics;let o=F.renderOpts.pendingWaitUntil;o&&a.waitUntil&&(a.waitUntil(o),o=void 0);let c=F.renderOpts.collectedTags;if(!v)return await (0,y.sendResponse)(j,B,n,F.renderOpts.pendingWaitUntil),null;{let e=await n.blob(),t=(0,g.toNodeOutgoingHttpHeaders)(n.headers);c&&(t[E.NEXT_CACHE_TAGS_HEADER]=c),!t["content-type"]&&e.type&&(t["content-type"]=e.type);let a=void 0!==F.renderOpts.collectedRevalidate&&!(F.renderOpts.collectedRevalidate>=E.INFINITE_CACHE)&&F.renderOpts.collectedRevalidate,i=void 0===F.renderOpts.collectedExpire||F.renderOpts.collectedExpire>=E.INFINITE_CACHE?void 0:F.renderOpts.collectedExpire;return{value:{kind:w.CachedRouteKind.APP_ROUTE,status:n.status,body:Buffer.from(await e.arrayBuffer()),headers:t},cacheControl:{revalidate:a,expire:i}}}}catch(t){throw(null==i?void 0:i.isStale)&&await D.onRequestError(e,t,{routerKind:"App Router",routePath:n,routeType:"route",revalidateReason:(0,m.getRevalidateReason)({isStaticGeneration:M,isOnDemandRevalidate:N})},!1,S),t}},u=await D.handleResponse({req:e,nextConfig:T,cacheKey:L,routeKind:i.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:x,isRoutePPREnabled:!1,isOnDemandRevalidate:N,revalidateOnlyGenerated:U,responseGenerator:d,waitUntil:a.waitUntil,isMinimalMode:l});if(!v)return null;if((null==u||null==(o=u.value)?void 0:o.kind)!==w.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==u||null==(c=u.value)?void 0:c.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});l||t.setHeader("x-nextjs-cache",N?"REVALIDATED":u.isMiss?"MISS":u.isStale?"STALE":"HIT"),C&&t.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let p=(0,g.fromNodeOutgoingHttpHeaders)(u.value.headers);return l&&v||p.delete(E.NEXT_CACHE_TAGS_HEADER),!u.cacheControl||t.getHeader("Cache-Control")||p.get("Cache-Control")||p.set("Cache-Control",(0,h.getCacheControlHeader)(u.cacheControl)),await (0,y.sendResponse)(j,B,new Response(u.value.body,{headers:p,status:u.value.status||200})),null};W?await c(W):await H.withPropagatedContext(e.headers,()=>H.trace(p.BaseServerSpan.handleRequest,{spanName:`${P} ${n}`,kind:o.SpanKind.SERVER,attributes:{"http.method":P,"http.target":e.url}},c))}catch(t){if(t instanceof _.NoFallbackError||await D.onRequestError(e,t,{routerKind:"App Router",routePath:I,routeType:"route",revalidateReason:(0,m.getRevalidateReason)({isStaticGeneration:M,isOnDemandRevalidate:N})},!1,S),v)throw t;return await (0,y.sendResponse)(j,B,new Response(null,{status:500})),null}}e.s(["handler",()=>k,"patchFetch",()=>T,"routeModule",()=>D,"serverHooks",()=>S,"workAsyncStorage",()=>C,"workUnitAsyncStorage",()=>x]),a()}catch(e){a(e)}},!1),24640,e=>{e.v(e=>Promise.resolve().then(()=>e(37072)))}];

//# sourceMappingURL=%5Broot-of-the-server%5D__e758ed02._.js.map