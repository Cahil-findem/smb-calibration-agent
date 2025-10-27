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
      } catch (error) {
        console.error('Failed to parse JSON:', error);
        parsedContent = content; // Fall back to raw string
      }
    } else {
      parsedContent = content;
    }

    // Generate photorealistic avatars for each candidate using DALL-E
    if (Array.isArray(parsedContent) && parsedContent.length > 0) {
      console.log('Generating avatars for candidates...');

      try {
        const avatarPromises = parsedContent.map(async (candidate, index) => {
          const candidateName = candidate.candidate?.full_name || `Candidate ${index + 1}`;
          const title = candidate.candidate?.current_position?.title || 'Professional';

          // Create a prompt for a professional headshot
          const prompt = `Professional corporate headshot photograph of a young business professional named ${candidateName}, working as a ${title}. Clean, minimalist background, contemporary professional clothing, friendly and confident expression, well-lit modern studio photography, LinkedIn profile style`;

          try {
            const imageResponse = await openai.images.generate({
              model: "dall-e-3",
              prompt: prompt,
              n: 1,
              size: "1024x1024",
              quality: "standard",
              style: "natural"
            });

            return imageResponse.data[0].url;
          } catch (error) {
            console.error(`Error generating avatar for ${candidateName}:`, error.message);
            return null;
          }
        });

        const avatarUrls = await Promise.all(avatarPromises);

        // Add avatar URLs to candidates
        parsedContent.forEach((candidate, index) => {
          if (avatarUrls[index]) {
            if (candidate.candidate) {
              candidate.candidate.avatar_url = avatarUrls[index];
            } else {
              candidate.avatar_url = avatarUrls[index];
            }
          }
        });

        console.log('Avatars generated successfully');
      } catch (error) {
        console.error('Error generating avatars:', error);
        // Continue without avatars if generation fails
      }
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
