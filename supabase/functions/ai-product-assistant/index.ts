import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { category, budget, color, otherRequirements, products } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `You are a helpful and professional gadget shopping assistant for Mazzé Studio, a premium electronics e-commerce store in Bangladesh. 

Your role is to recommend products based on user preferences. Be friendly, concise, and focus on helping users make confident purchase decisions.

You MUST respond with valid JSON in this exact format:
{
  "greeting": "A short friendly greeting message",
  "recommendations": [
    {
      "productName": "exact product name from the list",
      "reason": "brief explanation why this is a good match (1-2 sentences)"
    }
  ],
  "note": "optional note about alternatives or trade-offs if needed"
}

Guidelines:
- Recommend only products that match the criteria as closely as possible
- Maximum 4 product recommendations
- Use exact product names from the provided list
- Keep reasons brief and purchase-oriented
- If no exact match exists, suggest the closest alternatives`;

    const userPrompt = `A customer is looking for a product with these preferences:
- Category: ${category}
- Budget: ৳${budget}
- Preferred Color: ${color}
${otherRequirements ? `- Additional Requirements: ${otherRequirements}` : ''}

Here are the available products:
${JSON.stringify(products, null, 2)}

Respond with valid JSON only. Match product names exactly as they appear in the list.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'Service temporarily unavailable. Please try again later.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error('Failed to get AI response');
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    
    // Parse the JSON response from AI
    let aiResponse;
    try {
      // Remove markdown code blocks if present
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      aiResponse = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      // Fallback response
      aiResponse = {
        greeting: "I found some options for you!",
        recommendations: [],
        note: content
      };
    }

    return new Response(JSON.stringify({ 
      recommendation: aiResponse,
      success: true 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in ai-product-assistant:', error);
    const errorMessage = error instanceof Error ? error.message : 'An error occurred';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
