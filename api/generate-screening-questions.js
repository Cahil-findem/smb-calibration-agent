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

    const response = await openai.responses.create({
      prompt: {
        id: 'pmpt_68fc1322df1c8190a61f43b096b278ee0cde8553711b2931',
        version: '1',
        variables: {
          role_brief: jobDescription,
        },
      },
    });

    console.log('OpenAI Screening Questions Response:', JSON.stringify(response, null, 2));

    // Extract the actual content from the response
    let content = null;

    if (response.output && Array.isArray(response.output)) {
      // Find the message output
      const messageOutput = response.output.find(item => item.type === 'message');
      if (messageOutput && messageOutput.content && messageOutput.content[0]) {
        content = messageOutput.content[0].text;
      }
    }

    console.log('Extracted Questions Content (raw):', content);

    // Parse the JSON string
    let questions;
    if (typeof content === 'string') {
      try {
        questions = JSON.parse(content);
        console.log('Successfully parsed screening questions');
      } catch (error) {
        console.error('Failed to parse JSON:', error);
        // Fallback parsing
        questions = content
          .split('\n')
          .filter(line => line.trim().length > 0)
          .map(line => line.replace(/^[\d\.\-\*\s]+/, '').trim())
          .filter(line => line.length > 0)
          .slice(0, 3);
      }
    } else {
      questions = content;
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
