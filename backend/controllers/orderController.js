const Order = require('../models/Order');
const Inventory = require('../models/Inventory');
const Pharmacy = require('../models/Pharmacy');
const Notification = require('../models/Notification');

// @POST /api/orders
exports.createOrder = async (req, res) => {
  try {
    const { pharmacy, items, orderType, deliveryAddress, notes } = req.body;

    // Validate pharmacy
    const pharmacyDoc = await Pharmacy.findById(pharmacy);
    if (!pharmacyDoc || !pharmacyDoc.isActive) {
      return res.status(404).json({ success: false, message: 'Pharmacy not found or inactive' });
    }

    // Validate inventory and calculate prices
    let totalAmount = 0;
    let requiresPrescription = false;
    const orderItems = [];

    for (const item of items) {
      const inv = await Inventory.findOne({
        pharmacy,
        medicine: item.medicine,
        isAvailable: true,
      }).populate('medicine', 'name requiresPrescription');

      if (!inv || inv.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${inv?.medicine?.name || 'medicine'}`,
        });
      }

      if (inv.medicine.requiresPrescription) requiresPrescription = true;

      const subtotal = inv.price * item.quantity;
      totalAmount += subtotal;
      orderItems.push({
        medicine: item.medicine,
        quantity: item.quantity,
        price: inv.price,
        subtotal,
      });
    }

    const deliveryCharge = orderType === 'delivery' ? 40 : 0;
    const grandTotal = totalAmount + deliveryCharge;

    const order = await Order.create({
      user: req.user._id,
      pharmacy,
      items: orderItems,
      orderType,
      deliveryAddress: orderType === 'delivery' ? deliveryAddress : undefined,
      totalAmount,
      deliveryCharge,
      grandTotal,
      notes,
      requiresPrescription,
      paymentMethod: 'cod',
    });

    // Deduct stock
    for (const item of orderItems) {
      await Inventory.findOneAndUpdate(
        { pharmacy, medicine: item.medicine },
        { $inc: { stock: -item.quantity } }
      );
    }

    await order.populate([
      { path: 'items.medicine', select: 'name brand strength dosageForm' },
      { path: 'pharmacy', select: 'name address phone' },
    ]);

    // Notify pharmacy
    await Notification.create({
      user: pharmacyDoc.owner,
      title: 'New Order Received',
      message: `${req.user.name} placed an order (${order.orderId}) with ${orderItems.length} item(s). Total: ₹${grandTotal}`,
      type: 'reservation',
    });

    res.status(201).json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @GET /api/orders/my
exports.getUserOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = { user: req.user._id };
    if (status) query.status = status;

    const orders = await Order.find(query)
      .populate('items.medicine', 'name brand strength image dosageForm')
      .populate('pharmacy', 'name address phone rating')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Order.countDocuments(query);
    res.json({ success: true, data: orders, total });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @GET /api/orders/pharmacy
exports.getPharmacyOrders = async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findOne({ owner: req.user._id });
    if (!pharmacy) return res.status(404).json({ success: false, message: 'Pharmacy not found' });

    const { status, page = 1, limit = 10 } = req.query;
    const query = { pharmacy: pharmacy._id };
    if (status) query.status = status;

    const orders = await Order.find(query)
      .populate('user', 'name email phone')
      .populate('items.medicine', 'name brand strength requiresPrescription')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Order.countDocuments(query);
    res.json({ success: true, data: orders, total });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @PUT /api/orders/:id/status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, pharmacyNote, estimatedTime } = req.body;
    const pharmacy = await Pharmacy.findOne({ owner: req.user._id });

    const updateData = { status, pharmacyNote, estimatedTime };
    if (status === 'delivered' || status === 'completed') {
      updateData.completedAt = Date.now();
      updateData.paymentStatus = 'paid';
    }

    const order = await Order.findOneAndUpdate(
      { _id: req.params.id, pharmacy: pharmacy._id },
      updateData,
      { new: true }
    ).populate('user items.medicine pharmacy');

    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    const statusText = status.replace(/_/g, ' ');
    await Notification.create({
      user: order.user._id,
      title: `Order ${statusText.charAt(0).toUpperCase() + statusText.slice(1)}`,
      message: `Your order ${order.orderId} is now ${statusText}${pharmacyNote ? '. Note: ' + pharmacyNote : ''}`,
      type: 'reservation',
    });

    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @PUT /api/orders/:id/cancel
exports.cancelOrder = async (req, res) => {
  try {
    const { cancelReason } = req.body;
    const order = await Order.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user._id,
        status: { $in: ['placed', 'confirmed'] },
      },
      { status: 'cancelled', cancelledAt: Date.now(), cancelReason },
      { new: true }
    );

    if (!order) return res.status(404).json({ success: false, message: 'Cannot cancel this order' });

    // Restore stock
    for (const item of order.items) {
      await Inventory.findOneAndUpdate(
        { pharmacy: order.pharmacy, medicine: item.medicine },
        { $inc: { stock: item.quantity } }
      );
    }

    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
