# 50Deeds.com HubSpot Implementation Guide
## Updated: Sequence Auto-Enrollment via Node.js Middleware

**Previous Approach:** Instantly → Make.com → HubSpot (with Make.com scenarios for sequence enrollment)

**NEW Approach:** Instantly → Node.js Middleware → HubSpot (auto-enrollment built-in!)

---

## Overview

| Item | Count | Tool |
|------|-------|------|
| Lifecycle Stages | 7 | HubSpot |
| Sequences | 4 | HubSpot |
| Email Templates | 10 | HubSpot |
| Custom Properties | 4 | HubSpot |
| Lists | 7 | HubSpot |
| **Auto-Enrollment** | **Built-in** | **Node.js Middleware** ❌ Make.com |

---

## How It Works (Updated)

Your Node.js middleware now handles everything:

1. **Instantly sends cold email** → Lead replies
2. **Webhook received** by middleware (http://your-server.com/webhook/instantly-hubspot)
3. **Middleware:**
   - Creates/updates contact in HubSpot
   - Sets lead status and source
   - Creates high-priority task
   - Logs engagement note
   - **✅ AUTO-ENROLLS IN SEQUENCE** (no Make.com!)
4. **HubSpot Sequence:**
   - Sends automated emails
   - Tracks opens/clicks
   - Auto-stops on reply
   - Auto-creates follow-up tasks

### System Architecture (Simplified)

```
┌──────────────┐
│ INSTANTLY    │
│ Cold Email   │
└──────┬───────┘
       │
       │ Lead replies
       ↓
┌──────────────────────────────────────┐
│ YOUR NODE.JS MIDDLEWARE              │
│ (hosted on Railway/Render/AWS)       │
│                                      │
│ ✅ Create/update contact             │
│ ✅ Set status & properties           │
│ ✅ Create tasks & notes              │
│ ✅ AUTO-ENROLL IN SEQUENCE           │
│                                      │
│ No Make.com Required!                │
└──────┬───────────────────────────────┘
       │
       ↓
┌──────────────────────────────────────┐
│ HUBSPOT                              │
│                                      │
│ ✅ Contacts synced                   │
│ ✅ Sequences auto-enrolled           │
│ ✅ Emails sent automatically         │
│ ✅ Tracked opens/clicks              │
│                                      │
│ Everything works without Make.com!   │
└──────────────────────────────────────┘
```

---

## PART 1: HubSpot Setup (Same as Before)

### 1. Lifecycle Stages (7)

Go to: Settings → Properties → Contact Properties → Lifecycle Stage → Edit

| # | Lifecycle Stage | Meaning | Your Action |
|---|---|---|---|
| 1 | Lead - New | Just replied to Instantly | Call within 24 hrs |
| 2 | Lead - Attempted | Called/emailed, no response | Follow up again |
| 3 | Opportunity | Had a real conversation | Offer 30-day trial |
| 4 | Trial | 30-day free trial active | Support & convert |
| 5 | Customer | Paying client | Onboard & retain |
| 6 | Not Fit | Wrong practice / no volume | Close out |
| 7 | Not Now | Interested but bad timing | Re-engage in 60 days |

### 2. Custom Properties (4)

Go to: Settings → Properties → Contact Properties → Create Property

| Property Name | Field Type | Options/Description |
|---|---|---|
| Instantly Campaign | Single-line text | Name of the Instantly campaign |
| Current Deed Process | Dropdown | DIY In-House, Title Company, Other Vendor, No Current Process |
| Trial Start Date | Date picker | Date they started 30-day trial |
| Client Start Date | Date picker | Date they became a paying client |

### 3. Email Templates (10)

Go to: Library → Templates → New Template

**Template 1: Thanks for Your Interest**
```
Subject: Thanks for reaching out - 50Deeds

Hi {{contact.firstname}},

Thanks for your interest in 50Deeds!

I help trust and estate attorneys streamline deed recordings across all 50 states.

Here's what we do:
• Prepare deeds for trust transfers
• Handle recording in any of 3,000+ US counties
• You get the recorded deed back - no county research needed

I'll give you a call in the next day or two. Feel free to reply if you have questions.

Talk soon,
Adam Shen
50Deeds.com
```

**Template 2-10:** [See SEQUENCE_ENROLLMENT.md or original PDF for full templates]

### 4. Sequences (4)

Go to: Automation → Sequences → Create Sequence

#### Sequence 1: New Lead Sequence
Purpose: Nurture new leads from Instantly until they respond

| Step | Type | Delay | Template |
|---|---|---|---|
| 1 | Email | Immediately | Thanks for Your Interest |
| 2 | Task | 1 day | Call: {{contact.firstname}} |
| 3 | Email | 3 days | Follow-Up (Day 3) |
| 4 | Task | 3 days | Call again: {{contact.firstname}} |
| 5 | Email | 7 days | Should I Close Your File |

Timeline: Day 0 → Day 1 (task) → Day 3 → Day 6 (task) → Day 10

#### Sequence 2: Trial Sequence
Purpose: Nurture trial users to conversion

| Step | Type | Delay | Template |
|---|---|---|---|
| 1 | Email | Immediately | Trial Welcome |
| 2 | Task | 1 day | Ensure portal setup for {{contact.firstname}} |
| 3 | Email | 3 days | Trial Check-In (Day 3) |
| 4 | Email | 14 days | Trial Mid-Point (Day 14) |
| 5 | Task | 14 days | Mid-trial call: discuss conversion |
| 6 | Email | 25 days | Trial Ending Soon (Day 25) |
| 7 | Task | 25 days | URGENT: Close the deal! |
| 8 | Task | 30 days | Trial ended: Get final decision |

Timeline: Day 0 → Day 3 → Day 14 → Day 25 → Day 30

#### Sequence 3: Customer Onboarding Sequence
Purpose: Onboard new customers and ask for referrals

| Step | Type | Delay | Template |
|---|---|---|---|
| 1 | Email | Immediately | Welcome New Client |
| 2 | Task | 2 days | Welcome call: {{contact.firstname}} |
| 3 | Email | 7 days | Subject: How's it going? |
| 4 | Email | 30 days | Subject: Quick favor? (referral ask) |
| 5 | Task | 30 days | Ask {{contact.firstname}} for referral |

Timeline: Day 0 → Day 2 (task) → Day 7 → Day 30

#### Sequence 4: Re-engage Sequence
Purpose: Re-engage 'Not Now' contacts after 60 days

| Step | Type | Delay | Template |
|---|---|---|---|
| 1 | Email | 60 days | Re-engagement (Day 60) |
| 2 | Task | 60 days | Re-engage call: {{contact.firstname}} |

### 5. Lists (7)

Go to: Contacts → Lists → Create list

| List Name | Type | Filter |
|---|---|---|
| All Instantly Leads | Active | Lead Source Name = "Instantly" |
| New Leads | Active | Lifecycle Stage = "Lead - New" |
| Attempted (No Response) | Active | Lifecycle Stage = "Lead - Attempted" |
| Opportunities | Active | Lifecycle Stage = "Opportunity" |
| Active Trials | Active | Lifecycle Stage = "Trial" |
| Customers | Active | Lifecycle Stage = "Customer" |
| Re-engage Later | Active | Lifecycle Stage = "Not Now" |

---

## PART 2: Middleware Setup (NEW!)

Your Node.js middleware is already configured to auto-enroll contacts in sequences.

### Step 1: Install/Deploy Middleware

If not already deployed:

```bash
# Clone the repo
git clone [your-repo]

# Install dependencies
npm install

# Set environment variables
cp .env.example .env

# Add your API keys
INSTANTLY_API_KEY=your_instantly_key
HUBSPOT_API_KEY=your_hubspot_key
```

Deploy to Railway, Render, or AWS.

### Step 2: Find Your HubSpot Sequence IDs

Run this command:

```bash
node get-hubspot-sequences.js
```

Example output:
```
Found 4 sequence(s):

1. New Lead Sequence
   ID: 8f1a2b3c-4d5e-6f7g-8h9i-0j1k2l3m4n5o

2. Trial Sequence
   ID: 9k8j7i-6h5g-4f3e-2d1c-0b9a8f7e6d5c

3. Customer Onboarding Sequence
   ID: 7c6b5a-4z3y-2x1w-0v9u-8t7s6r5q4p3o

4. Re-engagement Sequence
   ID: 2m1l0k-9j8i-7h6g-5f4e-3d2c-1b0a9z8y7x
```

### Step 3: Add Sequence IDs to .env

```env
# HubSpot Sequence IDs (get these from Step 2)
HUBSPOT_SEQUENCE_NEW_LEAD=8f1a2b3c-4d5e-6f7g-8h9i-0j1k2l3m4n5o
HUBSPOT_SEQUENCE_TRIAL=9k8j7i-6h5g-4f3e-2d1c-0b9a8f7e6d5c
HUBSPOT_SEQUENCE_CUSTOMER=7c6b5a-4z3y-2x1w-0v9u-8t7s6r5q4p3o
HUBSPOT_SEQUENCE_REENGAGE=2m1l0k-9j8i-7h6g-5f4e-3d2c-1b0a9z8y7x
```

### Step 4: Restart Middleware

```bash
npm start
```

**That's it! No Make.com needed.**

---

## PART 3: Instantly.ai Setup (Same as Before)

Go to: Settings → Integrations → Webhooks

1. Click **Add Webhook**
2. **URL:** `https://your-middleware.com/webhook/instantly-hubspot`
3. **Events:** All events (or select specific ones)
4. **Campaigns:** Select your campaigns

---

## PART 4: Daily Operations

### When to Change Lifecycle Stage

| Event | Change Lifecycle To | Auto Action |
|---|---|---|
| Lead replies to Instantly | Lead - New | Enrolls in New Lead Sequence |
| Called/emailed, no response | Lead - Attempted | Manual update |
| Had a real conversation | Opportunity | Offer trial manually |
| Accepted 30-day trial | Trial | Enrolls in Trial Sequence |
| Converted to paying | Customer | Enrolls in Customer Sequence |
| Interested but bad timing | Not Now | Enrolls in Re-engage Sequence |
| Wrong practice / no volume | Not Fit | No automation |

### Daily Sales Checklist

1. ✅ Check HubSpot Tasks → Complete calls/follow-ups
2. ✅ Check New Leads list → Any new replies?
3. ✅ Check Active Trials list → Anyone need support?
4. ✅ Update lifecycle stages as contacts progress
5. ✅ Middleware handles sequence enrollment automatically

---

## Understanding the New Flow

### Scenario 1: Lead Replies to Email

```
Instantly detects reply
  ↓
Webhook sent to middleware
  ↓
Middleware creates contact in HubSpot
  ↓
Sets status = "CONNECTED"
Sets source = "Instantly"
Sets lifecycle = "salesqualifiedlead"
  ↓
Creates engagement note with reply text
  ↓
Creates HIGH PRIORITY task (due in 2 hours)
  ↓
✅ AUTO-ENROLLS IN "New Lead Sequence"
  ↓
Contact receives:
  - Day 0: "Thanks for Your Interest" email
  - Day 1: Task reminder to call
  - Day 3: "Quick Follow-Up" email
  - etc.
```

### Scenario 2: Contact Accepts Trial

```
Sales rep marks contact as "Trial" in HubSpot
  ↓
HubSpot webhook sent to middleware
  ↓
Middleware detects lifecycle change
  ↓
✅ OPTIONALLY enrolls in "Trial Sequence"
  ↓
Contact receives:
  - Day 0: "Your 30-day trial has started!"
  - Day 3: "How's your first few days going?"
  - Day 14: "You're halfway through"
  - Day 25: "Your trial ends in 5 days"
```

---

## API Endpoints

Your middleware provides these endpoints:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check & integration status |
| `/config` | GET | View non-secret configuration |
| `/webhook/instantly-hubspot` | POST | Instantly event webhook |
| `/webhook/hubspot` | POST | HubSpot event webhook |
| `/sync/lead` | POST | Manual lead sync trigger |
| `/test/instantly` | POST | Test Instantly event simulation |

---

## Implementation Checklist

### Day 1: HubSpot Setup (1 hour)
- ☐ Create 7 custom lifecycle stages
- ☐ Create 4 custom properties
- ☐ Create 10 email templates

### Day 2: HubSpot Sequences (1 hour)
- ☐ Create Sequence 1: New Lead Sequence
- ☐ Create Sequence 2: Trial Sequence
- ☐ Create Sequence 3: Customer Onboarding Sequence
- ☐ Create Sequence 4: Re-engage Sequence
- ☐ Create 7 lists

### Day 3: Middleware Setup (30 min)
- ☐ Run `node get-hubspot-sequences.js` to get sequence IDs
- ☐ Add sequence IDs to `.env`
- ☐ Restart middleware (`npm start`)
- ☐ Test with `node get-hubspot-sequences.js`

### Day 4: Instantly Integration (30 min)
- ☐ Configure Instantly webhook: `https://your-server.com/webhook/instantly-hubspot`
- ☐ Test with a test email

### Total Setup Time: ~3 hours (same as before, but NO Make.com!)

---

## Benefits vs Make.com Approach

### ❌ Old Way (with Make.com)
- Make.com charges per operation
- Extra platform to manage
- Possible sync delays (15 min polling)
- Another tool with separate logs
- More failure points

### ✅ New Way (Built-in Middleware)
- No Make.com fees
- Single source of truth
- Instant enrollment (no polling)
- All logs in one place
- Fewer dependencies

---

## Troubleshooting

### Sequences Not Enrolling?

1. **Check middleware logs:**
   ```bash
   npm start
   # Look for "Enrolled contact" messages
   ```

2. **Verify sequence IDs:**
   ```bash
   node get-hubspot-sequences.js
   ```

3. **Check .env is set:**
   ```bash
   echo $HUBSPOT_SEQUENCE_NEW_LEAD
   ```

### Contact Not Created in HubSpot?

1. Check webhook is reaching your server
2. Verify HUBSPOT_API_KEY is valid
3. Check middleware logs for errors

### Still Seeing Make.com Steps?

You can **disable or delete** Make.com scenarios:

1. Go to Make.com
2. For each scenario, click the toggle to **OFF**
3. HubSpot sequences still work - middleware handles enrollment
4. (Optional) Delete scenarios if not needed

---

## Quick Links

| Item | URL |
|------|-----|
| HubSpot Account | https://app.hubspot.com |
| HubSpot Properties | https://app.hubspot.com/property-settings/[account-id]/properties |
| HubSpot Sequences | https://app.hubspot.com/sequences/[account-id] |
| HubSpot Lists | https://app.hubspot.com/contacts/[account-id]/lists |
| Instantly.ai | https://instantly.ai |
| Middleware Repo | [your-repo-url] |

---

## Support & Documentation

- **Sequence Enrollment Details:** See [SEQUENCE_ENROLLMENT.md](SEQUENCE_ENROLLMENT.md)
- **Middleware Logs:** Check server output for detailed debug info
- **HubSpot Docs:** https://developers.hubspot.com/docs/api/crm/contacts

---

## Migration Steps (If Coming from Make.com)

1. **Deploy middleware** with sequence IDs configured
2. **Test with a sample lead** - verify enrollment works
3. **Disable Make.com scenarios** (Settings → Scenarios → Toggle OFF)
4. **Monitor for 24 hours** - check that contacts are enrolling
5. **Delete Make.com scenarios** (if satisfied)
6. **Celebrate** - You've eliminated a platform dependency! 🎉

---

**50Deeds.com | Instantly → HubSpot Auto-Sync**

**Setup:** HubSpot Starter + Sequences + Node.js Middleware
**Features:** 7 Lifecycle Stages | 4 Sequences | 10 Templates | Auto-Enrollment (Built-in!)

**Questions?** Check [SEQUENCE_ENROLLMENT.md](SEQUENCE_ENROLLMENT.md) or contact your middleware maintainer.
