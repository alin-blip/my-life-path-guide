// Burnout Story email sequence — 10 emails × RO/EN
// Each body is markdown-lite: paragraphs separated by \n\n.
// Inline formatting: **bold**, *italic*.
// Special line prefixes: "H2: ..." heading, "PS: ..." P.S. block.

export type Lang = 'ro' | 'en'

export interface DayCopy {
  subject: string
  preheader: string
  body: string
}

export const CTA_LABEL: Record<Lang, string> = {
  ro: '👉 Începe trial-ul gratuit de 5 zile',
  en: '👉 Start your free 5-day trial',
}

export const SIGN_OFF: Record<Lang, string> = {
  ro: '— Alin Radu\nFondator, CEO Mind OS',
  en: '— Alin Radu\nFounder, CEO Mind OS',
}

// ================================================================
// EN — verbatim from source files
// ================================================================
const EN: DayCopy[] = [
  {
    subject: 'The man who built a business and lost everything else',
    preheader: 'This is not another productivity email. Stay with me.',
    body: `Let me describe someone to you.

He wakes up at 6:50. Not because he planned to — because his brain never fully switched off. Before his feet hit the floor, he's already scanning WhatsApp, emails, Slack. His wife is in the kitchen. He says good morning without looking up from his phone.

He's been saying good morning like that for two years.

By 9am he's answered 31 messages, made six decisions that should have been delegated, and hasn't touched the one thing that actually moves the needle this week. By 2pm he's on his third coffee, running on cortisol and momentum. By 7pm he's physically home but mentally still at the office.

He puts the kids to bed. Opens the laptop. Works until midnight. Sleeps badly. Wakes up and does it again.

He hasn't worked out in three weeks. He keeps saying *next Monday.*

His marriage is on autopilot. He keeps saying *after this launch.*

Things don't slow down. They never do.

If that's not you — delete this email. Seriously. What I'm about to share over the next few days is not for everyone.

But if some part of that landed — if you felt a flicker of recognition reading it — then I need you to stay with me. Because I wrote it from memory. Not someone else's memory. Mine.

My name is Alin Radu. I'm the founder of CEO Mind OS — a Founder Operating System built specifically for the entrepreneur who is performing in business and quietly falling apart everywhere else.

I know what your Burnout Test score said. And I know that seeing that number probably brought up something uncomfortable. Not surprise, exactly. More like *confirmation.*

You already knew something was wrong. You just hadn't seen it this clearly before.

Over the next several days, I'm going to tell you a story. It's my story — and it starts in a place most people would never admit to publicly. It goes through the worst night of my life, through a year I'd rather forget, and through a single morning in a truck cabin that changed everything.

And at the end of it, I'm going to show you exactly what I built from that wreckage — and how it can work for you, starting this week.

But I want to earn that. Story first. System second.

So tomorrow — I'm going to tell you about the worst night of my life. It happened on Valentine's Day. I had a plan. It didn't go the way I expected. That's an understatement.

Watch for my email tomorrow. You'll want to read it somewhere private.

PS: There's someone else in this story. Her name is Sarah. She was 21 years old. And on the night everything collapsed — she was on her knees on the other side of a locked door, praying. Tomorrow you'll understand why I'm telling you about her.`,
  },
  {
    subject: 'The worst night of my life',
    preheader: 'I told you yesterday there was a worse night coming. This is it.',
    body: `Yesterday I told you about the man who built a business that works — and a life that doesn't.

Today I'm going to tell you about the night that changed everything. Not because I want your sympathy. But because I need you to understand something — something that took me years and a hospital bed to learn.

It was 4AM. Valentine's Day.

I was sitting at my desk in England — energy drink in one hand, cigarette in the other — and I hadn't slept in days. I don't even know how many days. I had stopped counting.

My girlfriend Sarah was somewhere in the apartment. I could hear her crying. And I did nothing. Because all that mattered was the money.

I had a plan for that night. I was going to take her to the best restaurant in London. I was going to propose. I had the ring in my head, the speech rehearsed, the whole scene mapped out. There was just one problem. I was completely broke.

So I worked harder. I worked longer. I stopped sleeping. I stopped eating real food. I stopped noticing that Sarah had stopped talking to me the way she used to. I told myself *this was the season.* That once I hit the next number, everything would be different.

I had been telling myself that for two years.

And then, at 4 in the morning, something broke. Not in the business. In me.

All of it came crashing down at once — the exhaustion, the shame, the fear, the guilt I had been compressing for months. I started crying. Then laughing. At the same time. I couldn't tell the difference between what was real and what wasn't.

*This is the part I don't like telling.*

I grabbed the TV and threw it through the window. I kicked the kitchen door until it broke. I picked up the table and threw it three meters across the room. In three minutes, the entire apartment was destroyed.

Then I went to the kitchen. I opened a drawer. I took out a knife. And I started cutting myself — right there in front of Sarah.

She ran to the bedroom and locked the door. She was terrified. She had no choice. She called the police. They came in. I attacked them. They tasered me. I felt every nerve in my body burn at once.

And I was screaming — *"Baby... baby... help me..."*

She was on her knees on the other side of that locked door. Praying. She couldn't help me. Nobody could help me in that moment.

The police handcuffed me, put me in the back of a van, and locked me in a mental health institution.

The next morning, a doctor sat down with Sarah. He told her I would never recover. That I would be like this for the rest of my life. That she was young — she had her whole life ahead of her — and she should move on.

She was 21 years old. She had no money, no job, a destroyed apartment, and a boyfriend in a psychiatric ward. And a doctor — someone she was supposed to trust — was telling her that the person she loved was gone and was never coming back.

What she did next is something I will tell you about tomorrow.

But right now, I want to stay with that scene for a moment. Because here is what I need you to understand.

I was not weak. I was not crazy. I was not a bad person. I was an entrepreneur who had believed — deeply, completely, without question — in what I now call **The Sacrifice Myth.**

The belief that to build something great, you have to destroy something else. Your health. Your relationships. Your sleep. Your peace of mind. That *this is the price.*

I had paid that price. I had paid it in full. And I had nothing left.

The man in that apartment was not a stranger. He was a version of me that had been created, systematically, by years of the wrong operating system. By the conviction that if he just pushed harder, sacrificed more, slept less — it would all be worth it in the end.

He was wrong.

And if you recognize any part of his Tuesday morning in your own — the laptop open at midnight, the "good morning" without looking up, the "after this launch" that never comes — then I am writing this to you. Not to scare you. To show you that the path I was on has a destination. And it is not the one you are working toward.

Tomorrow I am going to tell you what happened after that night. What the olanzapine did to me. What 30 kilograms in 90 days feels like. What it is like to look in the mirror and not recognize yourself.

And what Sarah did every single day while I was inside that institution — even after the doctor told her to leave.

PS: Sarah was on her knees on the other side of that locked door, praying. The doctor told her to leave. She came back the next day anyway. And the day after that. And every day after that. Tomorrow I'll tell you why — and why it changes everything about what I'm going to share with you this week.`,
  },
  {
    subject: 'The doctor told her to leave me',
    preheader: 'The worst part wasn\'t the hospital. It was what came after.',
    body: `Yesterday I told you about the night everything collapsed. The TV through the window. The knife. The taser. The police van.

If you didn't read that email — go back and read it first. Today picks up exactly where that story ended. Because what happened *after* the handcuffs — that's the part that almost finished me for good.

They took me to a mental health institution in England.

I don't remember much of the first few days. I remember the smell — antiseptic and something stale underneath it. I remember the lights never fully going off. I remember lying on a bed staring at the ceiling and not being able to feel anything. Not fear. Not shame. Not sadness. Nothing.

Just... white noise.

Sarah came to visit. Every day. She was 21 years old. No job. No money. Our apartment was destroyed. She had watched the police taser her boyfriend and drag him away in handcuffs on Valentine's Day.

And she came back the next day. And the day after that.

The doctor called her in for a meeting. I wasn't there for it. She told me about it later, much later, when we were strong enough to talk about it without it breaking something between us.

The doctor sat across from her and said, very calmly, the way doctors say things they have said many times before:

*"He won't recover. People like him — they don't come back from this. You're young. You have your whole life ahead of you. You should move on."*

She was 21. She nodded. She thanked him. She walked out. And then she came back the next day.

I came out of the institution about a month later. On a medication called olanzapine.

If you've never heard of it — it's a heavy antipsychotic. It keeps you stable. It also, as I discovered, turns you into something that is technically alive but not really *living.*

I slept 14 hours a day. Sometimes more. I woke up and I couldn't remember why I was supposed to get out of bed. I ate — not because I was hungry, but because eating was something to do. I gained 30 kilograms. I couldn't tie my own shoelaces without stopping to rest.

I want you to hold that image for a second. Not because I want your sympathy. But because I need you to understand the distance between that man on the floor struggling with his shoelaces — and the man writing this email to you right now.

That distance is not motivation. It is not willpower. It is not a morning routine.

It is a *system.*

But I didn't know that yet. In those months, I knew nothing. The things I used to believe about myself — that I was driven, that I was capable, that I could push through anything — all of it had been dissolved by the medication and the shame and the weight of what had happened.

I had one thought that kept surfacing:

*"Maybe the doctor was right. Maybe this is just who I am now."*

I want to speak directly to you. Because I know some version of that thought has visited you too.

Not in a hospital room. Not with handcuffs and antiseptic. But at 11pm when the laptop is still open and the house is quiet and you're asking yourself — honestly, underneath the productivity language and the goal-setting and the next launch — *"What if I just can't do both? What if this is just who I am?"*

That thought is a lie. I know it is a lie because I lived it as a truth for almost a year — and then I found a way out.

But the way out was not what I expected. It wasn't therapy. It wasn't another system. It wasn't a motivational speech or a course or a morning routine.

It started with a truck. And a piece of paper. And 8 reasons written in the dark.

Tomorrow I'll tell you about March 12th — the day I wrote that list, and the decision that changed everything. It was not a dramatic moment. There were no trumpets. But it was the day the operating system of my life began to be rebuilt. From scratch.

PS: Sarah came back every day. The doctor told her to leave. What I haven't told you yet is what she said to me on the day I came out of the institution. Four words. I've never forgotten them. I'll tell you what they were tomorrow — because they matter more to this story than almost anything else.`,
  },
  {
    subject: 'The list that saved my life',
    preheader: 'One piece of paper. Eight reasons. The last one I\'m almost ashamed to share.',
    body: `If you've been following along this week, you know where I was.

Thirty kilograms overweight. On antipsychotics that turned me into a vegetable. Living in Romania with no money, no job, and a girlfriend a doctor had told — to her face — that she should leave me.

I couldn't drive. I could barely cook. Most days I didn't leave the apartment.

And somewhere in that fog, I had a thought that I think a lot of people in that situation have — and almost nobody talks about.

*What if this is the best it gets?*

Not a dramatic thought. Not a cry for help. Just a quiet, exhausted surrender. Like a machine that's been running on emergency power for so long it forgets what full power even feels like.

That thought scared me more than the hospital had.

On March 12th — I don't know why that day specifically, I just remember the date — I sat down at the kitchen table and I took a piece of paper.

And I wrote down eight reasons I was going to change.

Not goals. Not a vision board. Not a SMART framework. Eight reasons. Messy, honest, some of them embarrassing.

I'm not going to share all eight with you today. But I'll share the last one. Number eight on the list.

*"Make sure Sarah doesn't leave me for someone better."*

That was it. That was the reason that made the list real. Not the noble ones at the top — "be healthy," "build something meaningful." Those felt like things I was supposed to write. Number eight felt like the truth.

I've shown that list to thousands of entrepreneurs since then. And every single time, someone in the room goes quiet when they hear reason number eight. Because they have their own version of it. The reason they would never say out loud. The one that actually has weight.

That's the reason you build the system around. Not the aspirational one. The real one.

The next day, I got a job as a truck driver. Not for the money. I was spending more on courses and audiobooks than I was earning behind the wheel. I did it because I needed to move. Because the apartment had become a prison.

Every day, I'd finish my deliveries. Pull the truck into a lay-by. And for 30 to 60 minutes — I'd work out in the cab. Resistance bands. Push-ups on the step. Whatever I could do.

The first day, I lasted 20 minutes and felt like I was dying. The second day, I went 25.

No gym. No coach. No perfect conditions. Just a lay-by on a motorway in England, resistance bands, and a list of eight reasons in my jacket pocket.

While I drove — six, seven, sometimes eight hours a day — I listened. Napoleon Hill. Tony Robbins. James Clear. Cal Newport. Every mindset framework, every productivity system, every personal development course I could find. Forty hours a week of pure education. For months.

After the first month — minus 10 kilograms. After two months — minus 18. And something I hadn't felt in years. Something I didn't even have a name for at first. **Self-respect.**

Not confidence. Not motivation. Not the pumped-up feeling from a good YouTube video. Something quieter. More permanent. The feeling of a man who said he would do a thing and then did the thing.

After four months — minus 30 kilograms. And one day, driving through the English countryside, I noticed something. The weight in my chest was gone.

The depression I had carried for over a year — the thing the doctor said I would never escape — had quietly packed up and left while I was busy doing the work.

I pulled over. I sat in the cab for a few minutes. And I thought: *who do I thank for this?*

There was no one to call. No guru who had handed me the answer. I had built something myself — piece by piece, from desperation, in a truck cabin on a motorway — and it had worked.

I didn't have a name for it yet. But I had the bones of something.

Tomorrow I'll show you what that something became. Why it worked when everything else had failed. It has nothing to do with discipline. Or motivation. Or willpower. It has to do with a layer that every other system misses entirely.

PS: The four words Sarah said to me the morning I showed her the list. She read it. All eight reasons. She got to number eight — the one about her. She looked up.

*"I already knew that."*

She had known the whole time that she was the real reason. She had stayed anyway. Not because I deserved it. Because she had decided — somewhere in that awful year — that she was going to bet on the version of me that hadn't shown up yet.`,
  },
  {
    subject: 'Why your morning routine made things worse',
    preheader: 'The problem was never your discipline. It was the wrong tool for the wrong problem.',
    body: `Yesterday I told you about March 12th. The piece of paper. The eight reasons. And I told you about the truck. The resistance bands in the passenger seat. The 40 hours a week of education through a single earpiece while I drove across England.

Four months later: minus 30 kilograms. Depression gone. Not managed — gone.

Today I want to tell you *why* that worked. Because it wasn't what you think.

Before the truck, I had tried everything.

**GTD.** I built the entire system — inboxes, contexts, weekly reviews. It lasted six weeks. Then life happened and the system collapsed under the weight of what I was actually feeling.

**Pomodoro.** Twenty-five minutes of work, five minutes of rest. Sounds simple. But when your mind is running anxiety on a loop, you don't need a timer. You need to stop the loop.

**The 5AM Club.** I woke up at 5am for eleven days. I was exhausted by 9am and a wreck by 2pm. I was already sleeping badly. Adding less sleep to a broken foundation made everything worse.

**Deep Work.** Cal Newport's masterpiece — and completely useless to me in that state. Deep Work requires a calm, focused mind. I had neither.

Every single one of these systems failed me. And for a long time, I believed that meant I was broken. That the problem was my discipline. My character. My inability to follow through.

*I was wrong.*

Here is what I eventually understood — and what the productivity industry will never put on a sales page:

**Every system ever built assumes you already have energy.**

GTD is an energy management tool. It helps you organize and deploy energy you already have. The 5AM Club is an energy optimization tool. Deep Work is an energy focus tool. They are all tools for people who are already running.

*But what happens when the engine is dead?*

What happens when you wake up and the first sensation isn't motivation — it's dread? When you open your task list and instead of feeling focused, you feel like someone dropped a building on your chest?

You try to force the system anyway. You use whatever scraps of willpower you have left just to open the laptop, just to start. And by 10am, the willpower is gone. You're scrolling. You're doing the easy things. You're busy being busy.

And then comes the worst part. You don't blame the system. You blame yourself.

*"I'm not disciplined enough. I'm not cut out for this. Everyone else can follow through. I can't."*

I said those exact words to myself. For years. If you have said them to yourself — **you are wrong.** And I need you to hear that clearly.

The reason the truck worked wasn't the resistance bands. It wasn't the audiobooks. It wasn't even the specific frameworks I was studying.

It was the *sequence.*

I moved my body first. Every day, before anything else, I created a physical state change. Not for fitness — I didn't care about fitness yet. I did it because movement generates energy. And energy is the one thing every other system requires but none of them teach you how to build.

*Body first. Everything else comes after.*

That was the insight. The layer that every productivity system in history has skipped. You cannot install a new operating system on a crashed machine. You have to restore power first.

I spent the next two years testing this idea obsessively. Refining it. Running it on myself, then on others. I built it into a framework with four components. I call it the **4B Framework.**

**Body.** The vehicle. You can have the clearest goals and the most powerful vision in the world — but if your body is running on three hours of sleep, caffeine, and cortisol, you're not going anywhere. Body first. Always.

**Being.** The inner compass. When you're in burnout, your inner world is white noise — anxiety, self-doubt, the critical voice that runs on a loop. You can't make good decisions. You can't lead. You can't create.

**Balance.** The anchor. No success in business compensates for failure at home. I learned this the hardest possible way. If a relationship isn't growing, it's dying.

**Business.** Last. Notice that. Business is last — not because it doesn't matter, but because a healthy business can only be built on a healthy personal foundation. When the first three legs are solid, business doesn't feel like survival. It feels like creation.

Tomorrow I'm going to show you the specific tool I built to solve execution. The thing that takes 15 minutes on a Sunday and eliminates confusion for the entire week. I call it the **Domino Door.**

Stay with me — because this is the piece that changes everything.

PS: When I was in the truck — four months, thousands of kilometres, resistance bands and audiobooks — Sarah was back in Romania. Waiting. She told me later what she had decided: *"You were fighting for us. The least I could do was hold the ground."*`,
  },
  {
    subject: 'The operating system I built in a truck cabin',
    preheader: 'Body first. Everything else comes after. Here\'s why it works.',
    body: `Yesterday I told you why your morning routine probably made things worse. Not because you did it wrong. Because it was built for someone who already has energy. And you don't. Not right now.

So today I want to tell you what actually works.

But first — I need to take you back to a truck cab somewhere on the M1 motorway in England.

It's 6 AM. Dark outside. I've already done my first delivery. I'm parked in a lay-by, and I'm doing push-ups on the step of a 40-tonne lorry.

I'm 30 kilograms overweight. I'm on antipsychotics. The doctor told my girlfriend — three weeks ago — that I would never recover. And I'm doing push-ups in a lay-by.

Not because I felt like it. I didn't feel anything. I was still numb from the medication. My body was a stranger to me. I did it because I had written down eight reasons why I was going to change. And reason number one on that list was *"get your body back."*

Not six-pack abs. Not a physique. Just — get back inside your own body. Because for six months, I had been floating somewhere outside it.

After the push-ups, I climbed back in the cab, plugged in my headphones, and drove for seven hours.

I listened to Napoleon Hill. Tony Robbins. James Clear. Cal Newport. My girlfriend thought I was crazy. Maybe I was.

After month one: minus 10 kilograms. After month two: minus 18 kilograms. And something else happened that I did not expect. I started to feel like myself again. Not confident. Not transformed. Just — *present.* Like the lights had come on in a room that had been dark for a long time.

After month four: minus 30 kilograms. Depression gone. Not reduced. Not managed. **Gone.**

I remember the exact moment I noticed. I was driving somewhere in Gloucestershire, morning light coming through the windscreen, and I realized — I was happy. Genuinely happy. Not because anything had changed in my circumstances. Because something had changed in me.

Here's what I didn't understand at the time — and what took me years of study to be able to articulate clearly:

I hadn't solved a fitness problem. I had fixed the foundation.

Everything I had tried before — the productivity systems, the goal-setting, the hustle — had been attempts to build something on a cracked foundation. And no matter how good the building is, if the foundation is broken, it collapses.

What changed in that truck cabin was the foundation. And once the foundation changed, everything else changed with it.

I call it the **4B Framework**. Four domains that are not separate — they are a single system. Like a chair with four legs.

**Body.** Not six-pack abs. Not a marathon. The minimum viable physical foundation that gives your brain the chemistry it needs to think, decide, and lead. When I did push-ups in that lay-by every day, I wasn't building a physique. I was rebuilding my neurology.

**Being.** Your inner world. In burnout, that voice is running on a loop of fear, shame, and self-criticism. The Being work isn't therapy — it's a 10-minute daily process that resets that voice before it runs your day.

**Balance.** Your relationship with the people who matter. When I ignored Balance, I almost lost everything that actually made the business worth building. Five minutes a day. A message. A moment of presence.

**Business.** Last. Because a business built on the first three foundations doesn't feel like survival. It feels like creation.

You cannot solve an energy problem with a planning tool. You can only solve an energy problem by rebuilding the source of your energy.

Body. Being. Balance. In that order. Once those three are running, the fourth — Business — stops being a weight you carry and starts being something you build.

I call the whole system the **CEO Mind OS**. Not a productivity app. Not another morning routine. A **Founder Operating System** — built specifically for the entrepreneur who is running on empty and needs to generate the energy before they can execute the plan.

I'll show you exactly how to install it tomorrow.

But for tonight — I want you to do one thing. Think about those four areas. Body. Being. Balance. Business. Be honest with yourself. Which one is completely collapsed right now?

Because that's where we start.

PS: Alexandru came to me in a situation very similar to yours. Marriage two years from divorce. Health broken. Business grinding but not growing. He used this framework — all four domains, starting with the one that was most collapsed. Six months later, his marriage was rebuilt, his body was back, and his business had exploded. Not because he found motivation. Because he fixed the foundation. Tomorrow I'll show you how.`,
  },
  {
    subject: 'The system I built in a truck cabin (now it lives in your phone)',
    preheader: 'Every system assumed you had energy. You didn\'t. Here\'s what actually fixes that.',
    body: `Yesterday I told you about what I built. The Domino Door. The CEO Warrior Routine. The Stack. The 4B Framework — Body, Being, Balance, Business.

I described the architecture. Today I want to show you why it works when everything else hasn't. And then I want to give you access to the whole thing.

But first — one honest question. **How many productivity systems have you tried?**

GTD. Pomodoro. The 5AM Club. Deep Work. Atomic Habits. Bullet Journal. Some combination of all of them, duct-taped together with good intentions and a new notebook every January.

And how many of them are still running in your life right now?

I already know the answer. Because I lived it.

Here's what nobody in the productivity industry will put on their sales page: *Every system ever built for entrepreneurs assumes you already have energy.*

They are performance optimizers. Tools for people who wake up with a full tank and need better structure. They are brilliant — for someone else's problem.

Your problem is different. You're not understructured. You're undercharged. You're trying to run accounting software with nothing in the account. So the software isn't the issue. The account is empty.

That's not a discipline problem. That's not a character flaw. That is a structural gap that none of those systems were designed to fix — because they were built for a different person.

What I built — CEO Mind OS — starts where every other system stops. It doesn't assume you have energy. It generates it first.

Think of it this way. Your phone runs on iOS or Android. That's the operating system — the software that runs everything underneath every app. When your OS crashes, it doesn't matter how good your apps are. Nothing works.

You've been trying to install productivity apps on top of a crashed operating system. CEO Mind OS is the OS itself.

The four core components are these:

**The Domino Door** — one massive weekly action that, if executed, makes everything else fall into place or become irrelevant. An AI Planner guides you through the whole process every Sunday. Your entire week planned in fifteen minutes. Monday morning, you know exactly what to do. No overwhelm.

**The CEO Warrior Routine** — eleven daily steps that happen *before* you touch a single work task. Mind Coach AI conversation, hydration, gratitude, vision declaration, breathwork, meditation, physical movement, and a relationship investment that takes five minutes and compounds over 365 days.

**Mind Coach AI and Accountability Coach AI** — two coaches in your pocket, available around the clock. When the anxiety wave hits, you don't scroll. You open Mind Coach and run The Stack. You come out the other side in ten minutes with clarity and one concrete next step.

**The Stack** — five phases that carry you from paralysis to action. Identify the emotion. Investigate the story. Challenge whether it's true. Choose a more powerful story. Commit to one small action right now. Because action is the antidote to anxiety.

What I spent four years building piece by piece — in a truck cabin, in the ashes of a psychiatric institution, through obsessive study and painful trial and error — I have built into a platform.

So you don't have to figure it out alone.

**5 days. Completely free. No credit card required.**

Not a demo. Not a limited preview. The full PRO platform — Mind Coach AI, Accountability Coach AI, The Door, Daily Flow, Vision Board AI, The Stack, Brotherhood Community, every video course. Everything.

For five days, I want you to wake up with the CEO Warrior Routine guiding you step by step. Plan your first Domino Door. Have one conversation with Mind Coach AI when you feel overwhelmed and watch what happens to your state in ten minutes.

After five days, you decide. If it works — you stay. If it doesn't — one click and you pay nothing. No emails back and forth. No hoops.

The worst case: you spend five days with the most powerful entrepreneurial operating system ever built and walk away paying nothing.

There is no risk here. The only risk is not trying.

PS: The entrepreneurs who've transformed the fastest inside CEO Mind OS are the ones who acted immediately — while the decision was fresh, while the window was open. Alexandru didn't wait. He clicked. Six months later his marriage was saved, his health was back, and his business had exploded.`,
  },
  {
    subject: 'You\'ve been lied to (and here\'s the proof)',
    preheader: 'It wasn\'t your discipline. It was the wrong tool for the wrong problem.',
    body: `I want to talk about the voice in your head right now.

The one that's been listening to this week's emails and saying: *"Alin, this sounds powerful. But I've heard powerful before. I bought the course. I downloaded the app. I did the morning routine for eleven days and then life happened and I was back to exactly where I started."*

I hear you.

And I want to tell you something that the people who sold you those systems never told you.

**It wasn't your fault.**

Not the GTD collapse after three weeks. Not the Pomodoro sessions that fell apart by Tuesday. Not the 5AM Club phase that left you more exhausted than before. Not the Bullet Journal you kept perfectly for one month and then abandoned on a shelf.

None of that was a character flaw. None of it meant you were lazy, undisciplined, or not cut out for this.

Here's what was actually happening. Every single system you tried was built for someone who already has energy.

GTD assumes you can process and categorise your entire life into a trusted system — but that requires hours of sustained focus that burnout actively destroys. Pomodoro assumes 25 minutes of deep concentration is the problem — but when your nervous system is in permanent fight-or-flight, 25 minutes of focus is a luxury you don't have. The 5AM Club assumes that waking up earlier gives you more capacity — but if you're sleeping four hours and running on adrenaline, you're not getting a power hour. You're getting an anxiety hour.

These are excellent tools. I'm not calling them frauds. But they are **performance optimizers.** They are built for the person who already has a full tank and needs better structure. They are not built for the person whose tank has been empty for two years.

Trying to install a performance optimizer on a crashed operating system is like running accounting software with no money in the account. The software is fine. The account is empty. Nothing works.

And every time it failed — every time you fell off the system, every time you woke up and couldn't face the task list — you didn't blame the software. You blamed yourself.

*"I'm the problem. Other people can do this. I can't."*

That voice? That's not the truth. That's the damage the wrong system leaves behind.

CEO Mind OS is built differently. From the foundation up. It doesn't start with your task list. It starts with your state — your emotional and physiological condition in that specific moment, on that specific morning. Before you touch a single task, the system asks: *how are you actually showing up today?*

Because 80% of what determines whether you execute is not your strategy. It's your psychology. And every other system ignores this completely.

The Mind Coach AI conversation takes ten minutes. You tell it how you feel — overwhelmed, scattered, anxious, flat, whatever is true. It runs you through The Stack. You come out the other side with clarity and one small action you can take right now.

Then, and only then, do you touch the task list.

That's the difference. Not a smarter to-do list. Not a better time-blocking template. A system that generates the energy and the state first — and then executes from a position of strength.

I know some of you are also thinking: *"Alin, this sounds too good to be true. What's the catch?"*

Fair. I'd be suspicious too. So here's the plain answer.

The catch is this: **the system works — but only if you do.** CEO Mind OS is not a magic pill. It doesn't run itself. If you open the platform and do nothing, nothing changes.

But if you wake up tomorrow morning, open Daily Flow, drink your glass of water, spend ten minutes with Mind Coach AI, and plan your Domino Door for the week — your life begins to change. Not in 90 days. Starting tomorrow morning.

That's the only catch. You have to actually use it.

Which is why I want to make this as close to zero-risk as I possibly can. **5-day free trial. No credit card. No payment details.** Full CEO Mind OS PRO platform.

The worst case: you spend five days with the most powerful founder operating system ever built, and you walk away paying nothing. The only risk is another week on the old operating system.

Tomorrow I'm sending you a case study. Not mine. Someone whose collapse was quieter than mine — and whose comeback was every bit as complete.

PS: The first 10 people who start the trial get a personal one-on-one onboarding call with me — we set up the platform together, build your first Domino Door live, and install the CEO Warrior Routine for your specific situation. That's a €500 value, free. If you've been on the fence — this is the moment.`,
  },
  {
    subject: 'The man whose marriage was two years from over',
    preheader: 'His marriage was dying. His health was gone. His business was lying to him.',
    body: `Yesterday I showed you the system. Today I want to show you the system working — on someone who isn't me.

Because I know what some of you are thinking. *"Alin, your story is extraordinary. The hospital. The truck. The resistance bands. That's you. I'm not sure I'm that person."*

Fair. So let me tell you about Alexandru.

Alexandru didn't end up in a psychiatric ward. He didn't get tasered by police or lose 30 kilograms in a truck cabin. His collapse looked quieter than mine. Which almost made it worse — because it was harder to see coming.

From the outside, Alexandru was succeeding. Business was running. Revenue was coming in. He was the kind of man who showed up, who delivered, who figured things out. The kind of man you'd look at and think: *he has it together.*

But here's what was actually happening.

He was working 60, 70 hours a week. His phone was the last thing he looked at before sleep and the first thing he looked at when he woke up.

His wife had stopped telling him things. Not dramatically. Not with a fight. She had just... stopped. Because she knew he wasn't really there. He was present in the room but absent in every way that mattered. And she had learned, slowly and quietly, not to need him.

His kids had adjusted to a version of their father that showed up physically but never fully arrived. His body was breaking down in the background — the kind of breaking that happens slowly enough that you can ignore it.

And his business — the thing he had sacrificed all of this for — wasn't even delivering what he'd been promised. It was growing, yes. But not fast enough to justify the cost. And he knew it.

**His marriage was two years from divorce.**

Not his estimate. Mine — based on the pattern I've seen hundreds of times. The distance that had built between him and his wife was the kind that, left unaddressed, becomes permanent. Not with a single dramatic moment. Just with time.

When Alexandru came to CEO Mind OS, he didn't arrive looking for a productivity app. He arrived because he was exhausted. Because something had to change and he didn't know what.

He went through the CEO Warrior Routine. He planned his first Domino Door. He opened Mind Coach AI on a morning when he felt like he was being buried alive by his task list — and fifteen minutes later, he had clarity, a next step, and something he hadn't felt in months: *a sense that he was choosing his day instead of being crushed by it.*

But the thing that changed everything for Alexandru wasn't the business tools. It was five minutes a day on his relationship.

One message to his wife. One small, consistent investment. Not a grand gesture. A message. Today, what I appreciate about you. Today, what I noticed. Today, I'm thinking of you.

She didn't respond at first. He didn't expect her to. He sent it anyway. Then she started responding. Then something in the apartment changed. The temperature shifted.

His health started coming back. Because when you're not carrying the weight of a dying relationship in silence, you sleep differently.

And his business? It exploded. Not because he worked harder. Because he stopped working from a position of quiet desperation and started working from a position of strength. The Domino Door gave him the one thing that had been missing from every system he'd tried before: **clarity on what actually mattered this week.**

Alexandru didn't do anything extraordinary. He followed the system. That's it.

Here's what I want you to see — because this is not Alexandru's story. This is the pattern. I have watched this play out hundreds of times.

**Business: high.** Pushing hard, working long, carrying everything alone.
**Body: collapsing.** Energy depleted, sleep broken.
**Being: empty.** The inner world is noise.
**Balance: gone.** The relationship surviving on autopilot.

The productivity industry tells you the problem is in the Business quadrant. You need a better strategy. A better funnel. A better team.

But the chart doesn't lie. **Three of the four legs are broken — and a chair with three broken legs doesn't hold anything.** Fix the Business leg and the chair still collapses. Fix all four — the way Alexandru did, the way I did — and something that felt impossible starts to feel inevitable.

Tomorrow I'm going to send the last email. It's a question. And it's the most important question I know how to ask an entrepreneur.

PS: Alexandru's wife didn't save the marriage. One message per day did. Not because a message is magic — but because 365 messages, sent consistently, without expectation, is the most honest signal a person can send. *I'm still here. I see you. I choose you.* If there's someone in your life who has quietly stopped expecting things from you — I think you know what the first message should say.`,
  },
  {
    subject: 'This is the last email I\'ll send you',
    preheader: 'I know what it feels like to say "later." Later almost killed me.',
    body: `I want to tell you about a word. The word is *later*.

As in: "I'll look at this later." "I'll start when things calm down." "I'll fix this when the business stabilizes."

I lived inside that word for years. *Later* felt responsible. It felt mature. It felt like I was being careful, not reckless.

What it actually was — and I only understood this from a hospital bed — was a very sophisticated way of choosing the life I already had over the life I said I wanted.

*Later* is not neutral. Every time you say it, you are making a decision. You're just making it quietly, so you don't have to feel the weight of it.

This is the last email in this sequence.

Over the past week and a half, I've told you things I don't tell easily. The Valentine's Day collapse. The knife. The taser. The doctor telling Sarah to leave me. The year as a vegetable on olanzapine. The truck cabin. The resistance bands. The eight reasons on a piece of paper — including number eight, which I'm still slightly embarrassed about.

I told you all of that because I needed you to understand something important:

**The system I built wasn't built by someone who had it figured out. It was built by someone who had nothing left.**

And that matters. Because if it worked for me — starting from a psychiatric ward in England, 30 kilograms overweight, with no desire to live — it will work for you.

You are not starting from zero. You are starting from experience, from a business that already exists, from a life that is already in motion. You just need the operating system underneath it to stop crashing.

So here's where we are right now.

The **5-day free trial** of CEO Mind OS PRO is still open. No credit card. No risk. Full platform access — Mind Coach AI, Accountability Coach AI, The Door, the CEO Warrior Routine, The Stack, Vision Board AI, Belief Reprogrammer, Marriage Module, Parenting Module, Brotherhood Community, all video courses.

Five days. Starting tomorrow morning.

Now — I want to speak to the part of you that is still hesitating. Not to pressure you. But because I know that part well. I lived in it for years.

Here is what "I'll think about it" has already cost you — not in theory, but in real, measurable numbers:

The average entrepreneur without a clear operating system loses **2 to 3 hours per day** to confusion, overwhelm, and reactive firefighting. That is 60 to 90 hours per month. 720 to 1,080 hours per year.

What would you build with 1,000 extra hours?

And those are just the business hours. Not counting the dinners you were present for physically but absent from mentally. The conversations you were too tired to have. The version of your partner and your children who stopped expecting your full attention.

That cost doesn't show up on a spreadsheet. But it is real.

I am not going to tell you this is the last chance you'll ever have to change your life. That would be dishonest.

What I will tell you is this:

**The version of you who acts today and the version of you who waits — they do not end up in the same place.**

Alexandru waited for two years. Not because he didn't know something was wrong. He knew. He just kept saying *later*. And in those two years, the marriage got closer to over. The health got worse. The business stagnated.

He clicked the button. Six months later — different marriage, different body, different business.

Not because CEO Mind OS is magic. Because he stopped waiting.

The button is below this email. It takes less than two minutes. Your name. Your email. No card. No payment. No risk.

And tomorrow morning — instead of waking up and reacting to whatever the day throws at you — you wake up with the CEO Warrior Routine guiding you step by step. You open your Domino Door. You have one conversation with Mind Coach AI and watch what happens to your state in ten minutes.

That is the difference between the day you've been having and the day you could be having. Starting tomorrow.

I built this system in a truck cabin because I had no other option. You have a better option. You have the system, ready to install, starting today.

The choice is yours.

PS: Alexandru didn't feel ready when he clicked. He felt exactly what you might be feeling right now — skeptical, tired, not sure if one more thing was worth the effort. He clicked anyway. I hope you do too.`,
  },
]

// ================================================================
// RO — Romanian translations (faithful, natural Romanian)
// ================================================================
const RO: DayCopy[] = [
  {
    subject: 'Omul care și-a construit business-ul și a pierdut tot restul',
    preheader: 'Ăsta nu e încă un email despre productivitate. Rămâi cu mine.',
    body: `Lasă-mă să-ți descriu pe cineva.

Se trezește la 6:50. Nu pentru că și-a propus — pentru că creierul lui nu s-a oprit niciodată complet. Înainte să pună piciorul pe podea, deja scanează WhatsApp, emailuri, Slack. Soția lui e în bucătărie. Îi spune "bună dimineața" fără să ridice privirea de pe telefon.

Spune "bună dimineața" așa de doi ani.

Până la ora 9 a răspuns la 31 de mesaje, a luat șase decizii care trebuiau delegate, și nu s-a atins de singurul lucru care contează cu adevărat săptămâna asta. La 14:00 e la a treia cafea, mergând pe cortizol și inerție. La 19:00 e fizic acasă, dar mental încă la birou.

Culcă copiii. Deschide laptopul. Lucrează până la miezul nopții. Doarme prost. Se trezește și o ia de la capăt.

Nu a mai făcut sport de trei săptămâni. Spune mereu *lunea viitoare.*

Căsnicia lui e pe pilot automat. Spune mereu *după lansarea asta.*

Lucrurile nu se calmează. Niciodată.

Dacă nu ești tu — șterge acest email. Serios. Ce urmează să împărtășesc în următoarele zile nu e pentru toată lumea.

Dar dacă ceva a atins o coardă — dacă ai simțit o clipă de recunoaștere citind — atunci am nevoie să rămâi cu mine. Pentru că am scris asta din memorie. Nu memoria altcuiva. A mea.

Numele meu e Alin Radu. Sunt fondatorul CEO Mind OS — un Sistem de Operare pentru Fondatori construit special pentru antreprenorul care performează în business și, în tăcere, se destramă peste tot în rest.

Știu ce spunea scorul tău la Burnout Test. Și știu că văzând acel număr probabil s-a activat ceva incomod în tine. Nu surpriză. Mai degrabă *confirmare.*

Deja știai că ceva nu e în regulă. Doar că nu văzuseși până acum atât de clar.

În următoarele zile îți voi spune o poveste. E povestea mea — și începe într-un loc pe care majoritatea oamenilor n-ar recunoaște niciodată public. Trece prin cea mai grea noapte din viața mea, printr-un an pe care aș vrea să-l uit, și printr-o singură dimineață într-o cabină de camion care a schimbat totul.

Iar la final îți voi arăta exact ce am construit din acea prăbușire — și cum poate funcționa pentru tine, începând cu săptămâna asta.

Dar vreau să merit asta. Povestea întâi. Sistemul după.

Așa că mâine — îți voi spune despre cea mai grea noapte din viața mea. S-a întâmplat de Ziua Îndrăgostiților. Aveam un plan. N-a mers cum mă așteptam. E un eufemism.

Urmărește emailul de mâine. Vei vrea să-l citești într-un loc privat.

PS: E cineva altcineva în această poveste. O cheamă Sarah. Avea 21 de ani. Iar în noaptea când s-a prăbușit totul — era în genunchi de cealaltă parte a unei uși încuiate, rugându-se. Mâine vei înțelege de ce îți spun despre ea.`,
  },
  {
    subject: 'Cea mai grea noapte din viața mea',
    preheader: 'Ți-am spus ieri că vine o noapte și mai grea. Asta e.',
    body: `Ieri ți-am spus despre omul care și-a construit un business care merge — și o viață care nu merge.

Azi îți voi spune despre noaptea care a schimbat totul. Nu pentru că vreau mila ta. Ci pentru că am nevoie să înțelegi ceva — ceva ce m-a costat ani și un pat de spital să învăț.

Era ora 4 dimineața. Ziua Îndrăgostiților.

Stăteam la biroul meu în Anglia — un energizant într-o mână, o țigară în cealaltă — și nu dormisem de zile întregi. Nu știu nici câte. Încetasem să număr.

Prietena mea Sarah era undeva în apartament. O auzeam plângând. Și n-am făcut nimic. Pentru că singurul lucru care conta erau banii.

Aveam un plan pentru acea noapte. Urma s-o duc la cel mai bun restaurant din Londra. Urma să o cer în căsătorie. Aveam inelul în cap, discursul repetat, toată scena mapată. Era o singură problemă. Eram complet falit.

Așa că lucram mai mult. Lucram mai greu. Am încetat să dorm. Am încetat să mănânc mâncare adevărată. Am încetat să observ că Sarah nu-mi mai vorbea așa cum obișnuia. Îmi spuneam *asta e sezonul.* Că odată ce ating următorul număr, totul va fi diferit.

Îmi spuneam asta de doi ani.

Și apoi, la 4 dimineața, s-a rupt ceva. Nu în business. În mine.

Totul s-a prăbușit dintr-odată — epuizarea, rușinea, frica, vinovăția pe care le comprimasem luni de zile. Am început să plâng. Apoi să râd. În același timp. Nu mai puteam distinge între ce era real și ce nu era.

*Asta e partea pe care nu-mi place s-o povestesc.*

Am apucat televizorul și l-am aruncat pe fereastră. Am dat cu piciorul în ușa de la bucătărie până s-a rupt. Am ridicat masa și am aruncat-o trei metri prin cameră. În trei minute, tot apartamentul era distrus.

Apoi m-am dus la bucătărie. Am deschis un sertar. Am scos un cuțit. Și am început să mă tai — chiar acolo, în fața Sarei.

A fugit în dormitor și a încuiat ușa. Era îngrozită. N-a avut de ales. A sunat la poliție. Au venit. I-am atacat. M-au tras cu pistolul cu electroșocuri. Am simțit cum îmi arde fiecare nerv din corp în același timp.

Și strigam — *"Iubita mea... iubita mea... ajută-mă..."*

Ea era în genunchi de cealaltă parte a acelei uși încuiate. Se ruga. Nu putea să mă ajute. Nimeni nu putea să mă ajute în acel moment.

Poliția m-a încătușat, m-a pus în duba și m-a închis într-o instituție de sănătate mintală.

A doua zi dimineața, un medic a stat de vorbă cu Sarah. I-a spus că nu mă voi recupera niciodată. Că voi fi așa pentru tot restul vieții. Că e tânără — avea toată viața în față — și că ar trebui să meargă mai departe.

Avea 21 de ani. Fără bani, fără muncă, cu un apartament distrus și un iubit într-o secție de psihiatrie. Iar un medic — cineva în care ar fi trebuit să aibă încredere — îi spunea că persoana pe care o iubea era pierdută și nu se mai întorcea.

Ce a făcut ea în continuare îți voi spune mâine.

Dar acum, vreau să stau puțin cu acea scenă. Pentru că iată ce am nevoie să înțelegi.

Nu eram slab. Nu eram nebun. Nu eram un om rău. Eram un antreprenor care crezuse — profund, complet, fără îndoială — în ceea ce numesc acum **Mitul Sacrificiului.**

Convingerea că pentru a construi ceva mare, trebuie să distrugi altceva. Sănătatea. Relațiile. Somnul. Liniștea mintală. Că *ăsta e prețul.*

Plătisem acel preț. Îl plătisem integral. Și nu mai aveam nimic.

Omul din acel apartament nu era un străin. Era o versiune a mea creată sistematic, prin ani de sistem de operare greșit. Prin convingerea că dacă doar împinge mai tare, sacrifică mai mult, doarme mai puțin — va merita totul la final.

Se înșela.

Și dacă recunoști vreo parte din dimineața lui de marți în a ta — laptopul deschis la miezul nopții, "bună dimineața" fără să ridici privirea, "după lansarea asta" care nu vine niciodată — atunci îți scriu ție. Nu ca să te sperii. Ca să-ți arăt că drumul pe care eram avea o destinație. Și nu e cea spre care lucrezi tu.

Mâine îți voi spune ce s-a întâmplat după acea noapte. Ce mi-a făcut olanzapina. Cum se simt 30 de kilograme luate în 90 de zile. Cum e să te uiți în oglindă și să nu te recunoști.

Și ce a făcut Sarah în fiecare zi cât timp am fost în acea instituție — chiar și după ce medicul i-a spus să plece.

PS: Sarah era în genunchi de cealaltă parte a acelei uși încuiate, rugându-se. Medicul i-a spus să plece. Ea s-a întors a doua zi oricum. Și în ziua următoare. Și în fiecare zi după aceea. Mâine îți voi spune de ce — și de ce asta schimbă totul despre ce voi împărtăși săptămâna asta.`,
  },
  {
    subject: 'Medicul i-a spus să mă părăsească',
    preheader: 'Partea cea mai grea nu a fost spitalul. A fost ce a venit după.',
    body: `Ieri ți-am spus despre noaptea în care s-a prăbușit totul. Televizorul prin fereastră. Cuțitul. Electroșocurile. Duba poliției.

Dacă n-ai citit acel email — întoarce-te și citește-l întâi. Azi continui exact de unde s-a oprit povestea. Pentru că ce s-a întâmplat *după* cătușe — asta e partea care aproape că m-a terminat pentru totdeauna.

M-au dus într-o instituție de sănătate mintală din Anglia.

Nu-mi amintesc mult din primele zile. Îmi amintesc mirosul — antiseptic și ceva stătut dedesubt. Îmi amintesc cum luminile nu se stingeau niciodată complet. Îmi amintesc cum stăteam pe pat privind tavanul și nu simțeam nimic. Nici frică. Nici rușine. Nici tristețe. Nimic.

Doar... zgomot alb.

Sarah venea să mă viziteze. În fiecare zi. Avea 21 de ani. Fără muncă. Fără bani. Apartamentul nostru era distrus. Îl văzuse pe iubitul ei atacat cu electroșocuri și târât în cătușe de Ziua Îndrăgostiților.

Și s-a întors a doua zi. Și în ziua următoare.

Medicul a chemat-o la o discuție. Eu nu eram acolo. Mi-a povestit mult mai târziu, când eram destul de puternici să vorbim fără să se rupă ceva între noi.

Medicul s-a așezat în fața ei și i-a spus, foarte calm, așa cum medicii spun lucruri pe care le-au spus de multe ori:

*"Nu se va recupera. Oamenii ca el — nu se întorc din asta. Ești tânără. Ai toată viața în față. Ar trebui să mergi mai departe."*

Avea 21 de ani. A dat din cap. I-a mulțumit. A ieșit. Și apoi s-a întors a doua zi.

Am ieșit din instituție după aproximativ o lună. Pe un medicament numit olanzapină.

Dacă n-ai auzit — e un antipsihotic puternic. Te ține stabil. Dar, cum am descoperit, te transformă în ceva care e tehnic viu, dar nu chiar *trăiește.*

Dormeam 14 ore pe zi. Uneori mai mult. Mă trezeam și nu-mi aminteam de ce trebuia să mă ridic din pat. Mâncam — nu pentru că îmi era foame, ci pentru că mâncatul era ceva de făcut. Am pus 30 de kilograme. Nu puteam să-mi leg șireturile fără să mă opresc să mă odihnesc.

Vreau să reții imaginea asta pentru o secundă. Nu ca să-mi porți milă. Ci ca să înțelegi distanța dintre omul acela de pe podea care se lupta cu șireturile — și omul care îți scrie acest email acum.

Distanța aia nu e motivație. Nu e voință. Nu e o rutină de dimineață. E un *sistem.*

Dar încă nu știam asta. În acele luni nu știam nimic. Lucrurile pe care le credeam despre mine — că eram determinat, că eram capabil, că puteam trece prin orice — toate fuseseră dizolvate de medicamente, rușine și greutatea a ceea ce se întâmplase.

Aveam un singur gând care revenea:

*"Poate medicul avea dreptate. Poate ăsta sunt acum."*

Vreau să-ți vorbesc direct. Pentru că știu că vreo versiune a acelui gând te-a vizitat și pe tine.

Nu într-o cameră de spital. Nu cu cătușe și antiseptic. Ci la 11 seara când laptopul e încă deschis și casa e liniștită și te întrebi — sincer, dincolo de limbajul productivității și de setarea de obiective — *"Ce dacă pur și simplu nu pot face ambele? Ce dacă ăsta sunt eu?"*

Acel gând e o minciună. Știu că e o minciună pentru că l-am trăit ca adevăr aproape un an — și apoi am găsit o cale de ieșire.

Dar calea de ieșire nu a fost ce mă așteptam. Nu a fost terapie. Nu a fost alt sistem. Nu a fost un discurs motivațional sau un curs sau o rutină de dimineață.

A început cu un camion. Și cu o bucată de hârtie. Și cu 8 motive scrise în întuneric.

Mâine îți voi spune despre 12 martie — ziua în care am scris acea listă și decizia care a schimbat totul. Nu a fost un moment dramatic. Nu au sunat trâmbițele. Dar a fost ziua în care sistemul de operare al vieții mele a început să fie reconstruit. De la zero.

PS: Sarah venea în fiecare zi. Medicul îi spusese să plece. Ce încă nu ți-am spus e ce mi-a zis ea în ziua în care am ieșit din instituție. Patru cuvinte. Nu le-am uitat niciodată. Îți voi spune mâine care erau — pentru că ele contează în povestea asta mai mult decât aproape orice altceva.`,
  },
  {
    subject: 'Lista care mi-a salvat viața',
    preheader: 'O foaie de hârtie. Opt motive. Ultimul mi-e aproape rușine să-l împărtășesc.',
    body: `Dacă m-ai urmărit săptămâna asta, știi unde eram.

Cu 30 de kilograme în plus. Pe antipsihotice care mă transformaseră într-o legumă. Trăiam în România fără bani, fără muncă, cu o prietenă căreia un medic îi spusese — în față — să mă părăsească.

Nu puteam să conduc. Abia puteam să gătesc. Cele mai multe zile nu ieșeam din apartament.

Și undeva în ceața aia, am avut un gând pe care cred că îl au mulți oameni în acea situație — și despre care aproape nimeni nu vorbește.

*Ce dacă ăsta e cel mai bine cât o să fie?*

Nu un gând dramatic. Nu un strigăt de ajutor. Doar o predare tăcută, epuizată. Ca o mașinărie care merge pe curent de urgență de atât de mult timp încât uită cum se simte puterea deplină.

Acel gând m-a speriat mai tare decât spitalul.

Pe 12 martie — nu știu de ce în acea zi anume, doar îmi amintesc data — m-am așezat la masa din bucătărie și am luat o bucată de hârtie.

Și am scris opt motive pentru care aveam să mă schimb.

Nu obiective. Nu vision board. Nu framework SMART. Opt motive. Dezordonate, sincere, unele jenante.

Nu îți voi împărtăși toate opt astăzi. Dar îți spun ultimul. Numărul opt de pe listă.

*"Să mă asigur că Sarah nu mă părăsește pentru cineva mai bun."*

Ăsta era. Ăsta era motivul care făcea lista reală. Nu cele nobile de sus — "fii sănătos", "construiește ceva cu sens". Alea păreau lucruri pe care trebuia să le scriu. Numărul opt părea adevărul.

Am arătat lista aia miilor de antreprenori de atunci. Și de fiecare dată, cineva din sală tace când aude motivul numărul opt. Pentru că are propria lui versiune. Motivul pe care nu l-ar spune niciodată cu voce tare. Cel care are greutate reală.

Ăla e motivul în jurul căruia îți construiești sistemul. Nu cel aspirațional. Cel real.

A doua zi, m-am angajat șofer de camion. Nu pentru bani. Cheltuiam mai mult pe cursuri și audiobook-uri decât câștigam la volan. Am făcut-o pentru că aveam nevoie să mă mișc. Pentru că apartamentul devenise o închisoare.

În fiecare zi, terminam livrările. Trăgeam camionul într-o parcare. Și timp de 30-60 de minute — făceam antrenamente în cabină. Benzi de rezistență. Flotări pe treaptă. Ce puteam.

Prima zi am rezistat 20 de minute și m-am simțit ca și cum mor. A doua zi am făcut 25.

Fără sală. Fără antrenor. Fără condiții perfecte. Doar o parcare pe o autostradă din Anglia, benzi de rezistență, și o listă cu opt motive în buzunarul jachetei.

În timp ce conduceam — șase, șapte, uneori opt ore pe zi — ascultam. Napoleon Hill. Tony Robbins. James Clear. Cal Newport. Fiecare framework, fiecare sistem de productivitate, fiecare curs de dezvoltare personală. Patruzeci de ore pe săptămână de educație pură. Luni de zile.

După prima lună — minus 10 kilograme. După două luni — minus 18. Și ceva ce nu simțisem de ani de zile. Ceva pentru care nici nu aveam nume la început. **Respect de sine.**

Nu încredere. Nu motivație. Nu senzația electrizantă de la un video motivațional bun. Ceva mai liniștit. Mai permanent. Senzația unui om care spusese că va face ceva și apoi a făcut.

După patru luni — minus 30 de kilograme. Și într-o zi, conducând prin peisajul englezesc, am observat ceva. Greutatea din piept dispăruse.

Depresia pe care o purtasem peste un an — lucrul despre care medicul spusese că nu voi scăpa niciodată — se împachetase liniștit și plecase în timp ce eu eram ocupat făcând treaba.

Am tras pe dreapta. Am stat în cabină câteva minute. Și m-am gândit: *cui îi mulțumesc pentru asta?*

Nu era pe nimeni de sunat. Niciun guru care îmi dăduse răspunsul. Construisem ceva eu însumi — bucată cu bucată, din disperare, într-o cabină de camion pe o autostradă — și funcționase.

Nu aveam încă un nume pentru el. Dar aveam scheletul a ceva.

Mâine îți voi arăta ce a devenit acel ceva. De ce a funcționat când tot restul eșuase. Nu are nimic de-a face cu disciplina. Sau motivația. Sau voința. Are de-a face cu un strat pe care fiecare alt sistem îl ratează complet.

PS: Cele patru cuvinte pe care mi le-a spus Sarah în dimineața în care i-am arătat lista. A citit-o. Toate opt motive. A ajuns la numărul opt — cel despre ea. A ridicat privirea.

*"Știam deja."*

Știuse tot timpul că ea era motivul real. Rămăsese oricum. Nu pentru că meritam. Pentru că decisese — undeva în acel an groaznic — că avea să parieze pe versiunea mea care nu apăruse încă.`,
  },
  {
    subject: 'De ce rutina ta de dimineață a înrăutățit lucrurile',
    preheader: 'Problema n-a fost niciodată disciplina ta. A fost unealta greșită pentru problema greșită.',
    body: `Ieri ți-am spus despre 12 martie. Bucata de hârtie. Cele opt motive. Și camionul. Benzile de rezistență de pe scaunul din dreapta. Cele 40 de ore pe săptămână de educație printr-o cască în timp ce conduceam prin Anglia.

Patru luni mai târziu: minus 30 de kilograme. Depresia dispărută. Nu gestionată — dispărută.

Azi îți voi spune *de ce* a funcționat. Pentru că nu e ce crezi.

Înainte de camion, încercasem totul.

**GTD.** Am construit sistemul complet — inbox-uri, contexte, review-uri săptămânale. A ținut șase săptămâni. Apoi viața s-a întâmplat și sistemul s-a prăbușit sub greutatea a ceea ce simțeam de fapt.

**Pomodoro.** Douăzeci și cinci de minute de muncă, cinci de odihnă. Sună simplu. Dar când mintea îți rulează anxietatea pe repeat, nu ai nevoie de un cronometru. Ai nevoie să oprești bucla.

**5AM Club.** M-am trezit la 5 dimineața unsprezece zile. Eram epuizat la 9 și distrus la 14. Deja dormeam prost. Să adaug mai puțin somn peste o fundație spartă a înrăutățit totul.

**Deep Work.** Capodopera lui Cal Newport — și complet inutilă pentru mine în acea stare. Deep Work necesită o minte calmă, concentrată. Nu aveam niciuna.

Fiecare dintre aceste sisteme a eșuat. Și mult timp am crezut că asta însemna că eu sunt cel stricat. Că problema era disciplina mea. Caracterul meu. Incapacitatea mea de a duce lucrurile la capăt.

*Mă înșelam.*

Iată ce am înțeles în cele din urmă — și ce industria de productivitate nu va pune niciodată pe o pagină de vânzări:

**Fiecare sistem construit vreodată presupune că ai deja energie.**

GTD e un instrument de management al energiei. Te ajută să organizezi și să aplici energia pe care o ai deja. 5AM Club e un instrument de optimizare a energiei. Deep Work e un instrument de focalizare a energiei. Sunt toate unelte pentru oameni care deja aleargă.

*Dar ce se întâmplă când motorul e mort?*

Ce se întâmplă când te trezești și prima senzație nu e motivația — e frica? Când deschizi lista de sarcini și în loc să te simți concentrat, te simți ca și cum ți-a căzut o clădire în piept?

Încerci să forțezi sistemul oricum. Folosești fiecare fărâmă de voință pe care o mai ai doar să deschizi laptopul. Iar până la 10, voința s-a dus. Ești pe scroll. Faci lucrurile ușoare. Ești ocupat fiind ocupat.

Și apoi vine partea cea mai grea. Nu dai vina pe sistem. Dai vina pe tine.

*"Nu sunt suficient de disciplinat. Nu sunt făcut pentru asta. Toți ceilalți reușesc. Eu nu."*

Am spus exact acele cuvinte. Ani de zile. Dacă și tu le-ai spus — **te înșeli.** Și am nevoie să auzi asta clar.

Motivul pentru care camionul a funcționat n-au fost benzile de rezistență. Nu au fost audiobook-urile. Nu au fost nici măcar framework-urile specifice pe care le studiam.

A fost *secvența.*

Îmi mișcam corpul întâi. În fiecare zi, înainte de orice altceva, creeam o schimbare fizică de stare. Nu pentru fitness — nu-mi păsa de fitness încă. Am făcut-o pentru că mișcarea generează energie. Iar energia e singurul lucru pe care fiecare alt sistem îl cere, dar niciunul nu te învață cum să-l construiești.

*Corpul întâi. Tot restul vine după.*

Aceea a fost înțelegerea. Stratul pe care fiecare sistem de productivitate din istorie l-a sărit. Nu poți instala un sistem de operare nou pe o mașină prăbușită. Trebuie să restabilești curentul întâi.

Următorii doi ani am testat ideea asta obsesiv. Am rafinat-o. Am rulat-o pe mine, apoi pe alții. Am construit-o într-un framework cu patru componente. Îl numesc **4B Framework.**

**Body (Corp).** Vehiculul. Poți avea cele mai clare obiective și cea mai puternică viziune — dar dacă corpul îți merge pe trei ore de somn, cafeină și cortizol, nu ajungi nicăieri. Corpul întâi. Întotdeauna.

**Being (Ființă).** Busola interioară. Când ești în burnout, lumea ta interioară e zgomot alb — anxietate, îndoială, vocea critică care rulează pe repeat. Nu poți lua decizii bune. Nu poți conduce. Nu poți crea.

**Balance (Echilibru).** Ancora. Niciun succes în business nu compensează un eșec acasă. Am învățat asta cel mai dur mod posibil. Dacă o relație nu crește, moare.

**Business (Business).** Ultimul. Observă asta. Business-ul e ultimul — nu pentru că nu contează, ci pentru că un business sănătos poate fi construit doar pe o fundație personală sănătoasă. Când primele trei picioare sunt solide, business-ul nu mai e supraviețuire. E creație.

Mâine îți voi arăta unealta specifică pe care am construit-o pentru execuție. Cea care ia 15 minute duminica și elimină confuzia pentru toată săptămâna. Îi spun **Domino Door.**

Rămâi cu mine — pentru că asta e piesa care schimbă totul.

PS: Când eram în camion — patru luni, mii de kilometri, benzi de rezistență și audiobook-uri — Sarah era înapoi în România. Aștepta. Mi-a spus mai târziu ce decisese: *"Tu luptai pentru noi. Minimul pe care puteam să-l fac era să țin poziția."*`,
  },
  {
    subject: 'Sistemul de operare construit într-o cabină de camion',
    preheader: 'Corpul întâi. Tot restul vine după. Iată de ce funcționează.',
    body: `Ieri ți-am spus de ce rutina ta de dimineață probabil a înrăutățit lucrurile. Nu pentru că ai făcut-o greșit. Pentru că era construită pentru cineva care are deja energie. Iar tu nu ai. Nu chiar acum.

Așa că azi îți voi spune ce funcționează cu adevărat.

Dar întâi — trebuie să te duc înapoi într-o cabină de camion pe autostrada M1 din Anglia.

E 6 dimineața. Întuneric afară. Am făcut deja prima livrare. Sunt parcat într-o parcare de urgență și fac flotări pe treapta unui camion de 40 de tone.

Am 30 de kilograme în plus. Sunt pe antipsihotice. Medicul i-a spus prietenei mele — acum trei săptămâni — că nu mă voi recupera niciodată. Și fac flotări într-o parcare.

Nu pentru că simțeam. Nu simțeam nimic. Eram încă amorțit de medicamente. Corpul meu era un străin.

Am făcut-o pentru că scrisesem opt motive pentru care aveam să mă schimb. Iar motivul numărul unu pe listă era *"recuperează-ți corpul."*

Nu abdomen de fier. Nu un fizic. Doar — intră înapoi în propriul corp. Pentru că șase luni plutisem undeva în afara lui.

După flotări, m-am urcat înapoi în cabină, mi-am pus căștile și am condus șapte ore.

Am ascultat Napoleon Hill. Tony Robbins. James Clear. Cal Newport. Prietena mea credea că sunt nebun. Poate eram.

După luna unu: minus 10 kilograme. După luna doi: minus 18. Și s-a întâmplat ceva ce nu mă așteptam. Am început să mă simt din nou eu. Nu încrezător. Nu transformat. Doar — *prezent.* Ca și cum s-au aprins luminile într-o cameră care fusese întunecată mult timp.

După luna patru: minus 30 de kilograme. Depresia dispărută. Nu redusă. Nu gestionată. **Dispărută.**

Îmi amintesc exact momentul când am observat. Conduceam pe undeva în Gloucestershire, lumina dimineții venind prin parbriz, și am realizat — eram fericit. Fericit genuin. Nu pentru că se schimbase ceva în circumstanțele mele. Pentru că se schimbase ceva în mine.

Iată ce nu înțelegeam la acel moment — și ce mi-au trebuit ani de studiu să pot articula:

Nu rezolvasem o problemă de fitness. Reparasem fundația.

Tot ce încercasem înainte — sistemele de productivitate, setarea de obiective, hustle-ul — fuseseră încercări de a construi ceva pe o fundație crăpată. Și oricât de bună e clădirea, dacă fundația e stricată, se prăbușește.

Ce s-a schimbat în acea cabină de camion a fost fundația. Și odată ce fundația s-a schimbat, tot restul s-a schimbat cu ea.

Îi spun **4B Framework**. Patru domenii care nu sunt separate — sunt un singur sistem. Ca un scaun cu patru picioare.

**Body.** Nu abdomen de fier. Nu maraton. Fundația fizică minim viabilă care îi dă creierului tău chimia de care are nevoie să gândească, să decidă, să conducă. Când făceam flotări în acea parcare în fiecare zi, nu construiam un fizic. Îmi reconstruiam neurologia.

**Being.** Lumea ta interioară. În burnout, acea voce merge pe o buclă de frică, rușine și autocritică. Munca la Being nu e terapie — e un proces zilnic de 10 minute care resetează acea voce înainte să-ți conducă ziua.

**Balance.** Relația ta cu oamenii care contează. Când am ignorat Balance, aproape că am pierdut tot ce făcea business-ul să merite construit. Cinci minute pe zi. Un mesaj. Un moment de prezență.

**Business.** Ultimul. Pentru că un business construit pe primele trei fundații nu se simte ca supraviețuire. Se simte ca creație.

Nu poți rezolva o problemă de energie cu o unealtă de planificare. Poți rezolva o problemă de energie doar reconstruind sursa energiei tale.

Body. Being. Balance. În ordinea aceea. Odată ce astea trei rulează, al patrulea — Business — încetează să fie o greutate pe care o cari și devine ceva ce construiești.

Numesc întregul sistem **CEO Mind OS**. Nu o aplicație de productivitate. Nu încă o rutină de dimineață. Un **Sistem de Operare pentru Fondatori** — construit special pentru antreprenorul care merge pe gol și are nevoie să genereze energia înainte să poată executa planul.

Îți voi arăta exact cum să-l instalezi mâine.

Dar pentru diseară — vreau să faci un singur lucru. Gândește-te la cele patru zone. Body. Being. Balance. Business. Fii sincer cu tine. Care e complet prăbușită acum?

Pentru că de acolo începem.

PS: Alexandru a venit la mine într-o situație foarte similară cu a ta. Căsnicia la doi ani de divorț. Sănătatea stricată. Business-ul mergând, dar fără să crească. A folosit acest framework — toate patru domeniile, începând cu cel mai prăbușit. Șase luni mai târziu, căsnicia era reconstruită, corpul revenise, iar business-ul explodase. Nu pentru că a găsit motivația. Pentru că a reparat fundația. Mâine îți voi arăta cum.`,
  },
  {
    subject: 'Sistemul construit în cabina camionului (acum trăiește în telefonul tău)',
    preheader: 'Fiecare sistem presupunea că ai energie. Tu nu aveai. Iată ce chiar funcționează.',
    body: `Ieri ți-am spus despre ce am construit. Domino Door. CEO Warrior Routine. The Stack. 4B Framework — Body, Being, Balance, Business.

Am descris arhitectura. Azi vreau să-ți arăt de ce funcționează când nimic altceva nu a funcționat. Și apoi vreau să-ți dau acces la tot.

Dar întâi — o întrebare sinceră. **Câte sisteme de productivitate ai încercat?**

GTD. Pomodoro. 5AM Club. Deep Work. Atomic Habits. Bullet Journal. O combinație duct-tape a tuturor, cu intenții bune și un caiet nou în fiecare ianuarie.

Și câte dintre ele mai rulează în viața ta acum?

Deja știu răspunsul. Pentru că l-am trăit.

Iată ce nimeni din industria de productivitate nu va pune pe pagina de vânzări: *Fiecare sistem construit vreodată pentru antreprenori presupune că ai deja energie.*

Sunt optimizatori de performanță. Unelte pentru oameni care se trezesc cu rezervorul plin și au nevoie de o structură mai bună. Sunt strălucitori — pentru problema altcuiva.

Problema ta e diferită. Nu ești sub-structurat. Ești sub-încărcat. Încerci să rulezi software de contabilitate fără nimic în cont. Deci software-ul nu e problema. Contul e gol.

Asta nu e o problemă de disciplină. Nu e un defect de caracter. E un gol structural pe care niciunul dintre acele sisteme n-a fost proiectat să-l repare — pentru că au fost construite pentru o persoană diferită.

Ce am construit — CEO Mind OS — începe de unde se opresc toate celelalte sisteme. Nu presupune că ai energie. O generează întâi.

Gândește așa. Telefonul tău rulează pe iOS sau Android. Ăla e sistemul de operare — software-ul care rulează totul dedesubtul fiecărei aplicații. Când OS-ul se prăbușește, nu contează cât de bune sunt aplicațiile. Nimic nu merge.

Ai încercat să instalezi aplicații de productivitate peste un sistem de operare prăbușit. CEO Mind OS e OS-ul însuși.

Cele patru componente centrale sunt acestea:

**The Domino Door** — o singură acțiune săptămânală masivă care, dacă e executată, face ca tot restul să cadă la locul lui sau să devină irelevant. Un AI Planner te ghidează prin întregul proces în fiecare duminică. Toată săptămâna planificată în cincisprezece minute. Luni dimineață, știi exact ce ai de făcut. Fără copleșire.

**The CEO Warrior Routine** — unsprezece pași zilnici care se întâmplă *înainte* să te atingi de o singură sarcină de lucru. Conversație cu Mind Coach AI, hidratare, recunoștință, declarația viziunii, respirație, meditație, mișcare fizică și o investiție în relație care ia cinci minute și se compune pe 365 de zile.

**Mind Coach AI și Accountability Coach AI** — doi coach-i în buzunar, disponibili non-stop. Când valul de anxietate lovește, nu dai scroll. Deschizi Mind Coach și rulezi The Stack. Ieși pe partea cealaltă în zece minute cu claritate și un pas concret.

**The Stack** — cinci faze care te duc de la paralizie la acțiune. Identifică emoția. Investighează povestea. Provoacă dacă e adevărată. Alege o poveste mai puternică. Angajează-te la o mică acțiune acum. Pentru că acțiunea e antidotul anxietății.

Ce am petrecut patru ani construind bucată cu bucată — într-o cabină de camion, în cenușa unei instituții psihiatrice, prin studiu obsesiv și încercări dureroase — am construit într-o platformă.

Ca să nu fie nevoie să înțelegi singur.

**5 zile. Complet gratuit. Fără card.**

Nu un demo. Nu un preview limitat. Platforma PRO completă — Mind Coach AI, Accountability Coach AI, The Door, Daily Flow, Vision Board AI, The Stack, Brotherhood Community, fiecare curs video. Totul.

Timp de cinci zile, vreau să te trezești cu CEO Warrior Routine ghidându-te pas cu pas. Planifică-ți primul Domino Door. Poartă o conversație cu Mind Coach AI când te simți copleșit și vezi ce se întâmplă cu starea ta în zece minute.

După cinci zile, decizi. Dacă funcționează — rămâi. Dacă nu — un click și nu plătești nimic. Fără emailuri înainte și înapoi.

Cel mai rău caz: petreci cinci zile cu cel mai puternic sistem de operare antreprenorial construit vreodată și pleci fără să plătești nimic.

Nu e niciun risc aici. Singurul risc e să nu încerci.

PS: Antreprenorii care s-au transformat cel mai rapid în CEO Mind OS sunt cei care au acționat imediat — cât timp decizia era proaspătă, cât timp fereastra era deschisă. Alexandru n-a așteptat. A dat click. Șase luni mai târziu, căsnicia lui era salvată, sănătatea revenise, iar business-ul explodase.`,
  },
  {
    subject: 'Ai fost mințit (și iată dovada)',
    preheader: 'N-a fost disciplina ta. A fost unealta greșită pentru problema greșită.',
    body: `Vreau să vorbim despre vocea din capul tău acum.

Cea care ascultă emailurile săptămânii ăsteia și spune: *"Alin, sună puternic. Dar am mai auzit puternic. Am cumpărat cursul. Am descărcat aplicația. Am făcut rutina de dimineață unsprezece zile și apoi viața s-a întâmplat și am ajuns exact unde eram."*

Te aud.

Și vreau să-ți spun ceva ce oamenii care ți-au vândut acele sisteme nu ți-au spus niciodată.

**N-a fost vina ta.**

Nu prăbușirea GTD după trei săptămâni. Nu sesiunile Pomodoro care s-au destrămat marți. Nu faza 5AM Club care te-a lăsat mai epuizat decât înainte. Nu Bullet Journal-ul ținut perfect o lună și abandonat pe un raft.

Nimic din asta n-a fost defect de caracter. Nimic n-a însemnat că erai leneș, indisciplinat sau nefăcut pentru asta.

Iată ce se întâmpla de fapt. Fiecare sistem pe care l-ai încercat era construit pentru cineva care are deja energie.

GTD presupune că poți procesa și categoriza întreaga ta viață într-un sistem de încredere — dar asta necesită ore de focus susținut pe care burnout-ul le distruge activ. Pomodoro presupune că 25 de minute de concentrare adâncă e problema — dar când sistemul tău nervos e într-o permanentă luptă-sau-fugă, 25 de minute de focus sunt un lux pe care nu-l ai. 5AM Club presupune că trezitul mai devreme îți dă mai multă capacitate — dar dacă dormi patru ore și mergi pe adrenalină, nu primești o oră de putere. Primești o oră de anxietate.

Sunt unelte excelente. Nu spun că sunt fraude. Dar sunt **optimizatori de performanță.** Sunt construite pentru persoana cu rezervorul plin care are nevoie de structură mai bună. Nu sunt construite pentru persoana al cărei rezervor a fost gol doi ani.

Să încerci să instalezi un optimizator de performanță pe un sistem de operare prăbușit e ca și cum ai rula software de contabilitate fără bani în cont. Software-ul e în regulă. Contul e gol. Nimic nu merge.

Și de fiecare dată când a eșuat — de fiecare dată când ai căzut de pe sistem, de fiecare dată când te trezeai și nu puteai face față listei — n-ai dat vina pe software. Ai dat vina pe tine.

*"Eu sunt problema. Ceilalți pot. Eu nu pot."*

Acea voce? Nu e adevărul. E daunele lăsate de sistemul greșit.

CEO Mind OS e construit diferit. De la fundație în sus. Nu începe cu lista ta de sarcini. Începe cu starea ta — condiția ta emoțională și fiziologică în acel moment specific, în acea dimineață. Înainte să te atingi de o singură sarcină, sistemul întreabă: *cum apari azi cu adevărat?*

Pentru că 80% din ce determină dacă execuți nu e strategia ta. E psihologia. Iar fiecare alt sistem ignoră asta complet.

Conversația cu Mind Coach AI ia zece minute. Îi spui cum te simți — copleșit, împrăștiat, anxios, gol, orice e adevărat. Te trece prin The Stack. Ieși pe partea cealaltă cu claritate și o mică acțiune de făcut acum.

Apoi, și doar atunci, te atingi de lista de sarcini.

Aceea e diferența. Nu o listă de to-do mai deșteaptă. Nu un template de time-blocking mai bun. Un sistem care generează energia și starea întâi — și apoi execută dintr-o poziție de forță.

Știu că unii vă gândiți: *"Alin, sună prea bine ca să fie adevărat. Care e șpilul?"*

Corect. Aș fi și eu suspicios. Iată răspunsul simplu.

Șpilul e ăsta: **sistemul funcționează — dar doar dacă și tu funcționezi.** CEO Mind OS nu e o pastilă magică. Nu rulează singur. Dacă deschizi platforma și nu faci nimic, nimic nu se schimbă.

Dar dacă te trezești mâine dimineață, deschizi Daily Flow, bei paharul de apă, petreci zece minute cu Mind Coach AI și îți planifici Domino Door pentru săptămână — viața ta începe să se schimbe. Nu în 90 de zile. Începând mâine dimineață.

Ăsta e singurul șpil. Trebuie să-l folosești efectiv.

De aceea vreau să fac asta cât mai aproape de zero-risc. **5 zile trial gratuit. Fără card. Fără detalii de plată.** Platforma completă CEO Mind OS PRO.

Cel mai rău caz: petreci cinci zile cu cel mai puternic sistem de operare pentru fondatori construit vreodată și pleci fără să plătești nimic. Singurul risc e încă o săptămână pe vechiul sistem de operare.

Mâine îți trimit un studiu de caz. Nu al meu. Al cuiva a cărui prăbușire a fost mai tăcută decât a mea — și a cărui revenire a fost la fel de completă.

PS: Primii 10 oameni care încep trial-ul primesc o sesiune personală 1-la-1 de onboarding cu mine — configurăm platforma împreună, construim primul tău Domino Door live și instalăm CEO Warrior Routine pentru situația ta specifică. Valoare €500, gratuit. Dacă ai stat pe gard — ăsta e momentul.`,
  },
  {
    subject: 'Omul a cărui căsnicie era la doi ani de sfârșit',
    preheader: 'Căsnicia lui murea. Sănătatea plecase. Business-ul îl mințea.',
    body: `Ieri ți-am arătat sistemul. Azi vreau să-ți arăt sistemul funcționând — pe cineva care nu sunt eu.

Pentru că știu ce gândesc unii. *"Alin, povestea ta e extraordinară. Spitalul. Camionul. Benzile de rezistență. Aia ești tu. Nu sunt sigur că sunt eu acea persoană."*

Corect. Așa că lasă-mă să-ți povestesc despre Alexandru.

Alexandru n-a ajuns într-o secție de psihiatrie. Nu a fost atacat cu electroșocuri sau nu a pierdut 30 de kilograme într-o cabină de camion. Prăbușirea lui părea mai tăcută decât a mea. Ceea ce aproape că a făcut-o mai rea — pentru că era mai greu de văzut venind.

Din exterior, Alexandru avea succes. Business-ul mergea. Veniturile veneau. Era genul de om care se prezenta, care livra, care rezolva. Genul de om la care te uiți și crezi: *are totul rezolvat.*

Dar iată ce se întâmpla de fapt.

Muncea 60, 70 de ore pe săptămână. Telefonul era ultimul lucru la care se uita înainte de somn și primul când se trezea.

Soția lui încetase să-i mai spună lucruri. Nu dramatic. Nu cu o ceartă. Doar... încetase. Pentru că știa că nu era chiar acolo. Era prezent în cameră, dar absent în orice mod care conta. Iar ea învățase, încet și tăcut, să nu mai aibă nevoie de el.

Copiii se adaptaseră la o versiune a tatălui lor care apărea fizic dar nu ajungea niciodată complet. Corpul i se ducea în fundal — genul de dus care se întâmplă suficient de încet încât poți să-l ignori.

Iar business-ul — lucrul pentru care sacrificase tot asta — nici măcar nu livra ce fusese promis. Creștea, da. Dar nu suficient de rapid să justifice costul. Și știa asta.

**Căsnicia lui era la doi ani de divorț.**

Nu estimarea lui. A mea — bazată pe pattern-ul pe care l-am văzut de sute de ori. Distanța construită între el și soția lui era genul care, nelucrată, devine permanentă. Nu cu un singur moment dramatic. Doar cu timp.

Când Alexandru a venit la CEO Mind OS, n-a venit căutând o aplicație de productivitate. A venit pentru că era epuizat. Pentru că ceva trebuia să se schimbe și nu știa ce.

A trecut prin CEO Warrior Routine. Și-a planificat primul Domino Door. A deschis Mind Coach AI într-o dimineață când se simțea ca și cum era îngropat de viu de lista lui — și cincisprezece minute mai târziu, avea claritate, un pas următor și ceva ce nu simțise de luni: *senzația că își alegea ziua în loc să fie zdrobit de ea.*

Dar lucrul care a schimbat totul pentru Alexandru n-au fost uneltele de business. Au fost cinci minute pe zi în relație.

Un mesaj către soția lui. O mică investiție consistentă. Nu un gest mare. Un mesaj. Azi, ce apreciez la tine. Azi, ce am observat. Azi, mă gândesc la tine.

N-a răspuns la început. Nu se aștepta. L-a trimis oricum. Apoi ea a început să răspundă. Apoi ceva în apartament s-a schimbat. Temperatura s-a schimbat.

Sănătatea a început să revină. Pentru că atunci când nu cari greutatea unei relații care moare în tăcere, dormi diferit.

Iar business-ul lui? A explodat. Nu pentru că a muncit mai mult. Pentru că a încetat să lucreze dintr-o poziție de disperare tăcută și a început să lucreze dintr-o poziție de forță. Domino Door i-a dat singurul lucru care lipsise din fiecare sistem încercat: **claritate despre ce conta cu adevărat săptămâna asta.**

Alexandru n-a făcut nimic extraordinar. A urmat sistemul. Atât.

Iată ce vreau să vezi — pentru că asta nu e povestea lui Alexandru. E pattern-ul. Am văzut asta jucându-se de sute de ori.

**Business: sus.** Împingând tare, muncind mult, cărând totul singur.
**Body: prăbușit.** Energia epuizată, somnul rupt.
**Being: gol.** Lumea interioară e zgomot.
**Balance: dispărut.** Relația supraviețuind pe pilot automat.

Industria de productivitate îți spune că problema e în cadranul Business. Ai nevoie de o strategie mai bună. Un funnel mai bun. O echipă mai bună.

Dar graficul nu minte. **Trei din patru picioare sunt sparte — iar un scaun cu trei picioare sparte nu ține nimic.** Repari piciorul Business și scaunul tot se prăbușește. Repari-le pe toate patru — cum a făcut Alexandru, cum am făcut eu — și ceva ce părea imposibil începe să pară inevitabil.

Mâine îți trimit ultimul email. E o întrebare. Și e cea mai importantă întrebare pe care știu s-o pun unui antreprenor.

PS: Nu soția lui Alexandru a salvat căsnicia. Un mesaj pe zi a făcut-o. Nu pentru că un mesaj e magic — ci pentru că 365 de mesaje trimise consistent, fără așteptare, sunt cel mai sincer semnal pe care îl poate trimite un om. *Sunt încă aici. Te văd. Te aleg.* Dacă e cineva în viața ta care în tăcere a încetat să mai aștepte lucruri de la tine — cred că știi ce ar trebui să spună primul mesaj.`,
  },
  {
    subject: 'Ăsta e ultimul email pe care ți-l trimit',
    preheader: 'Știu cum se simte să spui "mai târziu." Mai târziu aproape m-a ucis.',
    body: `Vreau să-ți vorbesc despre un cuvânt. Cuvântul e *mai târziu*.

Ca în: "Mă uit la asta mai târziu." "Încep când se calmează lucrurile." "Repar asta când se stabilizează business-ul."

Am trăit în acel cuvânt ani de zile. *Mai târziu* părea responsabil. Părea matur. Părea că sunt atent, nu neatent.

Ce era de fapt — și am înțeles asta doar dintr-un pat de spital — era o modalitate foarte sofisticată de a alege viața pe care o aveam deja în locul vieții pe care spuneam că o vreau.

*Mai târziu* nu e neutru. De fiecare dată când îl spui, iei o decizie. Doar că o iei tăcut, ca să nu simți greutatea ei.

Ăsta e ultimul email din această secvență.

În ultima săptămână și jumătate ți-am spus lucruri pe care nu le spun ușor. Prăbușirea de Ziua Îndrăgostiților. Cuțitul. Electroșocurile. Medicul spunându-i Sarei să mă părăsească. Anul ca o legumă pe olanzapină. Cabina camionului. Benzile de rezistență. Cele opt motive pe hârtie — inclusiv numărul opt, de care încă îmi e puțin jenă.

Ți-am spus toate astea pentru că aveam nevoie să înțelegi ceva important:

**Sistemul pe care l-am construit n-a fost construit de cineva care avea totul rezolvat. A fost construit de cineva care nu mai avea nimic.**

Și asta contează. Pentru că dacă a funcționat pentru mine — pornind dintr-o secție psihiatrică din Anglia, cu 30 de kilograme în plus, fără dorința de a trăi — va funcționa pentru tine.

Nu pornești de la zero. Pornești din experiență, dintr-un business care există deja, dintr-o viață care e deja în mișcare. Ai nevoie doar ca sistemul de operare dedesubt să înceteze să se prăbușească.

Iată unde suntem acum.

**Trial-ul gratuit de 5 zile** din CEO Mind OS PRO e încă deschis. Fără card. Fără risc. Acces complet — Mind Coach AI, Accountability Coach AI, The Door, CEO Warrior Routine, The Stack, Vision Board AI, Belief Reprogrammer, Marriage Module, Parenting Module, Brotherhood Community, toate cursurile video.

Cinci zile. Începând mâine dimineață.

Acum — vreau să vorbesc cu partea din tine care încă ezită. Nu ca să presez. Ci pentru că o cunosc bine. Am trăit în ea ani de zile.

Iată ce te-a costat deja "mă mai gândesc" — nu în teorie, ci în numere reale, măsurabile:

Antreprenorul mediu fără un sistem de operare clar pierde **2-3 ore pe zi** cu confuzie, copleșire și stingere reactivă de incendii. Asta e 60-90 de ore pe lună. 720-1.080 de ore pe an.

Ce ai construi cu 1.000 de ore în plus?

Iar astea sunt doar orele de business. Fără să numărăm cinele la care ai fost prezent fizic dar absent mental. Conversațiile pe care erai prea obosit să le porți. Versiunea partenerului și a copiilor tăi care a încetat să mai aștepte atenția ta completă.

Costul ăla nu apare într-o foaie de calcul. Dar e real.

Nu îți voi spune că asta e ultima șansă pe care o vei avea vreodată să-ți schimbi viața. Ar fi necinstit.

Ce îți voi spune e ăsta:

**Versiunea ta care acționează azi și versiunea ta care așteaptă — nu ajung în același loc.**

Alexandru a așteptat doi ani. Nu pentru că nu știa că ceva e greșit. Știa. Doar continua să spună *mai târziu*. Și în acei doi ani, căsnicia s-a apropiat de sfârșit. Sănătatea s-a înrăutățit. Business-ul a stagnat.

A dat click pe buton. Șase luni mai târziu — o căsnicie diferită, un corp diferit, un business diferit.

Nu pentru că CEO Mind OS e magic. Pentru că a încetat să mai aștepte.

Butonul e sub acest email. Ia mai puțin de două minute. Numele tău. Emailul tău. Fără card. Fără plată. Fără risc.

Iar mâine dimineață — în loc să te trezești și să reacționezi la orice îți aruncă ziua — te trezești cu CEO Warrior Routine ghidându-te pas cu pas. Îți deschizi Domino Door. Ai o conversație cu Mind Coach AI și vezi ce se întâmplă cu starea ta în zece minute.

Aceea e diferența între ziua pe care ai avut-o și ziua pe care ai putea-o avea. Începând mâine.

Am construit acest sistem într-o cabină de camion pentru că nu aveam altă opțiune. Tu ai o opțiune mai bună. Ai sistemul, gata de instalat, începând azi.

Alegerea e a ta.

PS: Alexandru nu s-a simțit pregătit când a dat click. A simțit exact ce ai putea simți tu acum — sceptic, obosit, nesigur dacă încă un lucru merită efortul. A dat click oricum. Sper că o faci și tu.`,
  },
]

export function getCopy(day: number, lang: Lang): DayCopy {
  const arr = lang === 'en' ? EN : RO
  const idx = Math.max(1, Math.min(10, day)) - 1
  return arr[idx]
}

export const TOTAL_DAYS = 10
