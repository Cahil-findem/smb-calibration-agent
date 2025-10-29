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

    res.status(200).json({
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
}
