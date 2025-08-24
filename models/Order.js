const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema(
    {
        userId: { type: String, required: true },
        products: [
            {
                productId: {
                    type: String,
                },
                quantity: {
                    type: Number,
                    default: 1,
                },
            },
        ],
        amount: { type: Number, required: true },
        name: { type: String, required: true },
        phone: { type: String, required: true },
        address: { type: Object, required: true },
        status: { type: String, default: 'pending' }, 
        shopId: {
            type: mongoose.Schema.Types.ObjectId,
           
            ref: "Seller",
          },
    },
    { timestamps: true } 
);

module.exports = mongoose.model('Order', OrderSchema);
