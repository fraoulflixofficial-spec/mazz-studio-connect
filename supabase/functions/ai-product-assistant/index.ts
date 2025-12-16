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

Guidelines:
- Recommend only products that match the criteria as closely as possible
- Highlight key benefits and value propositions
- Keep responses clear and purchase-oriented
- Use Bangladeshi Taka (৳) for all prices
- If no exact match exists, suggest the closest alternatives and explain why
- Maximum 3-4 product recommendations
- Be encouraging but not pushy`;

    const userPrompt = `A customer is looking for a product with these preferences:
- Category: ${category}
- Budget: ৳${budget}
- Preferred Color: ${color}
${otherRequirements ? `- Additional Requirements: ${otherRequirements}` : ''}

Here are the available products in JSON format:
${JSON.stringify(products, null, 2)}

Please analyze these products and recommend the best matches. For each recommendation:
1. State the product name
2. Mention the price
3. Explain why it's a good match
4. Note any considerations

If no products match well, suggest the closest alternatives and explain the trade-offs.`;

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
    const recommendation = data.choices?.[0]?.message?.content || 'Unable to generate recommendations at this time.';

    return new Response(JSON.stringify({ recommendation }), {
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
