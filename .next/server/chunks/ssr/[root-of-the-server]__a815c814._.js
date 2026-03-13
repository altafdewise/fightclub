module.exports=[93695,(a,b,c)=>{b.exports=a.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},54799,(a,b,c)=>{b.exports=a.x("crypto",()=>require("crypto"))},23862,a=>a.a(async(b,c)=>{try{let b=await a.y("pg-587764f78a6c7a9c");a.n(b),c()}catch(a){c(a)}},!0),70864,a=>{a.n(a.i(33290))},43619,a=>{a.n(a.i(79962))},13718,a=>{a.n(a.i(85523))},18198,a=>{a.n(a.i(45518))},62212,a=>{a.n(a.i(66114))},39900,a=>{"use strict";a.s(["HQNavigation",()=>b]);let b=(0,a.i(11857).registerClientReference)(function(){throw Error("Attempted to call HQNavigation() from the server but HQNavigation is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"[project]/components/admin/HQNavigation.tsx <module evaluation>","HQNavigation")},26772,a=>{"use strict";a.s(["HQNavigation",()=>b]);let b=(0,a.i(11857).registerClientReference)(function(){throw Error("Attempted to call HQNavigation() from the server but HQNavigation is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"[project]/components/admin/HQNavigation.tsx","HQNavigation")},91655,a=>{"use strict";a.i(39900);var b=a.i(26772);a.n(b)},16479,a=>{"use strict";a.s(["HQLeadsView",()=>b]);let b=(0,a.i(11857).registerClientReference)(function(){throw Error("Attempted to call HQLeadsView() from the server but HQLeadsView is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"[project]/components/admin/HQLeadsView.tsx <module evaluation>","HQLeadsView")},3569,a=>{"use strict";a.s(["HQLeadsView",()=>b]);let b=(0,a.i(11857).registerClientReference)(function(){throw Error("Attempted to call HQLeadsView() from the server but HQLeadsView is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"[project]/components/admin/HQLeadsView.tsx","HQLeadsView")},44734,a=>{"use strict";a.i(16479);var b=a.i(3569);a.n(b)},78110,a=>{"use strict";a.s([])},58720,a=>a.a(async(b,c)=>{try{var d=a.i(66879);a.i(78110);var e=b([d]);async function f(){await (0,d.query)(`
    create table if not exists pricing_leads (
      id uuid primary key default gen_random_uuid(),
      full_name text not null,
      phone_number text not null,
      email text not null,
      country text not null,
      currency text not null check (currency in ('USD', 'INR')),
      plan_id text not null check (plan_id in ('1m', '3m', '6m')),
      provider text not null check (provider in ('stripe', 'razorpay')),
      fitness_goal text null,
      preferred_contact_method text null,
      training_experience text null,
      payment_link text null,
      status text not null default 'new',
      admin_notified_at timestamptz null,
      notification_error text null,
      created_at timestamptz not null default now()
    )
  `),await (0,d.query)(`
    alter table pricing_leads
      add column if not exists status text not null default 'new'
  `),await (0,d.query)(`
    create index if not exists pricing_leads_created_at_idx
      on pricing_leads (created_at desc)
  `)}async function g(){return await f(),(await (0,d.query)(`select
      id,
      full_name,
      phone_number,
      email,
      country,
      currency,
      plan_id,
      provider,
      fitness_goal,
      preferred_contact_method,
      training_experience,
      payment_link,
      status,
      created_at
     from pricing_leads
     order by created_at desc`)).rows}[d]=e.then?(await e)():e,a.s(["listPricingLeads",()=>g]),c()}catch(a){c(a)}},!1),26083,a=>a.a(async(b,c)=>{try{var d=a.i(7997),e=a.i(9223),f=a.i(44734),g=a.i(91655),h=a.i(58720),i=b([e,h]);async function j(){await (0,e.requireHQ)();let a=await (0,h.listPricingLeads)();return(0,d.jsxs)("section",{className:"section-space py-16 space-y-8",children:[(0,d.jsx)(g.HQNavigation,{}),(0,d.jsxs)("div",{className:"space-y-2",children:[(0,d.jsx)("p",{className:"text-xs uppercase tracking-[0.15em] text-white/45 font-medium",children:"Headquarters"}),(0,d.jsx)("h1",{className:"text-3xl md:text-4xl font-bold text-white",children:"Pricing Leads"}),(0,d.jsx)("p",{className:"text-sm text-white/58",children:"Review new leads, open details, and move them through contact to payment."})]}),(0,d.jsx)(f.HQLeadsView,{initialLeads:a})]})}[e,h]=i.then?(await i)():i,a.s(["default",()=>j]),c()}catch(a){c(a)}},!1)];

//# sourceMappingURL=%5Broot-of-the-server%5D__a815c814._.js.map