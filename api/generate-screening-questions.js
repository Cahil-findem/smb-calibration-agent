import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { jobDescription } = req.body;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that generates relevant screening questions for job candidates. Generate exactly 3 screening questions based on the job description provided. Return only the questions as a JSON array of strings, without any additional text or formatting.',
        },
        {
          role: 'user',
          content: `Based on this job description, generate 3 screening questions that would help identify qualified candidates:\n\n${jobDescription}`,
        },
      ],
      temperature: 0.7,
    });

    const responseText = completion.choices[0].message.content.trim();

    // Try to parse as JSON, or create questions from the response
    let questions;
    try {
      questions = JSON.parse(responseText);
    } catch {
      // If not valid JSON, split by newlines and clean up
      questions = responseText
        .split('\n')
        .filter(line => line.trim().length > 0)
        .map(line => line.replace(/^[\d\.\-\*\s]+/, '').trim())
        .filter(line => line.length > 0)
        .slice(0, 3);
    }

    // Ensure we have exactly 3 questions
    if (!Array.isArray(questions) || questions.length !== 3) {
      questions = [
        'What relevant experience do you have for this role?',
        'What interests you most about this position?',
        'What are your salary expectations?',
      ];
    }

    res.status(200).json({
      success: true,
      questions: questions,
    });
  } catch (error) {
    console.error('OpenAI Screening Questions Error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
