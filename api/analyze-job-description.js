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

    // Generate photorealistic avatars for each candidate using DALL-E
    if (Array.isArray(parsedContent) && parsedContent.length > 0) {
      console.log('Generating avatars for candidates...');

      try {
        const avatarPromises = parsedContent.map(async (candidate, index) => {
          const candidateName = candidate.candidate?.full_name || `Candidate ${index + 1}`;
          const title = candidate.candidate?.current_position?.title || 'Professional';

          // Create a prompt for a professional headshot
          const prompt = `Professional corporate headshot photograph of a business professional named ${candidateName}, working as a ${title}. High quality, neutral background, professional attire, friendly and confident expression, well-lit studio photography, LinkedIn profile style`;

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
