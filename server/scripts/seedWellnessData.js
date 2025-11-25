const mongoose = require('mongoose');
require('dotenv').config();
const WellbeingTip = require('./models/WellbeingTip');
const MentalHealthResource = require('./models/MentalHealthResource');
const ComplianceGuideline = require('./models/ComplianceGuideline');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/job-portal';

// Hardcoded default well-being tips for each day
const defaultTips = [
    {
        dayOfWeek: 'Monday',
        tip: '💪 Start your week strong! Take 5-minute breaks every hour to stay energized and focused throughout the day.'
    },
    {
        dayOfWeek: 'Tuesday',
        tip: '🧘 Practice mindfulness today. Try a 10-minute meditation session during lunch to reduce stress and improve focus.'
    },
    {
        dayOfWeek: 'Wednesday',
        tip: '💧 Stay hydrated! Drink at least 8 glasses of water today. Keep a water bottle at your desk as a reminder.'
    },
    {
        dayOfWeek: 'Thursday',
        tip: '🚶 Take a walk! A quick 15-minute walk can boost your mood, creativity, and overall health.'
    },
    {
        dayOfWeek: 'Friday',
        tip: '🎉 Celebrate your wins! Reflect on what you accomplished this week and appreciate your hard work.'
    },
    {
        dayOfWeek: 'Saturday',
        tip: '😴 Prioritize rest. Aim for 7-9 hours of quality sleep to recharge your body and mind for the week ahead.'
    },
    {
        dayOfWeek: 'Sunday',
        tip: '📝 Plan ahead! Spend 20 minutes organizing your tasks for the upcoming week to reduce Monday stress.'
    }
];

// Default mental health resources
const defaultResources = [
    {
        title: 'National Suicide Prevention Lifeline',
        description: '24/7 free and confidential support for people in distress. Prevention and crisis resources available.',
        phoneNumber: '1-800-273-8255',
        url: 'https://suicidepreventionlifeline.org',
        category: 'Crisis Support'
    },
    {
        title: 'BetterHelp Online Therapy',
        description: 'Professional, affordable, and convenient online counseling. Connect with licensed therapists from anywhere.',
        url: 'https://www.betterhelp.com',
        category: 'Therapy'
    },
    {
        title: 'Crisis Text Line',
        description: 'Free 24/7 support via text message. Text HOME to 741741 to connect with a crisis counselor.',
        phoneNumber: 'Text HOME to 741741',
        url: 'https://www.crisistextline.org',
        category: 'Crisis Support'
    },
    {
        title: 'Mental Health America',
        description: 'Free mental health screening tools and resources for understanding and managing mental health.',
        url: 'https://www.mhanational.org',
        category: 'Self-Help'
    },
    {
        title: 'SAMHSA National Helpline',
        description: 'Confidential, free, 24/7 treatment referral and information service for mental health and substance abuse.',
        phoneNumber: '1-800-662-4357',
        url: 'https://www.samhsa.gov/find-help/national-helpline',
        category: 'Helpline'
    }
];

// Default compliance guidelines
const defaultGuidelines = [
    {
        title: 'Workplace Safety Guidelines',
        content: `Our company is committed to providing a safe and healthy work environment for all employees. 

**Your Rights:**
- Right to a safe workplace free from recognized hazards
- Right to receive safety training in a language you understand
- Right to review records of work-related injuries and illnesses
- Right to file a confidential complaint with OSHA if unsafe conditions exist

**Your Responsibilities:**
- Follow all safety and health rules and regulations
- Use required safety equipment and protective gear
- Report all work-related injuries, illnesses, and unsafe conditions immediately
- Participate in required safety training programs

**Emergency Procedures:**
- Know the location of fire extinguishers, emergency exits, and first aid kits
- Participate in emergency drills and follow evacuation procedures
- Report all emergencies to your supervisor and security immediately

For safety concerns, contact the Safety Department or your supervisor.`,
        category: 'Workplace Safety',
        displayOrder: 1
    },
    {
        title: 'Anti-Discrimination Policy',
        content: `We are committed to providing equal employment opportunities to all employees and applicants.

**Protected Categories:**
Discrimination is prohibited based on:
- Race, color, national origin, or ancestry
- Sex, gender, gender identity, or gender expression
- Sexual orientation
- Age (40 and over)
- Religion or creed
- Disability (physical or mental)
- Marital status
- Pregnancy or related medical conditions
- Veteran or military status
- Genetic information

**Your Rights:**
- Right to equal treatment in all aspects of employment
- Right to reasonable accommodations for disabilities or religious beliefs
- Right to work in an environment free from discrimination
- Right to file a complaint without fear of retaliation

**Reporting Discrimination:**
If you believe you have experienced discrimination:
1. Report to your supervisor, HR department, or via the confidential hotline
2. All complaints will be investigated promptly and confidentially
3. No retaliation will be tolerated against anyone who reports discrimination

**Consequences:**
Violations of this policy will result in disciplinary action, up to and including termination.`,
        category: 'Anti-Discrimination',
        displayOrder: 2
    },
    {
        title: 'Harassment Prevention Policy',
        content: `We are committed to maintaining a workplace free from all forms of harassment.

**What is Harassment?**
Harassment includes:
- Unwelcome verbal, physical, or visual conduct based on protected categories
- Sexual harassment, including unwanted sexual advances or requests
- Creating an intimidating, hostile, or offensive work environment
- Bullying, threats, or intimidation
- Retaliation for reporting harassment

**Sexual Harassment Examples:**
- Unwanted sexual advances or propositions
- Offering employment benefits in exchange for sexual favors
- Making or sharing sexually explicit comments, jokes, or images
- Unwanted touching or physical contact
- Making comments about someone's body or appearance

**Your Responsibilities:**
- Treat all colleagues with respect and professionalism
- Speak up if you witness or experience harassment
- Participate in required harassment prevention training
- Cooperate with investigations

**How to Report:**
1. Tell the harasser to stop (if you feel safe doing so)
2. Report to your supervisor, HR, or use the confidential reporting hotline
3. Submit a written complaint if preferred
4. All reports are investigated promptly and confidentially

**Protection from Retaliation:**
We prohibit retaliation against anyone who:
- Reports harassment in good faith
- Participates in an investigation
- Opposes discriminatory practices

Violators will face serious consequences, including termination.`,
        category: 'Harassment Policy',
        displayOrder: 3
    },
    {
        title: 'Employee Rights & General Compliance',
        content: `**Your Employment Rights:**

**Fair Labor Standards:**
- Right to minimum wage and overtime pay (if applicable)
- Right to meal and rest breaks as required by law
- Right to accurate pay for all hours worked
- Right to review your personnel file

**Leave & Time Off:**
- Right to take approved leave (FMLA, sick leave, vacation)
- Right to reasonable accommodations for medical conditions
- Protection from retaliation for taking approved leave

**Privacy Rights:**
- Personal belongings and private communications are subject to company policy
- Company reserves the right to monitor company equipment and communications
- Medical information is kept confidential and separate from personnel files

**Whistleblower Protection:**
You are protected from retaliation when reporting:
- Illegal activity or violations of law
- Safety violations or hazardous conditions
- Fraud, waste, or abuse
- Violations of company policy

**Reporting Violations:**
If you suspect violations of law or company policy:
1. Report to your supervisor or HR department
2. Use the confidential ethics hotline: 1-800-XXX-XXXX
3. File a report online through the company portal
4. Contact the Compliance Officer directly

**Confidentiality:**
All reports are treated confidentially to the extent possible while conducting a thorough investigation.

**Non-Retaliation:**
The company prohibits retaliation against employees who report violations in good faith.

For questions about your rights or company policies, contact Human Resources.`,
        category: 'General Compliance',
        displayOrder: 4
    }
];

async function seedWellnessData() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('MongoDB Connected for seeding...');

        // Seed Wellbeing Tips
        console.log('\nSeeding Wellbeing Tips...');
        for (const tip of defaultTips) {
            const existing = await WellbeingTip.findOne({ dayOfWeek: tip.dayOfWeek });
            if (!existing) {
                await WellbeingTip.create(tip);
                console.log(`✓ Created tip for ${tip.dayOfWeek}`);
            } else {
                console.log(`  Tip for ${tip.dayOfWeek} already exists`);
            }
        }

        // Seed Mental Health Resources
        console.log('\nSeeding Mental Health Resources...');
        const existingResources = await MentalHealthResource.countDocuments();
        if (existingResources === 0) {
            await MentalHealthResource.insertMany(defaultResources);
            console.log(`✓ Created ${defaultResources.length} mental health resources`);
        } else {
            console.log(`  ${existingResources} mental health resources already exist`);
        }

        // Seed Compliance Guidelines
        console.log('\nSeeding Compliance Guidelines...');
        const existingGuidelines = await ComplianceGuideline.countDocuments();
        if (existingGuidelines === 0) {
            await ComplianceGuideline.insertMany(defaultGuidelines);
            console.log(`✓ Created ${defaultGuidelines.length} compliance guidelines`);
        } else {
            console.log(`  ${existingGuidelines} compliance guidelines already exist`);
        }

        console.log('\n✅ Wellness data seeding completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding wellness data:', error);
        process.exit(1);
    }
}

seedWellnessData();
