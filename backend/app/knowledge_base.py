"""
InboundAI365 Knowledge Base
Information that Aveena can reference when answering questions
"""

COMPANY_KNOWLEDGE = """
# INBOUNDAI365 - COMPANY INFORMATION

## Company Overview
InboundAI365 helps business owners get out of survival mode by providing dependable AI that handles operations 24/7.

## Our Products

### Aveena - AI Voice Receptionist
- Answers every call 24/7 (nights, weekends, holidays)
- Books appointments automatically
- Speaks English and Spanish
- Sounds completely human
- Never calls in sick or quits
- Costs about half what a human receptionist costs

### CRM System
- Automatically logs every call and customer interaction
- Complete customer history at a glance
- Appointment management with conflict prevention
- Real-time business dashboard
- Works across phone, web, and app

### OHMNIC Business Intelligence
- Watches business operations 24/7
- Compares performance to market data
- Provides actionable recommendations
- Identifies growth opportunities
- Catches problems early

## Who We Serve

### Home Services
HVAC, plumbing, electrical, roofing, landscaping, house cleaning, pest control, locksmith, garage door repair, appliance repair, handyman, painting, flooring, window cleaning, pool service, tree service, moving, interior design

### Medical Practices
Dental, orthodontics, chiropractic, physical therapy, optometry, dermatology, veterinary clinics, mental health practices

## Pricing

**Base Package: $599/month**
- Aveena (24/7 AI receptionist)
- Complete CRM system
- Multi-channel communication
- 300 minutes of calls included

**Additional Usage: $0.28/minute**
Only pay for usage beyond 300 minutes

**OHMNIC: Free for 6 months**
Then $199/month

**Setup: $499 one-time fee**
Same-day setup and training

**No contracts - month-to-month, cancel anytime**

## Key Benefits

### vs Other AI Receptionists
We provide a complete business operating system, not just call answering

### vs Traditional Receptionists
- 24/7 availability vs 40 hours/week
- Never sick or absent
- Half the cost
- Consistent quality

### vs Enterprise Software
- Same-day setup vs months of implementation
- No technical knowledge required
- Simple to use

## Our Values
1. Dependability Over Flash - Systems that work consistently
2. Business Owners First - Built for real businesses, not tech enthusiasts
3. Honest Capability - Transparent about what we do and don't do
4. Long-Term Partnership - Building for years, not quarters
5. Experienced Execution - Built by operators for operators

## Setup Process
1. Discovery Call (15 minutes) - Learn about your business
2. Setup (Same Day) - Configure system for your needs
3. Go Live (Immediate) - Start taking calls right away
4. Optimize (30 days) - System learns your patterns

## Common Questions

**Will customers know it's AI?**
Aveena sounds completely human. Customers care about getting help, not whether it's AI.

**Can I cancel anytime?**
Yes. Month-to-month, no long-term contracts.

**Do I need technical knowledge?**
No. We handle all setup. It just works.

**How long is setup?**
Same day - operational within hours.

**What about my current phone number?**
You keep it. We just route calls to Aveena.

**Can Aveena handle emergencies?**
Yes. Designed to detect urgency and prioritize appropriately.

**What languages?**
Currently English and Spanish.

## Contact
Website: inboundai365.com
15-minute demo calls available

## Mission
We exist to pull business owners out of survival mode. We handle the work nobody wants to do so businesses can focus on what they do best.
"""


def get_company_knowledge():
    """Get company knowledge base for context"""
    return COMPANY_KNOWLEDGE


def should_include_knowledge(message):
    """
    Determine if company knowledge should be included based on the message
    
    Args:
        message: User's message
        
    Returns:
        bool: True if knowledge should be included
    """
    # Keywords that indicate questions about the company/product
    company_keywords = [
        'inboundai365', 'inbound ai', 'aveena', 'ohmnic',
        'company', 'business', 'service', 'product',
        'price', 'cost', 'pricing', 'pay', 'fee',
        'how does', 'what is', 'tell me about',
        'who are you', 'what do you do',
        'features', 'capabilities', 'can you',
        'setup', 'install', 'start', 'begin',
        'cancel', 'contract', 'subscription'
    ]
    
    message_lower = message.lower()
    return any(keyword in message_lower for keyword in company_keywords)
