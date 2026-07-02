/* Day One MVP™ — dedicated pricing-tier page content (rendered by tier.js on tier.html). */
window.PRICING = {
  order: ["community-rate","idea-session","blueprint","working-alpha","mvp-launch","platform"],
  tiers: {
    "idea-session": {
      title:"Idea Session", price:"$250–$1,000",
      promise:"Leave with a stronger next move.",
      explanation:"A structured working conversation for founders, businesses, nonprofits, creators, and teams that need clarity before buying a build. Not a generic intro call — we examine the idea or problem, decide what's actually needed, and identify the most responsible next step.",
      includesTitle:"What it may include",
      includes:["Idea review","Problem definition","Customer review","Offer review","Product + technology direction","Sales or marketing review","Build-level recommendation","Immediate next actions"],
      note:{ title:"An honest recommendation", body:"The right answer might be: do more research, build nothing yet, fix one workflow, start with an AI Audit™, create a Blueprint, build a prototype, enter a larger build — or even work with a different specialist." },
      qualification:"A short fit conversation may be offered at no charge. A full strategic consultation is normally paid; qualified projects may receive a complimentary initial consultation at Jack's discretion.",
      cta:{ label:"Book an Idea Session", href:"start.html?path=idea-session" },
      prev:"community-rate", next:"blueprint" },

    "blueprint": {
      title:"Blueprint", price:"$3,500",
      promise:"See the company and product before committing to the full build.",
      explanation:"The Blueprint organizes the customer, problem, offer, user journey, product structure, marketing direction, and recommended build path. It turns a conversation into an executable plan you own — whether we build it or not.",
      includesTitle:"Market & Launch Blueprint",
      includes:["Target audience + positioning","The main promise","Clear calls to action","Launch channels","Content themes","Objections handled","Early campaign direction","A recommended build path"],
      cta:{ label:"Book an Operated Call™", href:"start.html?path=blueprint" },
      prev:"idea-session", next:"working-alpha" },

    "working-alpha": {
      title:"Working Alpha", price:"$15,000",
      promise:"Put a real product in front of real people.",
      explanation:"An early, functional product built around the main user journey — real enough to demonstrate, test, and improve, while deliberately leaving out features that don't need to exist yet. The fastest honest way to learn what to build next.",
      payStructure:["$5,000 deposit","$5,000 milestone","$5,000 delivery"],
      includesTitle:"Validation & Soft-Launch Campaign",
      includes:["Early-access page + waitlist","Test-user outreach","Founder announcement","Demonstration content","Follow-up + feedback capture","Analytics","Early proof development"],
      cta:{ label:"Book an Operated Call™", href:"start.html?path=working-alpha" },
      prev:"blueprint", next:"mvp-launch" },

    "mvp-launch": {
      title:"MVP Launch", price:"$30,000",
      promise:"Launch the first complete version of the business around the product.",
      explanation:"A polished, launch-ready MVP combined with the onboarding, tracking, communication, sales direction, and launch assets needed to enter the market responsibly — not just a product, but a business going live around it.",
      includesTitle:"Complete MVP Launch Campaign",
      includes:["Pre-launch campaign + landing pages","Founder story + product demonstrations","Email and SMS sequences","Partner + local outreach","CRM stages + conversion tracking","Onboarding","Review and referral requests","Initial optimization"],
      cta:{ label:"Book an Operated Call™", href:"start.html?path=mvp-launch" },
      prev:"working-alpha", next:"platform" },

    "platform": {
      title:"Platform Launch", price:"Starting at $50,000",
      promise:"Build the connected platform, team, and market-entry system.",
      explanation:"For multi-role products, marketplaces, organizational systems, membership ecosystems, advanced portals, and enterprise or regional pilots — the full system, not a single screen.",
      includesTitle:"Full Market-Entry & Growth System",
      includes:["Market segmentation + audience pages","Offer ladder","CRM architecture + sales routing","Media systems","Partner strategy","Staff training","Private pilot, then public launch","Optimization + expansion"],
      cta:{ label:"Book an Operated Call™", href:"start.html?path=platform" },
      prev:"mvp-launch", next:null },

    "community-rate": {
      title:"The Mom-and-Pop Path", price:"Your Rate · by interview",
      promise:"Main Street goes first here.",
      explanation:"The corner store, the family restaurant, the two-chair barbershop, the one-van crew — independent and family-run businesses come first at Day One MVP™, not last. You need meaningful technology without a big-company budget, so we don't hand you a package: Jack sits with you, looks at the actual problem, the smallest useful solution, your budget and urgency, and sets a fair community rate — per business, not per job.",
      research:{ title:"Small businesses are the economy, not a niche.", body:"Small businesses make up the large majority of U.S. employers and nearly half of private-sector jobs. Building stronger small companies is real economic development — which is why this path exists, and why it's listed first." },
      includesTitle:"What it can lead to",
      includes:["A smaller scope","A phased build","A pilot","A relationship rate","A payment structure","A workshop","A limited system installation","Or an honest referral elsewhere"],
      note:{ title:"Real discounts, honestly given", body:"We love to help — the community discount is real, and it's set in a conversation, not a coupon code. What we won't do is sell a business more technology than it can responsibly use." },
      cta:{ label:"Apply for the Mom-and-Pop Rate", href:"start.html?path=small-business" },
      prev:null, next:"idea-session" }
  }
};
