/* Day One MVP™ — Interactive "What We Build" world data.
   One file powers every category hub + service page via build.html.
   Add services here; build.js renders + links them automatically.
   status: "live" = full page renders & is clickable. "dev" = tile shows,
   labeled "In Development", not a dead link. Never ship empty live pages. */
window.BUILD = {
  categories: [
    {
      slug: "start-the-company", n: "01", title: "Start the Company",
      theme: "From a raw idea to a real business foundation.",
      promise: "Turn a raw idea into a company people can understand, trust, and buy from.",
      mission: "Before anything gets built, the company itself has to make sense — who it's for, what it promises, how it makes money, and what it's called. This is where the idea becomes a business.",
      order: ["idea-discovery","customer-definition","positioning","offer-design","pricing","revenue-model","naming","brand-architecture","company-structure","launch-planning","investor-partner-materials","market-research"],
      next: "build-the-product"
    },
    { slug: "build-the-product", n: "02", title: "Build the Product", theme: "From a plan to a working digital product.", promise: "Turn the business idea into something people can actually use.", mission: "", order: ["websites","web-applications","mvps","customer-portals","staff-portals","dashboards","booking-systems","quote-systems","marketplaces","membership-platforms","internal-tools","specialized-digital-products"], next: "install-the-systems" },
    { slug: "install-the-systems", n: "03", title: "Install the Systems", theme: "From manual work to coordinated operations.", promise: "Turn repeated work into an organized operating system.", mission: "", order: ["ai-assistants","crm-systems","automation","lead-routing","email-sms-workflows","onboarding","reporting","knowledge-systems","staff-workflows","customer-communication","internal-operations","integrations"], next: "grow-the-business" },
    { slug: "grow-the-business", n: "04", title: "Grow the Business", theme: "From attention to customers and revenue.", promise: "Turn attention into customers, customers into advocates, activity into measurable growth.", mission: "", order: ["offer-design-atom","sales-systems","marketing-campaigns","lead-generation","follow-up","content-strategy","local-seo","search-readiness","reputation","referral-systems","conversion-improvement","retention","digital-marketing","partnerships"], next: "train-the-people" },
    { slug: "train-the-people", n: "05", title: "Train the People", theme: "From systems to human capability.", promise: "A system is only as strong as the people trusted to use it.", mission: "", order: ["ai-foundations","sales-training","employee-onboarding","founder-education","operator-training","workshops","internal-academies","training-videos","learning-portals","role-play-systems","custom-company-programs","certification"], next: "produce-the-media" },
    { slug: "produce-the-media", n: "06", title: "Produce the Media", theme: "From invisible value to visible proof.", promise: "Make the value visible, understandable, memorable, and shareable.", mission: "", order: ["audio","video","podcasts","product-demonstrations","founder-content","social-clips","skits","training-media","commercial-content","campaign-media","sound-design","jingles","voiceover","content-repurposing","publishing-systems","photography","presentations","motion-graphics"], next: "start-the-company" }
  ],

  services: {
    /* ===== WORLD 1 — START THE COMPANY (live) ===== */
    "idea-discovery": { cat:"start-the-company", title:"Idea Discovery", clue:"Find the strongest opportunity hidden inside the original idea.",
      heroQuestion:"What is the real opportunity inside your idea?",
      definition:"Idea discovery is the work of pulling apart a rough idea to find the strongest, most buildable opportunity inside it — often not the first version you walked in with.",
      whyItMatters:"Most ideas are actually three ideas tangled together. Building before you separate them wastes the money on the wrong one.",
      businessExample:"A barber wants \"an app.\" Discovery reveals the real win is killing no-shows with booking + reminders — a far smaller, faster build.",
      whatWeBuild:["A clear problem statement","A short list of the strongest opportunities","A recommendation for what to build first"],
      commonMistake:"Falling in love with the feature instead of the outcome the customer actually wants.",
      jackQuestion:"If we could only fix one thing for your customer, what would hurt most to leave broken?",
      related:["customer-definition","positioning","offer-design"], prev:null, next:"customer-definition", status:"live" },

    "customer-definition": { cat:"start-the-company", title:"Customer Definition", clue:"Decide exactly who this is for — and who it isn't.",
      heroQuestion:"Who is this actually for?",
      definition:"Customer definition is naming the specific person who has this problem badly enough to pay to solve it — and being honest about who you're not for.",
      whyItMatters:"\"Everyone\" is not a customer. A vague audience makes the offer, the message, and the marketing vague too.",
      businessExample:"A cleaning company that targets \"busy two-income households near move-out dates\" writes sharper ads than one targeting \"anyone who needs cleaning.\"",
      whatWeBuild:["A primary customer profile","Their real pains and goals","Who to deliberately exclude"],
      commonMistake:"Widening the audience to feel safer — which makes everything weaker.",
      jackQuestion:"Who would be genuinely upset if this didn't exist?",
      related:["idea-discovery","positioning","offer-design"], prev:"idea-discovery", next:"positioning", status:"live" },

    "positioning": { cat:"start-the-company", title:"Positioning", clue:"Claim the one place you win in the customer's mind.",
      heroQuestion:"Why you instead of the alternative?",
      definition:"Positioning is the single, clear place you occupy in the customer's mind — what you're the obvious choice for, against the real alternatives.",
      whyItMatters:"If you don't choose your position, the market chooses a worse one for you — usually \"cheaper.\"",
      businessExample:"A bakery positioned as \"the custom-cake people for big moments\" competes on craft, not on being the closest or cheapest.",
      whatWeBuild:["A one-line positioning statement","The alternatives you're measured against","The proof that backs the claim"],
      commonMistake:"Trying to be everything to everyone, which positions you as nothing in particular.",
      jackQuestion:"Finish this sentence: we're the only ones who ___.",
      related:["customer-definition","offer-design","brand-architecture"], prev:"customer-definition", next:"offer-design", status:"live" },

    "offer-design": { cat:"start-the-company", title:"Offer Design", clue:"Shape what they're actually buying — and why it's a yes.",
      heroQuestion:"What are you actually asking the customer to buy?",
      definition:"Offer design is shaping the promise, the deliverable, and the terms into something a customer can understand fast and say yes to.",
      whyItMatters:"A great product with a confusing offer doesn't sell. The offer is what people actually buy.",
      businessExample:"\"We'll build your booking system in 2 weeks for a fixed price, or you don't pay\" closes better than \"custom software, hourly.\"",
      whatWeBuild:["A clear core offer","What's included and excluded","The reason to act now"],
      commonMistake:"Listing features instead of the result the customer gets.",
      jackQuestion:"Can the customer explain what you sell after hearing it once?",
      related:["pricing","positioning","revenue-model"], prev:"positioning", next:"pricing", status:"live" },

    "pricing": { cat:"start-the-company", title:"Pricing", clue:"Set a number the value supports and the buyer believes.",
      heroQuestion:"What is this worth to the person buying it?",
      definition:"Pricing is setting a number the value clearly supports, the customer believes, and the business can survive on.",
      whyItMatters:"Price too low and you can't deliver well; too high with no proof and nobody buys. Price is a message about value.",
      businessExample:"Charging a flat $3,500 for a clear outcome reads as more trustworthy than a vague \"starting at $99\" that balloons later.",
      whatWeBuild:["A pricing model that fits the offer","Tiers or a single clear price","The value story behind the number"],
      commonMistake:"Pricing off your costs instead of the customer's outcome.",
      jackQuestion:"What does solving this problem save or earn them?",
      related:["offer-design","revenue-model","customer-definition"], prev:"offer-design", next:"revenue-model", status:"live" },

    "revenue-model": { cat:"start-the-company", title:"Revenue Model", clue:"Decide how the money actually comes in — and repeats.",
      heroQuestion:"How does this make money, again and again?",
      definition:"A revenue model is the structure of how money comes in — one-time, recurring, usage-based, or a mix — and whether it can repeat.",
      whyItMatters:"A sale is an event; a revenue model is a machine. The model decides whether good months become a stable business.",
      businessExample:"A trainer who adds a $99/month membership turns one-off sessions into predictable monthly income.",
      whatWeBuild:["The revenue structure","One-time vs recurring logic","Simple expansion paths"],
      commonMistake:"Relying only on one-time sales and starting from zero every month.",
      jackQuestion:"What would a customer happily keep paying for?",
      related:["pricing","offer-design","company-structure"], prev:"pricing", next:"naming", status:"live" },

    "naming": { cat:"start-the-company", title:"Naming", clue:"A name people can say, spell, find, and remember.",
      heroQuestion:"Can people say it, spell it, and find it?",
      definition:"Naming is choosing a company or product name that's memorable, sayable, available, and pointed in the right direction.",
      whyItMatters:"A confusing name leaks customers at every step — search, word of mouth, and trust.",
      businessExample:"A plain, clear name with a matching domain beats a clever misspelled one nobody can type.",
      whatWeBuild:["Name directions","Domain and handle checks","A shortlist with rationale"],
      commonMistake:"Picking a clever name before checking if the domain and socials are even available.",
      jackQuestion:"If you said the name out loud at a noisy event, could they find it later?",
      related:["positioning","brand-architecture","offer-design"], prev:"revenue-model", next:"brand-architecture", status:"live" },

    "brand-architecture": { cat:"start-the-company", title:"Brand Architecture", clue:"How the company, products, and sub-brands fit together.",
      heroQuestion:"How do all your names and offers fit together?",
      definition:"Brand architecture is the system that organizes the company, its products, and sub-brands so they reinforce each other instead of confusing people.",
      whyItMatters:"As you add offers, an unplanned brand turns into clutter customers can't navigate.",
      businessExample:"Day One MVP™ with The G Code™ and AIBridge™ as named properties — clear roles, one family.",
      whatWeBuild:["A brand map","Naming rules for new offers","How sub-brands relate to the parent"],
      commonMistake:"Inventing a new brand for every offer until nobody knows what the company is.",
      jackQuestion:"When you add your next offer, where does it live?",
      related:["naming","positioning","company-structure"], prev:"naming", next:"company-structure", status:"live" },

    "company-structure": { cat:"start-the-company", title:"Company Structure", clue:"The simple frame that lets the business operate and grow.",
      heroQuestion:"How does this run as an actual company?",
      definition:"Company structure is the simple operating frame — roles, responsibilities, and how decisions and money flow — so the business can run, not just exist.",
      whyItMatters:"Without structure, everything depends on one person's memory, and growth breaks the founder.",
      businessExample:"Defining who owns sales, delivery, and follow-up — even if it's one person wearing three labeled hats — prevents dropped balls.",
      whatWeBuild:["A roles-and-responsibility map","Decision and money flow","What to document first"],
      commonMistake:"Treating structure as \"corporate\" and skipping it until something breaks.",
      jackQuestion:"If you got sick for two weeks, what would fall apart first?",
      related:["revenue-model","launch-planning","brand-architecture"], prev:"brand-architecture", next:"launch-planning", status:"live" },

    "launch-planning": { cat:"start-the-company", title:"Launch Planning", clue:"Decide how this actually enters the world.",
      heroQuestion:"How does this reach its first real customers?",
      definition:"Launch planning is the plan for how the company or product enters the market — the first audience, the message, and the first weeks of activity.",
      whyItMatters:"A great build with no launch plan is a secret. The launch is how anyone finds out.",
      businessExample:"A soft launch to 20 known contacts and a referral ask often beats a silent \"we're live\" nobody sees.",
      whatWeBuild:["A first-audience plan","Launch message and assets","A first-weeks action list"],
      commonMistake:"Treating launch as one big reveal instead of a controlled, measured rollout.",
      jackQuestion:"Who are the first ten people who should hear about this?",
      related:["company-structure","investor-partner-materials","positioning"], prev:"company-structure", next:"investor-partner-materials", status:"live" },

    "investor-partner-materials": { cat:"start-the-company", title:"Investor or Partner Materials", clue:"Explain the company clearly to people who can back it.",
      heroQuestion:"Can someone fund or partner on this after one read?",
      definition:"These are the clear materials — a one-pager, a deck, a summary — that explain the company, the opportunity, and the ask to investors or partners.",
      whyItMatters:"Money and partnerships follow clarity. Confusing materials lose interest before the conversation starts.",
      businessExample:"A clean one-page overview of the problem, solution, model, and ask opens more doors than a 40-slide maze.",
      whatWeBuild:["A one-pager or deck","The opportunity and model, plainly","A clear, honest ask"],
      commonMistake:"Overstating traction or inventing numbers — which destroys trust the moment it's checked.",
      jackQuestion:"What's the honest version of where this is today?",
      related:["launch-planning","revenue-model","company-structure"], prev:"launch-planning", next:null, status:"live" }
  }
};

/* clue text for tiles in not-yet-written categories (so hubs render, no dead links) */
window.BUILD_DEV_CLUES = {
  "build-the-product": "The working product itself — sites, apps, MVPs, portals, and platforms.",
  "install-the-systems": "The AI, CRM, and automation that actually run the business day to day.",
  "grow-the-business": "Offers, sales, marketing, and the system that turns attention into customers.",
  "train-the-people": "Teaching your people to use the systems with confidence.",
  "produce-the-media": "Making the value visible — audio, video, founder content, and campaigns."
};
