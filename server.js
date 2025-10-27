import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import OpenAI from 'openai';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3004;

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// OpenAI API endpoint example
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, model = 'gpt-4' } = req.body;

    const completion = await openai.chat.completions.create({
      model,
      messages,
    });

    res.json({
      success: true,
      response: completion.choices[0].message.content,
      usage: completion.usage,
    });
  } catch (error) {
    console.error('OpenAI API Error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// OpenAI Prompt API endpoint for job description analysis
app.post('/api/analyze-job-description', async (req, res) => {
  try {
    const { role_brief, appended_feedback = '' } = req.body;

    const response = await openai.responses.create({
      prompt: {
        id: 'pmpt_68fc0cf5731c8190ad4b3eed58fa8ba500f7b712f3a134f9',
        version: '2',
        variables: {
          role_brief,
          appended_feedback,
        },
      },
    });

    console.log('OpenAI Full Response:', JSON.stringify(response, null, 2));

    // Extract the actual content from the response
    // The Responses API structure: response.output[1].content[0].text
    let content = null;

    if (response.output && Array.isArray(response.output)) {
      // Find the message output (usually the second item)
      const messageOutput = response.output.find(item => item.type === 'message');
      if (messageOutput && messageOutput.content && messageOutput.content[0]) {
        content = messageOutput.content[0].text;
      }
    }

    console.log('Extracted Content (raw):', content);

    // Parse the JSON string
    let parsedContent = null;
    if (typeof content === 'string') {
      try {
        parsedContent = JSON.parse(content);
        console.log('Successfully parsed candidate data');
        console.log('=== CANDIDATE STRUCTURE ANALYSIS ===');
        console.log('First candidate match keys:', Object.keys(parsedContent[0]?.match || {}));
        console.log('First candidate match.why_summary:', parsedContent[0]?.match?.why_summary);
        console.log('First candidate match.why_rich:', parsedContent[0]?.match?.why_rich);
        console.log('Full first candidate match:', JSON.stringify(parsedContent[0]?.match, null, 2));
        console.log('====================================');
      } catch (error) {
        console.error('Failed to parse JSON:', error);
        parsedContent = content; // Fall back to raw string
      }
    } else {
      parsedContent = content;
    }

    // Assign avatars from Unsplash with random selection
    if (Array.isArray(parsedContent)) {
      console.log('Assigning avatars from Unsplash...');

      // Unsplash avatar pool (20 professional headshots)
      const AVATAR_POOL = [
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=faces',
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=faces',
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=faces',
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=faces',
        'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=faces',
        'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=400&fit=crop&crop=faces',
        'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=400&fit=crop&crop=faces',
        'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=400&fit=crop&crop=faces',
        'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=400&h=400&fit=crop&crop=faces',
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=faces',
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=faces',
        'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=400&h=400&fit=crop&crop=faces',
        'https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?w=400&h=400&fit=crop&crop=faces',
        'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400&h=400&fit=crop&crop=faces',
        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=faces',
        'https://images.unsplash.com/photo-1557862921-37829c790f19?w=400&h=400&fit=crop&crop=faces',
        'https://images.unsplash.com/photo-1463453091185-61582044d556?w=400&h=400&fit=crop&crop=faces',
        'https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=400&h=400&fit=crop&crop=faces',
        'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=400&h=400&fit=crop&crop=faces',
        'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=400&h=400&fit=crop&crop=faces',
      ];

      // Shuffle array for random selection
      const shuffledAvatars = [...AVATAR_POOL].sort(() => Math.random() - 0.5);

      parsedContent.forEach((item, index) => {
        const avatarUrl = shuffledAvatars[index % shuffledAvatars.length];

        // Add avatar URL to candidate data
        if (item.candidate) {
          item.candidate.avatar_url = avatarUrl;
        } else {
          item.avatar_url = avatarUrl;
        }
      });

      console.log('Avatars assigned successfully');
    }

    res.json({
      success: true,
      response: parsedContent,
    });
  } catch (error) {
    console.error('OpenAI Prompt API Error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Generate screening questions based on job description
app.post('/api/generate-screening-questions', async (req, res) => {
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
        // Clean up malformed JSON (sometimes OpenAI adds extra quotes)
        const cleanedContent = content.replace(/"id":\s*(\d+)"/g, '"id": $1');
        const parsedData = JSON.parse(cleanedContent);
        console.log('Successfully parsed screening questions:', parsedData);

        // Extract questions array from the response structure
        if (parsedData.screening_questions && Array.isArray(parsedData.screening_questions)) {
          // Map the question objects to just the question text
          questions = parsedData.screening_questions.map(q => q.question);
        } else if (Array.isArray(parsedData)) {
          questions = parsedData;
        } else {
          questions = parsedData;
        }
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

    res.json({
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
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
