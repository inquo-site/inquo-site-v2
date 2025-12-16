import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// HARDCODED UPI ID - Cannot be changed by users
const FIXED_UPI_ID = "webcraftmaster915@okicici";

// Pricing configuration (in paise for INR, cents for USD)
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
  // Handle CORS preflight
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

    const { action, plan_type, billing_cycle, currency, payment_id, utr_number, promo_code } = await req.json();

    if (action === 'create') {
      // Validate plan type
      if (!['starter', 'pro', 'business'].includes(plan_type)) {
        return new Response(
          JSON.stringify({ error: 'Invalid plan type' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Validate billing cycle
      if (!['monthly', 'yearly'].includes(billing_cycle)) {
        return new Response(
          JSON.stringify({ error: 'Invalid billing cycle' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Validate currency
      const validCurrency: 'INR' | 'USD' = currency === 'INR' ? 'INR' : 'USD';
      const validPlan = plan_type as 'starter' | 'pro' | 'business';
      const validCycle = billing_cycle as 'monthly' | 'yearly';
      
      // Calculate base amount from server-side pricing (not user input)
      let amount = PRICING[validCurrency][validPlan][validCycle];
      let discountAmount = 0;
      let appliedPromoCode: string | null = null;

      // Validate and apply promo code if provided
      if (promo_code) {
        // Validate promo code format: alphanumeric, 3-20 characters
        const sanitizedCode = String(promo_code).toUpperCase().trim();
        const promoRegex = /^[A-Z0-9]{3,20}$/;
        
        if (!promoRegex.test(sanitizedCode)) {
          return new Response(
            JSON.stringify({ error: 'Invalid promo code format. Use 3-20 alphanumeric characters.' }),
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
          // Check expiration
          if (promoData.expires_at && new Date(promoData.expires_at) < new Date()) {
            console.log(`Promo code ${promo_code} has expired`);
          }
          // Check usage limit
          else if (promoData.max_uses !== null && promoData.current_uses >= promoData.max_uses) {
            console.log(`Promo code ${promo_code} has reached max uses`);
          }
          // Check applicable plans
          else if (!promoData.applicable_plans.includes(plan_type)) {
            console.log(`Promo code ${promo_code} not applicable for ${plan_type}`);
          }
          // Check minimum amount (convert to paise/cents for comparison)
          else if (promoData.min_amount && (amount / 100) < promoData.min_amount) {
            console.log(`Promo code ${promo_code} requires minimum amount`);
          }
          else {
            // Apply discount
            if (promoData.discount_type === 'percentage') {
              discountAmount = Math.round(amount * (promoData.discount_value / 100));
            } else {
              // Fixed discount - convert to paise/cents
              discountAmount = promoData.discount_value * 100;
            }
            
            amount = Math.max(0, amount - discountAmount);
            appliedPromoCode = promoData.code;

            // Increment promo code usage
            await adminClient
              .from('promo_codes')
              .update({ current_uses: promoData.current_uses + 1 })
              .eq('id', promoData.id);

            console.log(`Applied promo ${promo_code}: discount ${discountAmount}, final ${amount}`);
          }
        }
      }

      console.log(`Creating payment request: ${plan_type} ${billing_cycle} ${validCurrency} = ${amount}`);

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
      const { data: payment, error: paymentError } = await adminClient
        .from('payment_requests')
        .insert({
          user_id: user.id,
          plan_type,
          amount,
          currency: validCurrency,
          billing_cycle,
          status: 'pending',
          admin_notes: appliedPromoCode ? `Promo code: ${appliedPromoCode}, Discount: ${discountAmount / 100}` : null
        })
        .select()
        .single();

      if (paymentError) {
        console.error('Payment creation error:', paymentError);
        return new Response(
          JSON.stringify({ error: 'Failed to create payment request' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Return payment details with UPI info
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
          plan_type,
          billing_cycle,
          promo_applied: appliedPromoCode,
          discount: discountAmount / 100
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

      // Validate UTR format (12-22 alphanumeric characters typically)
      const utrRegex = /^[A-Za-z0-9]{10,30}$/;
      if (!utrRegex.test(utr_number.trim())) {
        return new Response(
          JSON.stringify({ error: 'Invalid UTR/Transaction ID format' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Verify the payment belongs to the user and is pending
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

      // Update payment with UTR
      const { error: updateError } = await adminClient
        .from('payment_requests')
        .update({ 
          utr_number: utr_number.trim().toUpperCase(),
          status: 'pending' // Keep pending until admin verifies
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
      // Just return the UPI ID without creating a payment
      return new Response(
        JSON.stringify({
          upi_id: FIXED_UPI_ID
        }),
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
