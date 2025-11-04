import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { role_brief, screening_questions } = req.body;

    console.log('=== GENERATING OUTREACH EMAIL ===');
    console.log('Role Brief:', role_brief);
    console.log('Screening Questions:', screening_questions);

    const prompt = `Write a short, personalized outreach email to a candidate who has expressed interest in the role. The tone should be warm, professional, and concise — balancing empathy with clarity.

Job Description:
${role_brief}

Screening Questions:
${screening_questions.map((q, i) => `${i + 1}. ${q.question}`).join('\n')}

Generate TWO things:
1. A compelling email subject line that references the candidate's focus area and the organization/opportunity
2. The email body

The email should include:
1. A personalized opening that references the candidate's background or motivation (based on hints from the job description). Use [Candidate First Name] as placeholder.
2. A short paragraph describing the opportunity and what makes it stand out (derived from the job description).
3. The 3–4 screening questions provided above, listed naturally in the email.
4. A friendly and clear closing with a call to action to connect. Use [Your Name] as placeholder for signature.

Subject Line Example Format:
"Your experience in [nursing focus area] could be a great fit for [Organization Name]"

Email Body Structure:

Hi [Candidate First Name],

[Opening paragraph referencing candidate's background and role fit]

Before we set up a quick chat, could you share a bit more about your background?

[List the screening questions as separate lines, not as a bulleted list]

Once I hear back, I'd be happy to walk you through what makes our team special and how your experience could make an impact here.

Warm regards,
[Your Name]

IMPORTANT: Return your response in this exact JSON format:
{
  "subject": "Your compelling subject line here",
  "body": "<p>Hi [Candidate First Name],</p><p>Email body with HTML tags...</p>"
}

Use HTML <p> tags for paragraphs in the body. Do NOT use <ul> or <li> tags. List the screening questions as separate paragraphs with line breaks.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000,
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(completion.choices[0].message.content);

    console.log('Generated Email:', result);

    res.json({
      success: true,
      subject: result.subject,
      emailBody: result.body,
      usage: completion.usage,
    });
  } catch (error) {
    console.error('Outreach Email Generation Error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
