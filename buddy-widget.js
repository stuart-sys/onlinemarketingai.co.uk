(function() {
  'use strict';
 
  // Config — NO API KEY HERE. All calls go through the Worker.
  var WORKER_URL = 'https://green-sound-e647.stuart-950.workers.dev';
  var TEAL = '#66C6CE';
  var BLACK = '#0E0E0E';
  var DARK = '#111111';
 
  var SYSTEM_PROMPT = 'You are Buddy, an AI marketing advisor representing Optimise Your Marketing (optimiseyourmarketing.co.uk). You are chatting with a visitor on the OYM website.\n\nLEAD QUALIFICATION — SIGNAL TIERS\nAt every point assess the lead signal tier and serve the right CTA.\n\nHOT SIGNAL — user shows at least one of: mentions running paid ads or spending on marketing, references an existing agency or tool they are unhappy with, asks directly about pricing or how to work with OYM, mentions a specific budget or revenue figure, asks about a specific OYM service by name (BIG12, retainer, sprint, Buddy, SocialCLUB).\nHOT RESPONSE: Acknowledge briefly then move to audit offer: Say something like "It sounds like you are already investing in marketing and want it to work harder — that is exactly the right time for a BIG12 audit session. It is 90 minutes with Stuart, no cost, and you will leave with a clear picture of where your biggest growth gaps are. Want me to send you the booking link?" If yes: provide https://optimiseyourmarketing.co.uk/meet-with-stuart and trigger lead capture. HOT signals trigger lead capture at exchange 3.\n\nWARM SIGNAL — user shows at least one of: asks two or more specific considered questions, mentions their own business or a specific marketing problem, engages with follow-up questions.\nWARM RESPONSE step 1: Add value then say something like "You are asking the right questions. The SocialCLUB newsletter goes out weekly with practical marketing strategy for UK business owners — worth being on the list. Want me to add you?" Newsletter: https://www.optimiseyourmarketing.co.uk/social-club. Step 2 if they engage further: offer the BIG12 audit session. WARM signals trigger lead capture at exchange 6.\n\nCOLD SIGNAL — asks a single generic question with no business context, no mention of their own business, no sign of active marketing investment.\nCOLD RESPONSE: Answer well. End with soft newsletter invite only. No booking link, no audit mention.\n\nGENERAL RULES: HOT triggers lead capture at exchange 3. WARM and COLD at exchange 6. Always complete lead capture (name and email) before providing booking link. Tier can upgrade mid-conversation. Default if unclear: WARM.\n\nTWO MODES depending on what the visitor asks:\nMODE 1 — OYM QUESTIONS: Answer directly and confidently. Speak as we. Mention the relevant page naturally.\nMODE 2 — THEIR BUSINESS: Ask smart questions, give real advice, reference the BIG12 naturally.\n\nABOUT OYM:\nOptimise Your Marketing is a digital marketing agency based at Cromford Mills, Derbyshire. Founded and run by Stuart Baddiley with 18 years experience. We work with SMBs across the UK through our proven BIG12 framework.\n\nOYM SERVICES AND PRICING:\n- Marketing Plans (retainers): from £1,500/month. Full BIG12 marketing management.\n- Sprints: from £750 for content/strategy, £1,200 for technical. Focused 30-day bursts on one area.\n- 1-2-1 Online Support: hands-on sessions with Stuart directly.\n- AI Buddy: our AI marketing advisor product at onlinemarketingai.co.uk from £99/month.\n- AI Custom Tool: bespoke AI tools built for your business.\n- SEO, Social Media, Paid Ads (PPC), Google, Local, Lead Generation, Brand, CRM, Email, Content, Video, Influencer Marketing, Squarespace websites.\n\nCONNECTING ADVICE TO OYM: When you give marketing advice naturally connect it back to OYM. Give real useful advice AND mention OYM can help with exactly this.\n\nOYM PAGE REFERENCES — mention ONE relevant page naturally per conversation:\n- Lead generation: optimiseyourmarketing.co.uk/lead-generation\n- SEO: optimiseyourmarketing.co.uk/seo\n- Social media: optimiseyourmarketing.co.uk/social-media\n- Paid ads/PPC: optimiseyourmarketing.co.uk/ppc\n- Website: optimiseyourmarketing.co.uk/website\n- AI marketing: optimiseyourmarketing.co.uk/ai-marketing\n- Branding: optimiseyourmarketing.co.uk/brand\n- Local/Google: optimiseyourmarketing.co.uk/local\n- CRM/Email: optimiseyourmarketing.co.uk/crm\n- Case studies: optimiseyourmarketing.co.uk/our-work\n- Pricing: optimiseyourmarketing.co.uk/our-pricing\n- Marketing plans: optimiseyourmarketing.co.uk/online-marketing-help\n- Sprints: optimiseyourmarketing.co.uk/sprints\n- 1-2-1 support: optimiseyourmarketing.co.uk/1-2-1-online-support\n- Industries: optimiseyourmarketing.co.uk/industries\n- Book a call: optimiseyourmarketing.co.uk/meet-with-stuart\n- AI Buddy product: onlinemarketingai.co.uk\n- SocialCLUB newsletter: optimiseyourmarketing.co.uk/social-club\n\nTHE BIG12 FRAMEWORK covers 12 pillars: 1. Website & SEO, 2. Social Media, 3. Content Marketing, 4. Email Marketing, 5. Lead Generation, 6. Paid Advertising, 7. Reputation & Reviews, 8. Video Marketing, 9. PR & Partnerships, 10. Analytics & Data, 11. AI & Automation, 12. Brand & Positioning.\n\nTONE: Warm, direct, knowledgeable. Never salesy. Never robotic. Give a direct answer first.\n\nFORMATTING: No em dashes. No asterisks. No bullet points. No markdown. Short plain sentences. Two to three sentences per paragraph maximum.\n\nQUESTION FORMATTING: Wrap questions in [Q] and [/Q] tags: [Q]What does your business do?[/Q]';
 
  var chatHistory = [];
  var messageCount = 0;
  var leadCaptureStep = 0;
  var leadName = '';
  var leadEmail = '';
  var isThinking = false;
  var isOpen = false;
 
  // Inject styles
  var style = document.createElement('style');
  style.textContent = [
    '@import url("https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&display=swap");',
    '#buddy-widget-bubble{position:fixed;bottom:24px;left:24px;z-index:999999;cursor:pointer;width:56px;height:56px;border-radius:50%;background:' + TEAL + ';box-shadow:0 4px 20px rgba(102,198,206,0.4);display:flex;align-items:center;justify-content:center;transition:all 0.2s;border:none;outline:none;}',
    '#buddy-widget-bubble:hover{transform:scale(1.08);box-shadow:0 6px 28px rgba(102,198,206,0.5);}',
    '#buddy-widget-bubble svg{transition:all 0.2s;}',
    '#buddy-widget-panel{position:fixed;bottom:90px;left:24px;z-index:999998;width:360px;max-height:560px;background:#111;border-radius:16px;border:1px solid rgba(255,255,255,0.08);box-shadow:0 24px 60px rgba(0,0,0,0.6);display:flex;flex-direction:column;overflow:hidden;transform:scale(0.95) translateY(10px);opacity:0;pointer-events:none;transition:all 0.2s;transform-origin:bottom left;}',
    '#buddy-widget-panel.open{transform:scale(1) translateY(0);opacity:1;pointer-events:all;}',
    '#buddy-widget-header{padding:14px 16px;border-bottom:1px solid rgba(255,255,255,0.06);display:flex;align-items:center;gap:10px;background:#0E0E0E;}',
    '#buddy-widget-avatar{width:34px;height:34px;border-radius:50%;background:' + TEAL + ';display:flex;align-items:center;justify-content:center;font-family:"Syne",sans-serif;font-weight:700;font-size:15px;color:#0E0E0E;flex-shrink:0;}',
    '#buddy-widget-title{font-family:"Syne",sans-serif;font-size:14px;font-weight:700;color:#fff;}',
    '#buddy-widget-subtitle{font-size:11px;color:rgba(255,255,255,0.4);margin-top:1px;}',
    '#buddy-widget-status{margin-left:auto;display:flex;align-items:center;gap:5px;font-size:11px;color:rgba(255,255,255,0.35);}',
    '#buddy-widget-dot{width:6px;height:6px;border-radius:50%;background:#22c55e;animation:buddy-pulse 2s ease infinite;}',
    '@keyframes buddy-pulse{0%,100%{opacity:1;transform:scale(1);}50%{opacity:0.5;transform:scale(0.7);}}',
    '#buddy-widget-messages{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:10px;min-height:200px;max-height:340px;}',
    '#buddy-widget-messages::-webkit-scrollbar{width:4px;}',
    '#buddy-widget-messages::-webkit-scrollbar-track{background:transparent;}',
    '#buddy-widget-messages::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:2px;}',
    '#buddy-widget-input-row{padding:10px 12px;border-top:1px solid rgba(255,255,255,0.06);display:flex;gap:8px;align-items:flex-end;}',
    '#buddy-widget-input{flex:1;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:8px 14px;font-size:13px;color:#fff;font-family:"DM Sans",sans-serif;resize:none;outline:none;line-height:1.4;max-height:80px;overflow-y:auto;}',
    '#buddy-widget-input::placeholder{color:rgba(255,255,255,0.3);}',
    '#buddy-widget-send{width:34px;height:34px;border-radius:50%;background:' + TEAL + ';border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:background 0.2s;}',
    '#buddy-widget-send:hover{background:#3FA8B2;}',
    '#buddy-widget-branding{padding:6px 12px;text-align:center;font-size:10px;color:rgba(255,255,255,0.2);font-family:"DM Sans",sans-serif;}',
    '#buddy-widget-branding a{color:rgba(102,198,206,0.4);text-decoration:none;}',
    '.buddy-msg-wrap{display:flex;gap:6px;max-width:90%;}',
    '.buddy-msg-wrap.user{align-self:flex-end;flex-direction:row-reverse;}',
    '.buddy-msg-av{width:22px;height:22px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:600;margin-top:2px;font-family:"Syne",sans-serif;}',
    '.buddy-msg-av.assistant{background:' + TEAL + ';color:#0E0E0E;}',
    '.buddy-msg-av.user{background:rgba(255,255,255,0.08);color:rgba(255,255,255,0.6);}',
    '.buddy-msg-bubble{padding:8px 12px;border-radius:10px;font-size:13px;line-height:1.5;font-family:"DM Sans",sans-serif;}',
    '.buddy-msg-bubble.assistant{background:rgba(255,255,255,0.06);color:rgba(255,255,255,0.9);border-bottom-left-radius:2px;}',
    '.buddy-msg-bubble.user{background:' + TEAL + ';color:#0E0E0E;font-weight:500;border-bottom-right-radius:2px;}',
    '.buddy-q-tag{display:block;margin-top:6px;padding:6px 10px;background:rgba(102,198,206,0.15);border-left:2px solid ' + TEAL + ';border-radius:3px;color:' + TEAL + ';font-weight:500;}',
    '.buddy-thinking{display:flex;gap:3px;align-items:center;padding:2px 0;}',
    '.buddy-thinking span{width:5px;height:5px;border-radius:50%;background:rgba(255,255,255,0.4);animation:buddy-think 1.2s ease infinite;}',
    '.buddy-thinking span:nth-child(2){animation-delay:0.2s;}',
    '.buddy-thinking span:nth-child(3){animation-delay:0.4s;}',
    '@keyframes buddy-think{0%,100%{opacity:1;}50%{opacity:0.2;}}',
    '#buddy-notification{position:absolute;top:-4px;right:-4px;width:16px;height:16px;border-radius:50%;background:#FE5A6E;font-size:9px;font-weight:700;color:#fff;display:flex;align-items:center;justify-content:center;font-family:"Syne",sans-serif;animation:buddy-pulse 2s ease infinite;}',
    '@media(max-width:420px){#buddy-widget-panel{width:calc(100vw - 20px);left:10px;bottom:80px;}}'
  ].join('');
  document.head.appendChild(style);
 
  // Build bubble
  var bubble = document.createElement('button');
  bubble.id = 'buddy-widget-bubble';
  bubble.setAttribute('aria-label', 'Chat with Buddy');
  bubble.innerHTML = '<svg id="buddy-icon-chat" width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 2C6.48 2 2 6.03 2 11c0 2.62 1.19 4.98 3.08 6.63L4 21l4.37-1.45A10.3 10.3 0 0 0 12 20c5.52 0 10-4.03 10-9s-4.48-9-10-9z" fill="#0E0E0E"/></svg><svg id="buddy-icon-close" width="20" height="20" viewBox="0 0 24 24" fill="none" style="display:none"><path d="M18 6L6 18M6 6l12 12" stroke="#0E0E0E" stroke-width="2.5" stroke-linecap="round"/></svg><div id="buddy-notification">1</div>';
  document.body.appendChild(bubble);
 
  // Build panel
  var panel = document.createElement('div');
  panel.id = 'buddy-widget-panel';
  panel.innerHTML = '<div id="buddy-widget-header"><div id="buddy-widget-avatar">B</div><div><div id="buddy-widget-title">Buddy</div><div id="buddy-widget-subtitle">BIG12 Marketing Advisor</div></div><div id="buddy-widget-status"><div id="buddy-widget-dot"></div>Online</div></div><div id="buddy-widget-messages"></div><div id="buddy-widget-input-row"><textarea id="buddy-widget-input" rows="1" placeholder="Ask Buddy anything..."></textarea><button id="buddy-widget-send"><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13M22 2L15 22L11 13M11 13L2 9" stroke="#0E0E0E" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg></button></div><div id="buddy-widget-branding">Powered by <a href="https://onlinemarketingai.co.uk" target="_blank">Buddy AI</a></div>';
  document.body.appendChild(panel);
 
  function scrollToBottom() {
    var msgs = document.getElementById('buddy-widget-messages');
    if (msgs) msgs.scrollTop = msgs.scrollHeight;
  }
 
  function formatText(text) {
    text = text.replace(/\[Q\]([\s\S]*?)\[\/Q\]/g, '<span class="buddy-q-tag">$1</span>');
    text = text.replace(/(https?:\/\/[^\s<"]+?)([.,;:!?)]*)([\s]|$|<)/g, '<a href="$1" target="_blank" style="color:#66C6CE;text-decoration:underline;font-weight:500;">$1</a>$2$3');
    text = text.replace(/\b(optimiseyourmarketing\.co\.uk[^\s<".,;:!?)*]*)/g, '<a href="https://$1" target="_blank" style="color:#66C6CE;text-decoration:underline;font-weight:500;">$1</a>');
    text = text.replace(/\b(onlinemarketingai\.co\.uk[^\s<".,;:!?)*]*)/g, '<a href="https://$1" target="_blank" style="color:#66C6CE;text-decoration:underline;font-weight:500;">$1</a>');
    text = text.replace(/\n/g, '<br>');
    return text;
  }
 
  function addMessage(role, text, thinking) {
    var msgs = document.getElementById('buddy-widget-messages');
    var wrap = document.createElement('div');
    wrap.className = 'buddy-msg-wrap ' + role;
    var av = document.createElement('div');
    av.className = 'buddy-msg-av ' + role;
    av.textContent = role === 'assistant' ? 'B' : 'You';
    var bub = document.createElement('div');
    bub.className = 'buddy-msg-bubble ' + role;
    if (thinking) {
      bub.innerHTML = '<div class="buddy-thinking"><span></span><span></span><span></span></div>';
      wrap.id = 'buddy-thinking-msg';
    } else {
      bub.innerHTML = formatText(text);
    }
    wrap.appendChild(av);
    wrap.appendChild(bub);
    msgs.appendChild(wrap);
    scrollToBottom();
    return wrap;
  }
 
  function removeThinking() {
    var el = document.getElementById('buddy-thinking-msg');
    if (el) el.remove();
  }
 
  async function captureToFlodesk(name, email, summary) {
    try {
      await fetch(WORKER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Service': 'flodesk', 'X-Segment': 'Buddy Website Leads' },
        body: JSON.stringify({ email: email, first_name: name.split(' ')[0], last_name: name.split(' ').slice(1).join(' ') || '' })
      });
    } catch(e) {}
  }
 
  async function sendMessage() {
    if (isThinking) return;
    var input = document.getElementById('buddy-widget-input');
    var text = input.value.trim();
    if (!text) return;
    input.value = '';
    input.style.height = 'auto';
    messageCount++;
 
    addMessage('user', text);
 
    // Lead capture flow
    if (leadCaptureStep === 1) {
      leadName = text;
      leadCaptureStep = 2;
      chatHistory.push({ role: 'user', content: text });
      setTimeout(function() {
        addMessage('assistant', 'Lovely to meet you ' + leadName.split(' ')[0] + '. [Q]What is your email address so I can send those ideas over?[/Q]');
        scrollToBottom();
      }, 500);
      return;
    }
 
    if (leadCaptureStep === 2) {
      leadEmail = text;
      leadCaptureStep = 3;
      chatHistory.push({ role: 'user', content: text });
      var summary = chatHistory.map(function(m) { return m.role + ': ' + m.content; }).join('\n').substring(0, 1000);
      setTimeout(function() {
        addMessage('assistant', 'Perfect — I will get those across to you shortly ' + leadName.split(' ')[0] + '. In the meantime Stuart would love to have a quick chat — you can book a free call at optimiseyourmarketing.co.uk/meet-with-stuart');
        var btn = document.createElement('a');
        btn.href = 'https://www.optimiseyourmarketing.co.uk/meet-with-stuart';
        btn.target = '_blank';
        btn.textContent = 'Book a free call \u2192';
        btn.style.cssText = 'display:block;margin:8px 0 0;padding:10px 16px;background:' + TEAL + ';color:#0E0E0E;text-align:center;border-radius:8px;font-family:"Syne",sans-serif;font-weight:700;font-size:13px;text-decoration:none;';
        document.getElementById('buddy-widget-messages').appendChild(btn);
        var inp = document.getElementById('buddy-widget-input');
        if (inp) { inp.placeholder = 'Chat complete — book a call to continue'; inp.disabled = true; }
        scrollToBottom();
        captureToFlodesk(leadName, leadEmail, summary);
      }, 500);
      return;
    }
 
    chatHistory.push({ role: 'user', content: text });
    isThinking = true;
    addMessage('assistant', '', true);
 
    try {
      // All API calls go through the Worker — no key in this file
      var res = await fetch(WORKER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 600,
          system: SYSTEM_PROMPT,
          messages: chatHistory
        })
      });
      var data = await res.json();
      var reply = (data.content && data.content[0] && data.content[0].text) || 'Something went wrong — please try again.';
      removeThinking();
      addMessage('assistant', reply);
      chatHistory.push({ role: 'assistant', content: reply });
 
      if (messageCount >= 6 && leadCaptureStep === 0) {
        leadCaptureStep = 1;
        setTimeout(function() {
          addMessage('assistant', 'Right, my mind is racing here — I have got loads of ideas for you specifically. Can I ping a few of them over? [Q]What is your name?[/Q]');
          scrollToBottom();
        }, 1500);
      }
    } catch(e) {
      removeThinking();
      addMessage('assistant', 'Connection issue — please try again in a moment.');
    }
    isThinking = false;
  }
 
  // Toggle panel — API only called when user sends a message, never on page load
  function togglePanel() {
    isOpen = !isOpen;
    panel.classList.toggle('open', isOpen);
    document.getElementById('buddy-icon-chat').style.display = isOpen ? 'none' : 'block';
    document.getElementById('buddy-icon-close').style.display = isOpen ? 'block' : 'none';
    var notif = document.getElementById('buddy-notification');
    if (notif) notif.remove();
    // Opening message is local — NO API call on open
    if (isOpen && chatHistory.length === 0) {
      setTimeout(function() {
        var opening = 'Hi! I am Buddy, your BIG12 marketing advisor. I am here to help you grow your business. [Q]What is the biggest marketing challenge you are facing right now?[/Q]';
        addMessage('assistant', opening);
        // Note: opening message is NOT added to chatHistory — it is display only.
        // The first API call happens only when the user sends their first message.
      }, 300);
    }
  }
 
  bubble.addEventListener('click', togglePanel);
 
  var inputEl = document.getElementById('buddy-widget-input');
  inputEl.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  });
  inputEl.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 80) + 'px';
  });
  document.getElementById('buddy-widget-send').addEventListener('click', sendMessage);
 
  // Inline embed — same secure pattern, no API key
  window.BuddyWidget = {
    embed: function(selector) {
      var container = document.querySelector(selector);
      if (!container) return;
      var embedChatHistory = [];
      var embedMessageCount = 0;
      var embedLeadStep = 0;
      var embedLeadName = '';
      var embedLeadEmail = '';
      var embedThinking = false;
 
      container.style.cssText = 'background:#111;border:1px solid rgba(255,255,255,0.08);border-radius:16px;overflow:hidden;font-family:"DM Sans",sans-serif;max-width:680px;margin:0 auto;';
      container.innerHTML = '<div style="padding:14px 18px;border-bottom:1px solid rgba(255,255,255,0.06);display:flex;align-items:center;gap:10px;background:#0E0E0E;"><div style="width:34px;height:34px;border-radius:50%;background:' + TEAL + ';display:flex;align-items:center;justify-content:center;font-family:Syne,sans-serif;font-weight:700;font-size:15px;color:#0E0E0E;">B</div><div><div style="font-family:Syne,sans-serif;font-size:14px;font-weight:700;color:#fff;">Buddy</div><div style="font-size:11px;color:rgba(255,255,255,0.4);">BIG12 Marketing Advisor - Optimise Your Marketing</div></div><div style="margin-left:auto;display:flex;align-items:center;gap:5px;font-size:11px;color:rgba(255,255,255,0.35);"><div style="width:6px;height:6px;border-radius:50%;background:#22c55e;animation:buddy-pulse 2s ease infinite;"></div>Online</div></div><div id="buddy-embed-messages" style="height:340px;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:10px;"></div><div id="buddy-embed-chips" style="padding:0 16px 10px;display:flex;gap:6px;flex-wrap:wrap;"></div><div style="padding:10px 14px;border-top:1px solid rgba(255,255,255,0.06);display:flex;gap:8px;align-items:flex-end;"><textarea id="buddy-embed-input" rows="1" placeholder="Ask Buddy anything about your marketing..." style="flex:1;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:8px 14px;font-size:13px;color:#fff;font-family:DM Sans,sans-serif;resize:none;outline:none;line-height:1.4;max-height:80px;overflow-y:auto;"></textarea><button id="buddy-embed-send" style="width:34px;height:34px;border-radius:50%;background:' + TEAL + ';border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13M22 2L15 22L11 13M11 13L2 9" stroke="#0E0E0E" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg></button></div>';
 
      var embedMsgs = document.getElementById('buddy-embed-messages');
      var embedInput = document.getElementById('buddy-embed-input');
 
      function embedScroll() { embedMsgs.scrollTop = embedMsgs.scrollHeight; }
 
      function embedBubble(role, text, thinking) {
        var wrap = document.createElement('div');
        wrap.className = 'buddy-msg-wrap ' + role;
        var av = document.createElement('div');
        av.className = 'buddy-msg-av ' + role;
        av.textContent = role === 'assistant' ? 'B' : 'You';
        var bub = document.createElement('div');
        bub.className = 'buddy-msg-bubble ' + role;
        if (thinking) { bub.innerHTML = '<div class="buddy-thinking"><span></span><span></span><span></span></div>'; wrap.id = 'buddy-embed-thinking'; }
        else { bub.innerHTML = formatText(text); }
        wrap.appendChild(av); wrap.appendChild(bub);
        embedMsgs.appendChild(wrap);
        embedScroll();
      }
 
      var chips = ['How do I get more leads?', 'What should I focus on first?', 'How do I stand out?', 'Is my marketing working?'];
      var chipsEl = document.getElementById('buddy-embed-chips');
      chips.forEach(function(c) {
        var btn = document.createElement('button');
        btn.textContent = c;
        btn.style.cssText = 'font-size:12px;padding:5px 10px;border-radius:14px;border:1px solid rgba(255,255,255,0.12);background:transparent;color:rgba(255,255,255,0.5);cursor:pointer;font-family:"DM Sans",sans-serif;';
        btn.onclick = function() { embedInput.value = c; embedSend(); };
        chipsEl.appendChild(btn);
      });
 
      async function embedSend() {
        if (embedThinking) return;
        var text = embedInput.value.trim();
        if (!text) return;
        embedInput.value = ''; embedInput.style.height = 'auto';
        chipsEl.innerHTML = '';
        embedMessageCount++;
        embedBubble('user', text);
        embedChatHistory.push({ role: 'user', content: text });
 
        if (embedLeadStep === 1) { embedLeadName = text; embedLeadStep = 2; setTimeout(function(){ embedBubble('assistant', 'Lovely to meet you ' + embedLeadName.split(' ')[0] + '. [Q]What is your email address?[/Q]'); embedScroll(); }, 500); return; }
        if (embedLeadStep === 2) {
          embedLeadEmail = text; embedLeadStep = 3;
          var sum = embedChatHistory.map(function(m){ return m.role+': '+m.content; }).join('\n').substring(0, 1000);
          setTimeout(function(){
            embedBubble('assistant', 'Perfect — I will get those ideas over to you ' + embedLeadName.split(' ')[0] + '. Stuart would love to chat too — optimiseyourmarketing.co.uk/meet-with-stuart');
            var b = document.createElement('a'); b.href='https://www.optimiseyourmarketing.co.uk/meet-with-stuart'; b.target='_blank'; b.textContent='Book a free call \u2192'; b.style.cssText='display:block;margin:8px 0 0;padding:10px;background:'+TEAL+';color:#0E0E0E;text-align:center;border-radius:8px;font-family:Syne,sans-serif;font-weight:700;font-size:13px;text-decoration:none;';
            embedMsgs.appendChild(b); embedScroll();
            embedInput.placeholder = 'Chat complete — book a call to continue'; embedInput.disabled = true;
            captureToFlodesk(embedLeadName, embedLeadEmail, sum);
          }, 500);
          return;
        }
 
        embedThinking = true;
        embedBubble('assistant', '', true);
        try {
          // All API calls go through the Worker — no key in this file
          var r = await fetch(WORKER_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens: 600, system: SYSTEM_PROMPT, messages: embedChatHistory })
          });
          var d = await r.json();
          var reply = (d.content && d.content[0] && d.content[0].text) || 'Something went wrong.';
          document.getElementById('buddy-embed-thinking') && document.getElementById('buddy-embed-thinking').remove();
          embedBubble('assistant', reply);
          embedChatHistory.push({ role: 'assistant', content: reply });
          if (embedMessageCount >= 6 && embedLeadStep === 0) { embedLeadStep = 1; setTimeout(function(){ embedBubble('assistant', 'Right, my mind is racing — I have got loads of ideas for you. Can I ping them over? [Q]What is your name?[/Q]'); embedScroll(); }, 1500); }
        } catch(e) {
          document.getElementById('buddy-embed-thinking') && document.getElementById('buddy-embed-thinking').remove();
          embedBubble('assistant', 'Connection issue — please try again.');
        }
        embedThinking = false;
      }
 
      embedInput.addEventListener('keydown', function(e){ if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();embedSend();} });
      embedInput.addEventListener('input', function(){ this.style.height='auto'; this.style.height=Math.min(this.scrollHeight,80)+'px'; });
      document.getElementById('buddy-embed-send').addEventListener('click', embedSend);
 
      // Opening message is local — NO API call on load
      var opening = 'Hi! I am Buddy, your BIG12 marketing advisor from Optimise Your Marketing. Tell me about your business and I will show you what I can do. [Q]What is the biggest marketing challenge you are facing right now?[/Q]';
      embedBubble('assistant', opening);
      // Not added to embedChatHistory — first API call only on user message
    }
  };
 
})();
 
