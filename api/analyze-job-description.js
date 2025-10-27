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
