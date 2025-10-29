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
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages, candidates, shouldRegenerateCandidates = false, role_brief = '' } = req.body;

    // System prompt for the recruiter persona
    const systemPrompt = {
      role: 'system',
      content: `You are Sia, a helpful recruiter assistant. Keep responses brief and conversational.

Style:
- Write 1-2 short sentences max
- Be casual and friendly, not formal
- Ask one focused question at a time
- Reference specific candidates naturally (e.g., "Sarah seems too senior?")
- Avoid bullet points or lists
- Get straight to the point

IMPORTANT: If regenerating candidates, simply say "Updated the list! Want to adjust anything else?"

Current candidates:
${candidates ? JSON.stringify(candidates, null, 2) : 'No candidates provided'}

Help them refine their search with quick, focused questions.`
    };

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [systemPrompt, ...messages],
      temperature: 0.7,
      max_tokens: 150,
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

      newCandidates = {
        candidates: parsedCandidates,
        appended_feedback: updatedFeedback,
      };
    }

    res.status(200).json({
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
}
