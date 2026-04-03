const Stripe = require('stripe');
const Order = require('../models/Order');

// Initialize Stripe with secret key (we will ensure this is properly validated when needed)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2023-10-16',
});

// Create a checkout session
exports.createCheckoutSession = async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId).populate('items.medicine');
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.paymentStatus === 'paid') {
      return res.status(400).json({ success: false, message: 'Order is already paid' });
    }

    // Build line items for Stripe
    const line_items = order.items.map((item) => {
      return {
        price_data: {
          currency: 'inr',
          product_data: {
            name: item.medicine?.name || 'Medicine',
          },
          unit_amount: Math.round(item.price * 100), // convert to paise
        },
        quantity: item.quantity,
      };
    });

    // Add delivery charge if applicable
    if (order.deliveryCharge && order.deliveryCharge > 0) {
      line_items.push({
        price_data: {
          currency: 'inr',
          product_data: {
            name: 'Delivery Charge',
          },
          unit_amount: Math.round(order.deliveryCharge * 100),
        },
        quantity: 1,
      });
    }

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: `${clientUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}&order_id=${order._id}`,
      cancel_url: `${clientUrl}/payment/cancel?order_id=${order._id}`,
      client_reference_id: order._id.toString(),
      customer_email: req.user?.email || undefined, // optionally pass user email if req.user exists
    });

    // Update order with session ID
    order.stripeSessionId = session.id;
    order.paymentMethod = 'online';
    await order.save();

    res.status(200).json({ success: true, url: session.url });
  } catch (error) {
    console.error('Stripe Checkout Error:', error);
    res.status(500).json({ success: false, message: 'Failed to create checkout session' });
  }
};

// Stripe Webhook Webhook
exports.stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    // Note: This requires req.body to be raw buffer, not JSON parsed
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || 'whsec_placeholder'
    );
  } catch (err) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle successful checkout
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    // Find the order that corresponds to this session
    try {
      const order = await Order.findOne({ stripeSessionId: session.id });
      if (order) {
        order.paymentStatus = 'paid';
        if (order.status === 'placed') {
            order.status = 'confirmed'; // automatically confirm paid orders
        }
        await order.save();
        console.log(`Order ${order._id} marked as paid.`);
      }
    } catch (err) {
      console.error('Error updating order after payment:', err);
    }
  }

  // Return a 200 response to acknowledge receipt of the event
  res.send();
};
