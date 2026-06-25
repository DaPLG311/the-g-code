/* Day One MVP™ — site-wide topic auto-linker.
   The FIRST time any of the 70 build topics is mentioned in body copy on a page,
   it becomes a gold dotted link to that topic's page, with a plain-English
   explanation on hover. Goal: anyone can hop from a mention to the full page.
   Skips nav, footer, headings, buttons, existing links, and the current topic. */
(function () {
  var TERMS = [
    /* WORLD 1 — Start the Company */
    { slug:"idea-discovery", ex:"Finding the strongest opportunity inside your idea.", words:["Idea Discovery"] },
    { slug:"customer-definition", ex:"Deciding exactly who this is for.", words:["Customer Definition"] },
    { slug:"positioning", ex:"The one place you win in the customer's mind.", words:["Positioning"] },
    { slug:"offer-design", ex:"Shaping what people actually buy so it's an easy yes.", words:["Offer Design"] },
    { slug:"pricing", ex:"Setting a price the value supports and the buyer believes.", words:["Pricing"] },
    { slug:"revenue-model", ex:"How the money comes in — and repeats.", words:["Revenue Model"] },
    { slug:"naming", ex:"A name people can say, spell, find, and remember.", words:["Naming"] },
    { slug:"brand-architecture", ex:"How the company, products, and sub-brands fit together.", words:["Brand Architecture"] },
    { slug:"company-structure", ex:"The simple frame that lets the business run and grow.", words:["Company Structure"] },
    { slug:"launch-planning", ex:"How the idea actually reaches its first customers.", words:["Launch Planning"] },
    { slug:"investor-partner-materials", ex:"Clear materials that explain the company to backers.", words:["Investor or Partner Materials","Investor and Partner Materials","Investor Materials","Partner Materials"] },

    /* WORLD 2 — Build the Product */
    { slug:"websites", ex:"Your public front door — explain, prove, convert.", words:["Websites","Website"] },
    { slug:"web-applications", ex:"Software people log into and do things in.", words:["Web Applications","Web Application","Web App","Web Apps"] },
    { slug:"mvps", ex:"The smallest real version that proves the idea.", words:["MVPs","MVP"] },
    { slug:"customer-portals", ex:"A private space where customers help themselves.", words:["Customer Portals","Customer Portal"] },
    { slug:"staff-portals", ex:"One place your team runs the daily work from.", words:["Staff Portals","Staff Portal"] },
    { slug:"dashboards", ex:"The few numbers that matter, at a glance.", words:["Dashboards","Dashboard"] },
    { slug:"booking-systems", ex:"Let people book without the phone tag.", words:["Booking Systems","Booking System"] },
    { slug:"quote-systems", ex:"Turn 'how much?' into a fast, clear answer.", words:["Quote Systems","Quote System"] },
    { slug:"marketplaces", ex:"Connect two sides — buyers and sellers — and earn the match.", words:["Marketplaces","Marketplace"] },
    { slug:"membership-platforms", ex:"Recurring access to content, community, or tools.", words:["Membership Platforms","Membership Platform"] },
    { slug:"internal-tools", ex:"Custom software built for how you actually work.", words:["Internal Tools"] },
    { slug:"specialized-digital-products", ex:"Software for a specific need nothing off-the-shelf fits.", words:["Specialized Digital Products"] },

    /* WORLD 3 — Install the Systems */
    { slug:"ai-assistants", ex:"A helper that answers, drafts, and qualifies.", words:["AI Assistants","AI Assistant"] },
    { slug:"crm-systems", ex:"One home for every lead and follow-up.", words:["CRM Systems","CRM System","CRM"] },
    { slug:"automation", ex:"Let the repetitive work run itself.", words:["Automation"] },
    { slug:"lead-routing", ex:"Send every lead to the right place, fast.", words:["Lead Routing"] },
    { slug:"email-sms-workflows", ex:"The right message at the right moment, automatically.", words:["Email & SMS Workflows","Email and SMS Workflows","Email/SMS Workflows"] },
    { slug:"onboarding", ex:"Turn a new customer into a confident one.", words:["Onboarding"] },
    { slug:"reporting", ex:"Know what's working without digging.", words:["Reporting"] },
    { slug:"knowledge-systems", ex:"Stop answering the same question forever.", words:["Knowledge Systems","Knowledge System"] },
    { slug:"staff-workflows", ex:"Clear steps so nothing gets dropped.", words:["Staff Workflows"] },
    { slug:"customer-communication", ex:"Right message, right channel, right time.", words:["Customer Communication"] },
    { slug:"internal-operations", ex:"The quiet machine that runs the business.", words:["Internal Operations"] },

    /* WORLD 4 — Grow the Business */
    { slug:"offer-design-atom", ex:"Atom™ — the offer that makes 'yes' easy.", words:["Atom™ Offer Design","Atom™"] },
    { slug:"sales-systems", ex:"A repeatable path from interested to paid.", words:["Sales Systems","Sales System"] },
    { slug:"marketing-campaigns", ex:"A coordinated push toward one goal.", words:["Marketing Campaigns","Marketing Campaign"] },
    { slug:"lead-generation", ex:"A steady flow of the right inquiries.", words:["Lead Generation"] },
    { slug:"follow-up", ex:"The money is in the messages most never send.", words:["Follow-Up","Follow Up","Follow-up"] },
    { slug:"content-strategy", ex:"Useful content that builds trust over time.", words:["Content Strategy"] },
    { slug:"local-seo", ex:"Get found when neighbors search.", words:["Local SEO"] },
    { slug:"search-readiness", ex:"Be the answer search and AI pick.", words:["Search Readiness"] },
    { slug:"reputation", ex:"The trust signals that shape perception before you talk.", words:["Reputation"] },
    { slug:"referral-systems", ex:"Turn happy customers into a source of growth.", words:["Referral Systems","Referral System"] },
    { slug:"conversion-improvement", ex:"More of the same traffic taking the next step.", words:["Conversion Improvement"] },
    { slug:"retention", ex:"Keeping the customers you already earned.", words:["Retention"] },

    /* WORLD 5 — Train the People */
    { slug:"ai-foundations", ex:"Practical, responsible AI use for your real work.", words:["AI Foundations"] },
    { slug:"sales-training", ex:"Train the real conversation, not memorized scripts.", words:["Sales Training"] },
    { slug:"employee-onboarding", ex:"Help new hires become useful, fast.", words:["Employee Onboarding"] },
    { slug:"founder-education", ex:"Sharper judgment across the whole company.", words:["Founder Education"] },
    { slug:"operator-training", ex:"Train key people to run the machine.", words:["Operator Training"] },
    { slug:"workshops", ex:"Focused sessions that make real progress.", words:["Workshops","Workshop"] },
    { slug:"internal-academies", ex:"Turn your own methods into repeatable training.", words:["Internal Academies","Internal Academy"] },
    { slug:"training-videos", ex:"Teach the same thing clearly, more than once.", words:["Training Videos","Training Video"] },
    { slug:"learning-portals", ex:"A digital home for lessons and progress.", words:["Learning Portals","Learning Portal"] },
    { slug:"role-play-systems", ex:"Rehearse hard conversations before the real moment.", words:["Role-Play Systems","Role-Play System","Role Play Systems"] },
    { slug:"custom-company-programs", ex:"Training built around your specific business.", words:["Custom Company Programs","Custom Company Program"] },

    /* WORLD 6 — Produce the Media */
    { slug:"audio", ex:"Sound that carries the message where text can't.", words:["Audio"] },
    { slug:"video", ex:"Explain, demonstrate, and persuade in a human way.", words:["Video"] },
    { slug:"podcasts", ex:"A long-form channel for voice and audience.", words:["Podcasts","Podcast"] },
    { slug:"product-demonstrations", ex:"Show how it works so the choice feels safe.", words:["Product Demonstrations","Product Demonstration","Product Demos","Product Demo"] },
    { slug:"founder-content", ex:"Put a clear voice behind the company.", words:["Founder Content"] },
    { slug:"social-clips", ex:"Big ideas cut into small, shareable pieces.", words:["Social Clips","Social Clip"] },
    { slug:"training-media", ex:"Media that teaches at scale, consistently.", words:["Training Media"] },
    { slug:"commercial-content", ex:"Media built to support a sale or launch.", words:["Commercial Content"] },
    { slug:"campaign-media", ex:"The assets a growth push needs across channels.", words:["Campaign Media"] },
    { slug:"sound-design", ex:"The sonic layer that makes media feel polished.", words:["Sound Design"] },
    { slug:"voiceover", ex:"A voice that guides and carries the tone.", words:["Voiceover","Voice-over"] },
    { slug:"content-repurposing", ex:"Get more value from content you already made.", words:["Content Repurposing"] },
    { slug:"publishing-systems", ex:"The workflow that keeps media output consistent.", words:["Publishing Systems","Publishing System"] }
  ];

  function esc(s){ return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }
  // longest phrases first so multi-word matches win
  TERMS.forEach(function (T) { T.words.sort(function (a, b) { return b.length - a.length; }); });
  TERMS.sort(function (a, b) { return b.words[0].length - a.words[0].length; });
  TERMS.forEach(function (T) {
    try { T.re = new RegExp("(?<![A-Za-z])(?:" + T.words.map(esc).join("|") + ")(?![A-Za-z])", "i"); }
    catch (e) { T.re = new RegExp("\\b(?:" + T.words.map(esc).join("|") + ")\\b", "i"); } // fallback: no lookbehind
  });

  var SKIP_TAG = { A:1, BUTTON:1, SCRIPT:1, STYLE:1, NAV:1, FOOTER:1, H1:1, H2:1, CODE:1, SELECT:1, TEXTAREA:1, INPUT:1, LABEL:1 };
  var SKIP_CLASS = ["btn","eyebrow","breadcrumb","cta-sub","prevnext","svc-topics","cat-door","menu-toggle","foot-links","foot-bottom","st-go","st-k","tlink","powered"];
  function skipped(node, stop){
    var el = node.parentNode;
    while (el && el !== stop && el.nodeType === 1) {
      if (SKIP_TAG[el.tagName]) return true;
      if (el.getAttribute && el.getAttribute("data-noautolink") !== null && el.hasAttribute("data-noautolink")) return true;
      var cl = (typeof el.className === "string") ? (" " + el.className + " ") : "";
      for (var i = 0; i < SKIP_CLASS.length; i++) { if (cl.indexOf(" " + SKIP_CLASS[i] + " ") > -1) return true; }
      el = el.parentNode;
    }
    return false;
  }

  window.DOM_AUTOLINK = function (rootEl) {
    var root = rootEl || document.body;
    if (!root) return;
    var here = new URLSearchParams(location.search).get("s"); // don't link the current topic to itself
    var used = window.__autolinkUsed || (window.__autolinkUsed = {});
    var stop = root.parentNode;
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null, false);
    var nodes = [], n;
    while ((n = walker.nextNode())) {
      if (n.nodeValue && n.nodeValue.replace(/\s/g, "").length > 2 && !skipped(n, stop)) nodes.push(n);
    }
    nodes.forEach(function (tn) {
      for (var i = 0; i < TERMS.length; i++) {
        var T = TERMS[i];
        if (used[T.slug] || T.slug === here) continue;
        var m = T.re.exec(tn.nodeValue); if (!m) continue;
        var full = m[0], idx = m.index;
        var after = tn.splitText(idx);
        after.nodeValue = after.nodeValue.slice(full.length);
        var a = document.createElement("a");
        a.className = "tlink";
        a.href = "build.html?s=" + T.slug;
        a.setAttribute("data-ex", T.ex);
        a.setAttribute("title", T.ex);
        a.textContent = full;
        tn.parentNode.insertBefore(a, after);
        used[T.slug] = 1;
        break; // one link per text node, keeps indices valid
      }
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { window.DOM_AUTOLINK(); });
  } else {
    window.DOM_AUTOLINK();
  }
})();
