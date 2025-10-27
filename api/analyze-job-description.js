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

    // Fetch avatars for each candidate from Unsplash
    if (Array.isArray(parsedContent)) {
      console.log('Fetching avatars from Unsplash...');

      // Search queries for variety
      const queries = ['professional headshot', 'business portrait', 'corporate headshot'];

      const avatarPromises = parsedContent.map(async (item, index) => {
        try {
          const candidate = item.candidate || item;
          const candidateName = candidate.full_name || candidate.name || 'Professional';

          console.log(`Fetching avatar for ${candidateName}...`);

          // Rotate through different search queries for variety
          const query = queries[index % queries.length];

          const unsplashUrl = `https://api.unsplash.com/photos/random?query=${encodeURIComponent(query)}&orientation=portrait&content_filter=high`;

          const response = await fetch(unsplashUrl, {
            headers: {
              'Authorization': `Client-ID ${process.env.UNSPLASH_ACCESS_KEY || 'your-unsplash-access-key'}`
            }
          });

          if (response.ok) {
            const data = await response.json();
            const avatarUrl = data.urls.regular; // Use 'regular' size (1080px)
            console.log(`Fetched avatar for ${candidateName}: ${avatarUrl}`);

            // Add avatar URL to candidate data
            if (item.candidate) {
              item.candidate.avatar_url = avatarUrl;
            } else {
              item.avatar_url = avatarUrl;
            }
          } else {
            console.error(`Failed to fetch avatar for ${candidateName}:`, response.statusText);
          }
        } catch (error) {
          console.error(`Error fetching avatar for candidate:`, error.message);
          // Continue without avatar if fetch fails
        }
      });

      // Wait for all avatars to be fetched
      await Promise.all(avatarPromises);
      console.log('All avatars fetched successfully');
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
