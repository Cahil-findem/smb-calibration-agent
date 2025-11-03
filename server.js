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

    // Generate enriched profiles for all candidates in parallel
    if (Array.isArray(parsedContent) && parsedContent.length > 0) {
      console.log('=== GENERATING ENRICHED PROFILES FOR ALL CANDIDATES ===');

      try {
        const enrichedProfilePromises = parsedContent.map(async (candidateData, index) => {
          console.log(`Generating enriched profile for candidate ${index + 1}...`);

          // Create candidate summary from the existing data
          const candidate_summary = JSON.stringify(candidateData);

          try {
            const profileResponse = await openai.responses.create({
              prompt: {
                id: 'pmpt_690916c3451c819484dabf50be6e6137080390f4a7720edd',
                variables: {
                  role_brief,
                  appended_feedback,
                  candidate_summary,
                },
              },
            });

            // Extract content from profile response
            let profileContent = null;
            if (profileResponse.output && Array.isArray(profileResponse.output)) {
              const messageOutput = profileResponse.output.find(item => item.type === 'message');
              if (messageOutput && messageOutput.content && messageOutput.content[0]) {
                profileContent = messageOutput.content[0].text;
              }
            }

            // Parse the enriched profile
            let enrichedProfile = null;
            if (typeof profileContent === 'string') {
              try {
                enrichedProfile = JSON.parse(profileContent);
                console.log(`Successfully parsed enriched profile for candidate ${index + 1}`);
              } catch (error) {
                console.error(`Failed to parse enriched profile for candidate ${index + 1}:`, error);
                enrichedProfile = null;
              }
            }

            return enrichedProfile;
          } catch (error) {
            console.error(`Error generating enriched profile for candidate ${index + 1}:`, error);
            return null;
          }
        });

        // Wait for all enriched profiles to complete
        const enrichedProfiles = await Promise.all(enrichedProfilePromises);
        console.log('All enriched profiles generated successfully');

        // Attach enriched profiles to candidate data
        parsedContent.forEach((item, index) => {
          if (enrichedProfiles[index]) {
            item.enrichedProfile = enrichedProfiles[index];
          }
        });

      } catch (error) {
        console.error('Error generating enriched profiles:', error);
        // Continue even if enriched profiles fail
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

// Recruiter chat endpoint for candidate calibration
app.post('/api/recruiter-chat', async (req, res) => {
  try {
    const { messages, candidates, shouldRegenerateCandidates = false, role_brief = '' } = req.body;

    // System prompt for the recruiter persona
    const systemPrompt = {
      role: 'system',
      content: `You are Sia, an experienced technical recruiter helping a hiring manager calibrate their candidate search. Your goal is to understand what they like and don't like about the candidate profiles shown to them.

Key behaviors:
- Be warm, professional, and conversational
- Ask specific follow-up questions to understand their preferences
- Focus on actionable feedback: seniority level, company backgrounds, skills, experience patterns
- Help them articulate what "good" looks like for their role
- Reference specific candidates when relevant (e.g., "I notice Sarah has 5 years at Google...")
- Keep responses concise (2-3 sentences max)
- Guide them toward specific, measurable criteria

IMPORTANT: If the user just requested to regenerate candidates, acknowledge that new candidates have been generated based on their feedback and ask if they'd like to make any additional tweaks or adjustments.

Current candidates being reviewed:
${candidates ? JSON.stringify(candidates, null, 2) : 'No candidates provided'}

Your job is to help refine the search by understanding their feedback.`
    };

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [systemPrompt, ...messages],
      temperature: 0.7,
      max_tokens: 200,
    });

    // If we should regenerate candidates, summarize feedback and call the prompt API
    let newCandidates = null;
    if (shouldRegenerateCandidates && messages.length > 0) {
      console.log('Starting candidate regeneration process...');

      // Get existing feedback context
      const existingFeedback = req.body.appended_feedback || '';

      // Consolidate all feedback into one coherent set
      const consolidationPrompt = {
        role: 'system',
        content: `You are analyzing candidate feedback to create a comprehensive search criteria.

Current candidates being reviewed:
${JSON.stringify(candidates, null, 2)}

${existingFeedback ? `Previous feedback from earlier rounds:\n${existingFeedback}\n\n` : ''}

Based on the conversation and current candidates, create a CONSOLIDATED list of requirements. Be very specific and directive:

1. MUST HAVE: Non-negotiable requirements (extract from user feedback)
2. MUST NOT HAVE: Explicit rejections and things to avoid (reference specific candidates as negative examples, e.g., "NOT like Sarah Chen who has...")
3. PREFERRED: Nice-to-have attributes
4. INTENSITY: Is this a major shift in direction or minor refinement?

Use specific examples from the current candidates to illustrate what NOT to look for.
Be direct and actionable. If the user said candidates are "too senior" or "lack startup experience", explicitly state this with candidate names as examples.

Format as a clear, consolidated list that REPLACES all previous feedback.`
      };

      const consolidation = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [consolidationPrompt, ...messages],
        temperature: 0.5,
        max_tokens: 500,
      });

      const updatedFeedback = consolidation.choices[0].message.content;
      console.log('Consolidated feedback:', updatedFeedback);

      console.log('=== FULL APPENDED FEEDBACK BEING SENT ===');
      console.log(updatedFeedback);
      console.log('=========================================');
      console.log('Calling OpenAI Responses API with appended feedback...');

      // Call OpenAI Responses API to regenerate candidates
      const response = await openai.responses.create({
        prompt: {
          id: 'pmpt_68fc0cf5731c8190ad4b3eed58fa8ba500f7b712f3a134f9',
          variables: {
            role_brief,
            appended_feedback: updatedFeedback,
          },
        },
      });

      console.log('Received new candidates from OpenAI');

      // Extract content from response
      let content = null;
      if (response.output && Array.isArray(response.output)) {
        const messageOutput = response.output.find(item => item.type === 'message');
        if (messageOutput && messageOutput.content && messageOutput.content[0]) {
          content = messageOutput.content[0].text;
        }
      }

      // Parse the JSON string
      let parsedCandidates = null;
      if (typeof content === 'string') {
        try {
          parsedCandidates = JSON.parse(content);
          console.log('Successfully parsed new candidate data');
        } catch (error) {
          console.error('Failed to parse JSON:', error);
        }
      }

      // Assign new avatars from Unsplash with random selection
      if (Array.isArray(parsedCandidates)) {
        console.log('Assigning new avatars from Unsplash...');

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

        parsedCandidates.forEach((item, index) => {
          const avatarUrl = shuffledAvatars[index % shuffledAvatars.length];

          // Add avatar URL to candidate data
          if (item.candidate) {
            item.candidate.avatar_url = avatarUrl;
          } else {
            item.avatar_url = avatarUrl;
          }
        });

        console.log('New avatars assigned successfully');
      }

      // Generate enriched profiles for all regenerated candidates in parallel
      if (Array.isArray(parsedCandidates) && parsedCandidates.length > 0) {
        console.log('Generating enriched profiles for regenerated candidates...');

        const enrichedProfilePromises = parsedCandidates.map(async (candidateData, index) => {
          try {
            // Prepare the candidate summary
            const candidate_summary = JSON.stringify(candidateData);

            console.log(`Calling enriched profile API for regenerated candidate ${index + 1}...`);

            // Call OpenAI Prompt API for enriched profile
            const profileResponse = await openai.responses.create({
              prompt: {
                id: 'pmpt_690916c3451c8190ad4b3eed58fa8ba500f7b712f3a134f9',
                variables: {
                  role_brief,
                  appended_feedback: updatedFeedback,
                  candidate_summary
                }
              }
            });

            // Extract content from response
            let profileContent = null;
            if (profileResponse.output && Array.isArray(profileResponse.output)) {
              const messageOutput = profileResponse.output.find(item => item.type === 'message');
              if (messageOutput && messageOutput.content && messageOutput.content[0]) {
                profileContent = messageOutput.content[0].text;
              }
            }

            // Parse the enriched profile JSON
            if (typeof profileContent === 'string') {
              try {
                const enrichedProfile = JSON.parse(profileContent);
                console.log(`Successfully parsed enriched profile for regenerated candidate ${index + 1}`);
                return enrichedProfile;
              } catch (error) {
                console.error(`Failed to parse enriched profile JSON for candidate ${index + 1}:`, error);
                return null;
              }
            }

            return null;
          } catch (error) {
            console.error(`Error generating enriched profile for candidate ${index + 1}:`, error);
            return null;
          }
        });

        // Wait for all enriched profiles to complete
        const enrichedProfiles = await Promise.all(enrichedProfilePromises);
        console.log('All enriched profiles generated for regenerated candidates');

        // Attach enriched profiles to candidate data
        parsedCandidates.forEach((item, index) => {
          if (enrichedProfiles[index]) {
            item.enrichedProfile = enrichedProfiles[index];
          }
        });
      }

      newCandidates = {
        candidates: parsedCandidates,
        appended_feedback: updatedFeedback,
      };
    }

    res.json({
      success: true,
      response: completion.choices[0].message.content,
      usage: completion.usage,
      newCandidates,
    });
  } catch (error) {
    console.error('Recruiter Chat API Error:', error);
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

    const requestPayload = {
      prompt: {
        id: 'pmpt_68fc1322df1c8190a61f43b096b278ee0cde8553711b2931',
        variables: {
          role_brief: jobDescription,
        },
      },
    };

    console.log('=== SCREENING QUESTIONS API REQUEST ===');
    console.log(JSON.stringify(requestPayload, null, 2));
    console.log('=======================================');

    const response = await openai.responses.create(requestPayload);

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
          // Extract just the question text to match frontend expectations
          questions = parsedData.screening_questions.map(q => q.question);
        } else if (Array.isArray(parsedData)) {
          questions = parsedData;
        } else {
          questions = parsedData;
        }
      } catch (error) {
        console.error('Failed to parse JSON:', error);
        // Fallback - return simple string array
        questions = [
          'What relevant experience do you have for this role?',
          'What interests you most about this position?',
          'What are your salary expectations?',
        ];
      }
    } else {
      questions = content;
    }

    // Ensure we have exactly 3 questions as strings
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

// Generate enriched candidate profile
app.post('/api/generate-candidate-profile', async (req, res) => {
  try {
    const { role_brief, appended_feedback = '', candidate_summary } = req.body;

    console.log('=== GENERATE CANDIDATE PROFILE REQUEST ===');
    console.log('Role Brief:', role_brief);
    console.log('Appended Feedback:', appended_feedback);
    console.log('Candidate Summary:', candidate_summary);
    console.log('==========================================');

    const response = await openai.responses.create({
      prompt: {
        id: 'pmpt_690916c3451c819484dabf50be6e6137080390f4a7720edd',
        variables: {
          role_brief,
          appended_feedback,
          candidate_summary,
        },
      },
    });

    console.log('OpenAI Full Response:', JSON.stringify(response, null, 2));

    // Extract the actual content from the response
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
        console.log('Successfully parsed enriched candidate profile data');
        console.log('Profile structure:', Object.keys(parsedContent));
      } catch (error) {
        console.error('Failed to parse JSON:', error);
        parsedContent = content; // Fall back to raw string
      }
    } else {
      parsedContent = content;
    }

    res.json({
      success: true,
      profile: parsedContent,
    });
  } catch (error) {
    console.error('OpenAI Candidate Profile API Error:', error);
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
