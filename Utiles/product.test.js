const { createProduct } = require('../controllers/product');
const Product = require('../models/Product');

jest.mock('../models/Product');

describe('createProduct', () => {
  it('should return 400 if required fields are missing', async () => {
    const req = { body: { title: '', desc: '', img: '', category: '', price: '' } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await createProduct(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Some fields are empty" });
  });
});