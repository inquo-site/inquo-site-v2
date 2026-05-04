import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// UPI ID — overridable via PAYMENT_UPI_ID secret; falls back to default account.
const FIXED_UPI_ID = Deno.env.get('PAYMENT_UPI_ID') ?? 'webcraftmaster915@okicici';

// Platform plan pricing (in paise for INR, cents for USD)
const PRICING = {
  INR: {
    starter: { monthly: 19900, yearly: 199900 },
    pro: { monthly: 49900, yearly: 499900 },
    business: { monthly: 99900, yearly: 999900 },
  },
  USD: {
    starter: { monthly: 500, yearly: 4900 },
    pro: { monthly: 1200, yearly: 11900 },
    business: { monthly: 2500, yearly: 24900 },
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';

    const adminClient = createClient(supabaseUrl, supabaseServiceKey);
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } }
    });

    const { data: { user }, error: authError } = await userClient.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`User authenticated: ${user.id}`);

    const { action, plan_type, billing_cycle, currency, payment_id, utr_number, promo_code, agent_id } = await req.json();

    if (action === 'create') {
      const validCurrency: 'INR' | 'USD' = currency === 'INR' ? 'INR' : 'USD';
      let amount = 0;
      let isAgentPurchase = false;
      let agentName = '';

      // Agent purchase flow
      if (agent_id) {
        isAgentPurchase = true;
        
        if (!['monthly', 'yearly', 'lifetime'].includes(billing_cycle)) {
          return new Response(
            JSON.stringify({ error: 'Invalid billing cycle for agent' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Fetch agent pricing from DB (server-side, not user input)
        const { data: agent, error: agentError } = await adminClient
          .from('ai_agents')
          .select('name, monthly_price, yearly_price, one_time_price, usd_monthly_price, usd_yearly_price, usd_one_time_price')
          .eq('id', agent_id)
          .eq('is_active', true)
          .single();

        if (agentError || !agent) {
          return new Response(
            JSON.stringify({ error: 'Agent not found' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        agentName = agent.name;
        const priceMap = {
          monthly: validCurrency === 'INR' ? agent.monthly_price : agent.usd_monthly_price,
          yearly: validCurrency === 'INR' ? agent.yearly_price : agent.usd_yearly_price,
          lifetime: validCurrency === 'INR' ? agent.one_time_price : agent.usd_one_time_price,
        };
        // Agent prices stored in whole units (rupees/dollars), convert to paise/cents
        amount = (priceMap[billing_cycle as keyof typeof priceMap] || 0) * 100;

      } else {
        // Platform plan purchase flow
        if (!['starter', 'pro', 'business'].includes(plan_type)) {
          return new Response(
            JSON.stringify({ error: 'Invalid plan type' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        if (!['monthly', 'yearly'].includes(billing_cycle)) {
          return new Response(
            JSON.stringify({ error: 'Invalid billing cycle' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const validPlan = plan_type as 'starter' | 'pro' | 'business';
        const validCycle = billing_cycle as 'monthly' | 'yearly';
        amount = PRICING[validCurrency][validPlan][validCycle];
      }

      let discountAmount = 0;
      let appliedPromoCode: string | null = null;

      // Validate and apply promo code if provided
      if (promo_code) {
        const sanitizedCode = String(promo_code).toUpperCase().trim();
        const promoRegex = /^[A-Z0-9]{3,20}$/;
        
        if (!promoRegex.test(sanitizedCode)) {
          return new Response(
            JSON.stringify({ error: 'Invalid promo code format.' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { data: promoData, error: promoError } = await adminClient
          .from('promo_codes')
          .select('*')
          .eq('code', sanitizedCode)
          .eq('is_active', true)
          .single();

        if (!promoError && promoData) {
          const planKey = isAgentPurchase ? `agent_${billing_cycle}` : plan_type;
          const validForPlan = promoData.applicable_plans.includes(planKey);
          
          if (promoData.expires_at && new Date(promoData.expires_at) < new Date()) {
            console.log(`Promo code ${promo_code} has expired`);
          } else if (promoData.max_uses !== null && promoData.current_uses >= promoData.max_uses) {
            console.log(`Promo code ${promo_code} has reached max uses`);
          } else if (!validForPlan) {
            console.log(`Promo code ${promo_code} not applicable`);
          } else if (promoData.min_amount && (amount / 100) < promoData.min_amount) {
            console.log(`Promo code ${promo_code} requires minimum amount`);
          } else {
            if (promoData.discount_type === 'percentage') {
              discountAmount = Math.round(amount * (promoData.discount_value / 100));
            } else {
              discountAmount = promoData.discount_value * 100;
            }
            
            amount = Math.max(0, amount - discountAmount);
            appliedPromoCode = promoData.code;

            await adminClient
              .from('promo_codes')
              .update({ current_uses: promoData.current_uses + 1 })
              .eq('id', promoData.id);

            console.log(`Applied promo ${promo_code}: discount ${discountAmount}, final ${amount}`);
          }
        }
      }

      console.log(`Creating payment: ${isAgentPurchase ? 'agent ' + agent_id : plan_type} ${billing_cycle} ${validCurrency} = ${amount}`);

      // Check for existing pending payment
      const { data: existingPayment } = await adminClient
        .from('payment_requests')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'pending')
        .single();

      if (existingPayment) {
        return new Response(
          JSON.stringify({ 
            error: 'You already have a pending payment request. Please complete or cancel it first.',
            existing_payment_id: existingPayment.id 
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Create payment request
      const insertData: Record<string, unknown> = {
        user_id: user.id,
        plan_type: isAgentPurchase ? `agent_${billing_cycle}` : plan_type,
        amount,
        currency: validCurrency,
        billing_cycle,
        status: 'pending',
        admin_notes: [
          appliedPromoCode ? `Promo: ${appliedPromoCode}, Discount: ${discountAmount / 100}` : null,
          isAgentPurchase ? `Agent: ${agentName}` : null,
        ].filter(Boolean).join(' | ') || null,
      };

      if (isAgentPurchase) {
        insertData.agent_id = agent_id;
      }

      const { data: payment, error: paymentError } = await adminClient
        .from('payment_requests')
        .insert(insertData)
        .select()
        .single();

      if (paymentError) {
        console.error('Payment creation error:', paymentError);
        return new Response(
          JSON.stringify({ error: 'Failed to create payment request' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const displayAmount = validCurrency === 'INR' 
        ? `₹${(amount / 100).toFixed(2)}`
        : `$${(amount / 100).toFixed(2)}`;

      return new Response(
        JSON.stringify({
          success: true,
          payment_id: payment.id,
          upi_id: FIXED_UPI_ID,
          amount: amount / 100,
          display_amount: displayAmount,
          currency: validCurrency,
          plan_type: isAgentPurchase ? `agent_${billing_cycle}` : plan_type,
          billing_cycle,
          promo_applied: appliedPromoCode,
          discount: discountAmount / 100,
          is_agent_purchase: isAgentPurchase,
          agent_name: agentName || undefined,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'submit_utr') {
      if (!payment_id || !utr_number) {
        return new Response(
          JSON.stringify({ error: 'Payment ID and UTR number are required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const utrTrimmed = utr_number.trim().toUpperCase();
      // Accept common Indian payment reference formats:
      //  - 12-digit UPI UTR (e.g. 123456789012)
      //  - Bank reference: 4 letters + 6-22 alphanumerics (e.g. HDFC1234567890)
      //  - 16-22 digit NEFT/RTGS/IMPS references
      const utrPatterns = [
        /^[0-9]{12}$/,
        /^[A-Z]{2,4}[A-Z0-9]{8,22}$/,
        /^[0-9]{16,22}$/,
      ];
      if (!utrPatterns.some((p) => p.test(utrTrimmed))) {
        return new Response(
          JSON.stringify({ error: 'Invalid UTR/Transaction ID format' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data: payment, error: fetchError } = await adminClient
        .from('payment_requests')
        .select('*')
        .eq('id', payment_id)
        .eq('user_id', user.id)
        .eq('status', 'pending')
        .single();

      if (fetchError || !payment) {
        return new Response(
          JSON.stringify({ error: 'Payment request not found or already processed' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { error: updateError } = await adminClient
        .from('payment_requests')
        .update({ 
          utr_number: utr_number.trim().toUpperCase(),
          status: 'pending'
        })
        .eq('id', payment_id);

      if (updateError) {
        console.error('UTR update error:', updateError);
        return new Response(
          JSON.stringify({ error: 'Failed to update payment' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log(`UTR submitted for payment ${payment_id}: ${utr_number}`);

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Payment submitted for verification. You will be notified once verified.'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'get_upi_details') {
      return new Response(
        JSON.stringify({ upi_id: FIXED_UPI_ID }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Payment error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
