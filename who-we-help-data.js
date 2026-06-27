/* Day One MVP™ — audience pathway content (rendered by audience.js on audience.html?a=<slug>). */
window.AUDIENCE = {
  order: ["founders","small-business","nonprofits","youth-in-tech"],
  people: {
    "founders": {
      title:"The Founder", eyebrow:"Who We Help · Founders",
      headline:"The idea doesn't need to be finished. It needs a responsible first move.",
      intro:"For the person carrying an idea but unsure where to begin.",
      reality:"You don't need a finished business plan, technical language, or every feature figured out. You can begin by explaining the idea in your own words — and we help find the real customer, the offer, and the first thing actually worth building.",
      carrying:["The idea has lived in your head for years","You have too many ideas and can't pick one","You don't know who to trust to build it","You can't translate the idea into technical terms","A previous builder disappeared or overcharged","You're afraid of building the wrong thing","You think you need the whole plan before starting"],
      build:["Idea audit + prioritization","Business + offer design","A prototype or Blueprint","Pricing and revenue model","A founder or investor one-pager","A Working Alpha, then an MVP","A launch system","Operator training + ongoing advisory"],
      paths:[{label:"Idea Session",href:"tier.html?p=idea-session"},{label:"Blueprint",href:"tier.html?p=blueprint"},{label:"Working Alpha",href:"tier.html?p=working-alpha"},{label:"MVP Launch",href:"tier.html?p=mvp-launch"}],
      services:[{label:"Idea Discovery",slug:"idea-discovery"},{label:"Offer Design",slug:"offer-design"},{label:"Positioning",slug:"positioning"},{label:"MVPs",slug:"mvps"}],
      buildsHref:"build.html?cat=start-the-company", buildsLabel:"Explore Start the Company",
      cta:{label:"Book an Operated Call™", href:"start.html?path=founder"},
      status:"Founder-led from the first conversation. You'll get an honest read on the most responsible first move — even if that's “not yet.”",
      prev:"youth-in-tech", next:"small-business" },

    "small-business": {
      title:"The Small-Business Owner", eyebrow:"Who We Help · Small Business",
      headline:"Compete with stronger systems — not a larger payroll.",
      intro:"For the owner going up against bigger teams, budgets, and technology.",
      reality:"You're doing several jobs at once. Leads get missed, follow-up slips, tools don't talk to each other, and technology decisions feel expensive and confusing. The goal isn't more software — it's a stronger way of operating.",
      carrying:["The owner performs several roles","Leads are answered inconsistently","Tools don't connect to each other","Customers expect modern experiences","The business depends on memory","Marketing creates activity but not visibility","Tech decisions feel risky and costly"],
      build:["Website + lead system","CRM, booking, and a customer portal","Estimates / quote flow","Follow-up + review system","A local-search foundation","Staff workflow + AI assistance","Training + media"],
      research:{ title:"Small businesses are the economy, not a niche.", body:"Small businesses make up the large majority of U.S. employers and nearly half of private-sector jobs — yet larger companies have far more access to technology teams and AI. Leveling that is the point." },
      paths:[{label:"Small-Business Path",href:"tier.html?p=community-rate"},{label:"Idea Session",href:"tier.html?p=idea-session"},{label:"Blueprint",href:"tier.html?p=blueprint"}],
      services:[{label:"Websites",slug:"websites"},{label:"CRM Systems",slug:"crm-systems"},{label:"Booking Systems",slug:"booking-systems"},{label:"Automation",slug:"automation"},{label:"Local SEO",slug:"local-seo"},{label:"Reputation",slug:"reputation"}],
      buildsHref:"build.html?cat=install-the-systems", buildsLabel:"Explore Install the Systems",
      cta:{label:"Book a Fit Call", href:"start.html?path=small-business"},
      status:"The Small-Business Path is a fit-based conversation, not automatic discount pricing — it may lead to a smaller scope, a phased build, a pilot, or a relationship rate.",
      prev:"founders", next:"nonprofits" },

    "nonprofits": {
      title:"The Nonprofit", eyebrow:"Who We Help · Nonprofits",
      headline:"Build capacity without losing the mission.",
      intro:"For the organization doing meaningful work while its people carry too much.",
      reality:"Technology shouldn't be treated as overhead disconnected from the mission. Done right, it strengthens outreach, volunteer coordination, staff capacity, communication, training, fundraising, and service delivery.",
      carrying:["Staff are carrying too many roles","Funding is restricted to programs","Systems are outdated","Donor and volunteer info is fragmented","Mission delivery depends on manual work","Technical language alienates the team","A failed implementation is a real risk"],
      build:["Intake systems","Volunteer portals","Donor journeys","Training + learning programs","Reporting dashboards","Communication systems","Community media","Responsible AI policy","A grant-ready technology roadmap"],
      paths:[{label:"Idea Session",href:"tier.html?p=idea-session"},{label:"Blueprint",href:"tier.html?p=blueprint"},{label:"Small-Business Path",href:"tier.html?p=community-rate"}],
      services:[{label:"Customer Portals",slug:"customer-portals"},{label:"CRM Systems",slug:"crm-systems"},{label:"Onboarding",slug:"onboarding"},{label:"Reporting",slug:"reporting"},{label:"Knowledge Systems",slug:"knowledge-systems"},{label:"Customer Communication",slug:"customer-communication"}],
      buildsHref:"build.html?cat=install-the-systems", buildsLabel:"Explore Install the Systems",
      cta:{label:"Discuss a Nonprofit Build", href:"start.html?path=nonprofit"},
      status:"Special nonprofit pricing or pilot consideration is discretionary and based on fit, mission, and budget — discussed case by case, never promised in advance.",
      prev:"small-business", next:"youth-in-tech" },

    "youth-in-tech": {
      title:"The Young Person", eyebrow:"Who We Help · Youth in Tech",
      headline:"Don't only consume the future. Learn how to build it.",
      intro:"For the student, creator, or future entrepreneur who's never been shown they belong in technology.",
      reality:"Young people should have the chance to build the future, not just scroll it. That means real, hands-on exposure to AI, coding, design, product, sales, and creative technology — in a safe, age-appropriate way.",
      carrying:["AI literacy + prompting","Coding + website building","Product thinking + design","Sales + entrepreneurship","Audio + video + creative technology","Digital safety + citizenship","Mentorship + portfolio development"],
      programs:[
        {name:"First Build Workshop", status:"In Development"},
        {name:"AI Literacy Basics", status:"Future Program"},
        {name:"Creative Technology Lab", status:"Seeking Partners"},
        {name:"Digital Safety Program", status:"In Development"},
        {name:"Mentor Partnerships", status:"Seeking Partners"},
        {name:"Portfolio Track", status:"Applications Opening Later"}
      ],
      safety:["Age-appropriate design","Privacy by default","Human supervision","Clear consent","Safe communication","No false promises of jobs or income"],
      cta:{label:"Explore Youth in Tech", href:"start.html?path=youth"},
      secondaryCta:{label:"Partner With Day One MVP™", href:"start.html?path=youth-partner"},
      status:"Youth programs are in development. Nothing here promises employment or income — this is about access, skills, and safe opportunity.",
      prev:"nonprofits", next:"founders" }
  }
};
