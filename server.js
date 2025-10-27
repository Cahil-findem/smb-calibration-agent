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

    // Generate avatars for each candidate using DALL-E
    if (Array.isArray(parsedContent)) {
      console.log('Generating avatars for candidates...');
      const avatarPromises = parsedContent.map(async (item) => {
        try {
          const candidate = item.candidate || item;
          const candidateName = candidate.full_name || candidate.name || 'Professional';
          const title = candidate.current_position?.title || candidate.title || 'Professional';

          console.log(`Generating avatar for ${candidateName}...`);

          const prompt = `Professional corporate headshot photograph of a young business professional named ${candidateName}, working as a ${title}. Clean, minimalist background, contemporary professional clothing, friendly and confident expression, well-lit modern studio photography, LinkedIn profile style`;

          const imageResponse = await openai.images.generate({
            model: "dall-e-3",
            prompt: prompt,
            n: 1,
            size: "1024x1024",
            quality: "standard",
          });

          const avatarUrl = imageResponse.data[0].url;
          console.log(`Generated avatar for ${candidateName}: ${avatarUrl}`);

          // Add avatar URL to candidate data
          if (item.candidate) {
            item.candidate.avatar_url = avatarUrl;
          } else {
            item.avatar_url = avatarUrl;
          }
        } catch (error) {
          console.error(`Error generating avatar for candidate:`, error.message);
          // Continue without avatar if generation fails
        }
      });

      // Wait for all avatars to be generated
      await Promise.all(avatarPromises);
      console.log('All avatars generated successfully');
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
