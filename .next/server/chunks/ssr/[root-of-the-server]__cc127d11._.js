module.exports=[93695,(a,b,c)=>{b.exports=a.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},54799,(a,b,c)=>{b.exports=a.x("crypto",()=>require("crypto"))},91279,a=>a.a(async(b,c)=>{try{let b=await a.y("pg-dcf270bf3659e986");a.n(b),c()}catch(a){c(a)}},!0),23748,a=>{a.n(a.i(22509))},54495,a=>{a.n(a.i(52474))},91987,a=>{a.n(a.i(93291))},93108,a=>{a.n(a.i(3423))},5336,a=>{a.n(a.i(16270))},95341,(a,b,c)=>{"use strict";function d(a){if("function"!=typeof WeakMap)return null;var b=new WeakMap,c=new WeakMap;return(d=function(a){return a?c:b})(a)}c._=function(a,b){if(!b&&a&&a.__esModule)return a;if(null===a||"object"!=typeof a&&"function"!=typeof a)return{default:a};var c=d(b);if(c&&c.has(a))return c.get(a);var e={__proto__:null},f=Object.defineProperty&&Object.getOwnPropertyDescriptor;for(var g in a)if("default"!==g&&Object.prototype.hasOwnProperty.call(a,g)){var h=f?Object.getOwnPropertyDescriptor(a,g):null;h&&(h.get||h.set)?Object.defineProperty(e,g,h):e[g]=a[g]}return e.default=a,c&&c.set(a,e),e}},37575,(a,b,c)=>{let{createClientModuleProxy:d}=a.r(69e3);a.n(d("[project]/brutal-fit/node_modules/next/dist/client/app-dir/link.js <module evaluation>"))},32417,(a,b,c)=>{let{createClientModuleProxy:d}=a.r(69e3);a.n(d("[project]/brutal-fit/node_modules/next/dist/client/app-dir/link.js"))},76607,a=>{"use strict";a.i(37575);var b=a.i(32417);a.n(b)},43985,(a,b,c)=>{"use strict";Object.defineProperty(c,"__esModule",{value:!0});var d={default:function(){return i},useLinkStatus:function(){return h.useLinkStatus}};for(var e in d)Object.defineProperty(c,e,{enumerable:!0,get:d[e]});let f=a.r(95341),g=a.r(94794),h=f._(a.r(76607));function i(a){let b=a.legacyBehavior,c="string"==typeof a.children||"number"==typeof a.children||"string"==typeof a.children?.type,d=a.children?.type?.$$typeof===Symbol.for("react.client.reference");return!b||c||d||(a.children?.type?.$$typeof===Symbol.for("react.lazy")?console.error("Using a Lazy Component as a direct child of `<Link legacyBehavior>` from a Server Component is not supported. If you need legacyBehavior, wrap your Lazy Component in a Client Component that renders the Link's `<a>` tag."):console.error("Using a Server Component as a direct child of `<Link legacyBehavior>` is not supported. If you need legacyBehavior, wrap your Server Component in a Client Component that renders the Link's `<a>` tag.")),(0,g.jsx)(h.default,{...a})}("function"==typeof c.default||"object"==typeof c.default&&null!==c.default)&&void 0===c.default.__esModule&&(Object.defineProperty(c.default,"__esModule",{value:!0}),Object.assign(c.default,c),b.exports=c.default)},41820,a=>a.a(async(b,c)=>{try{var d=a.i(59611),e=a.i(76926),f=b([d,e]);async function g(a,b){let c=await (0,d.query)("SELECT id, client_id, trainer_id, created_at FROM conversations WHERE client_id = $1 LIMIT 1",[a]);return c.rows[0]?c.rows[0]:await (0,d.transaction)(async c=>(await c.query(`INSERT INTO conversations (client_id, trainer_id)
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
     ORDER BY c.name`,[a])).rows}[d,e]=f.then?(await f)():f,a.s(["getConversationMetaForClient",()=>k,"getConversationMetaForHQ",()=>m,"getConversationMetaForTrainer",()=>l,"getMessagesForConversation",()=>h,"getUnreadCount",()=>j,"listAllConversationsForHQ",()=>n,"listAssignedClientsWithUnread",()=>o,"markMessagesRead",()=>i]),c()}catch(a){c(a)}},!1),34265,a=>{"use strict";a.s(["ChatWindow",()=>b]);let b=(0,a.i(69e3).registerClientReference)(function(){throw Error("Attempted to call ChatWindow() from the server but ChatWindow is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"[project]/brutal-fit/components/chat/ChatWindow.tsx <module evaluation>","ChatWindow")},50319,a=>{"use strict";a.s(["ChatWindow",()=>b]);let b=(0,a.i(69e3).registerClientReference)(function(){throw Error("Attempted to call ChatWindow() from the server but ChatWindow is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"[project]/brutal-fit/components/chat/ChatWindow.tsx","ChatWindow")},37464,a=>{"use strict";a.i(34265);var b=a.i(50319);a.n(b)},42753,a=>a.a(async(b,c)=>{try{var d=a.i(94794),e=a.i(43985),f=a.i(76926),g=a.i(41820),h=a.i(37464),i=b([f,g]);async function j(){let a=await (0,f.requireClient)();try{let{conversation:b,trainerName:c}=await (0,g.getConversationMetaForClient)(a.id),{messages:f,hasMore:i}=await (0,g.getMessagesForConversation)(b.id,{limit:30}),j=await (0,g.getUnreadCount)(b.id,"client");return await (0,g.markMessagesRead)(b.id,"client"),(0,d.jsxs)("section",{className:"section-space py-14 space-y-6",children:[(0,d.jsxs)("div",{className:"flex items-center justify-between gap-3",children:[(0,d.jsxs)("div",{children:[(0,d.jsx)("p",{className:"text-xs uppercase tracking-[0.2em] text-white/50",children:"Client Portal"}),(0,d.jsx)("h1",{className:"text-3xl md:text-4xl font-semibold",children:"Messages"}),(0,d.jsx)("p",{className:"text-sm text-white/60 mt-1",children:"Chat with your trainer in real time."})]}),(0,d.jsx)(e.default,{href:"/portal",className:"inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/[0.02] px-4 py-2.5 text-sm font-medium text-white/80 transition hover:bg-white/[0.06]",children:"Back"})]}),(0,d.jsx)(h.ChatWindow,{conversationId:b.id,clientId:b.client_id,trainerId:b.trainer_id,viewerRole:"client",peerName:`Trainer • ${c}`,initialMessages:f,initialUnreadCount:j,initialHasMore:i})]})}catch(a){return(0,d.jsx)("section",{className:"section-space py-16 space-y-6",children:(0,d.jsxs)("div",{className:"rounded-[24px] border border-white/15 bg-white/[0.04] px-6 py-6",children:[(0,d.jsx)("h2",{className:"text-2xl font-semibold mb-2",children:"Messages"}),(0,d.jsx)("p",{className:"text-white/70 text-sm",children:a?.message||"No trainer is assigned to your account yet. Please contact support."})]})})}}[f,g]=i.then?(await i)():i,a.s(["default",()=>j,"dynamic",0,"force-dynamic"]),c()}catch(a){c(a)}},!1)];

//# sourceMappingURL=%5Broot-of-the-server%5D__cc127d11._.js.map