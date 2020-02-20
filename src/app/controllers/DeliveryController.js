import Delivery from '../models/Delivery';
import Recipient from '../models/Recipient';
import Courier from '../models/Courier';
import File from '../models/File';

class DeliveryController {
  async index(req, res) {
    const deliveries = await Delivery.findAll({
      where: { canceled_at: null },
      attributes: ['id', 'start_date', 'end_date', 'product'],
      include: [
        {
          model: Recipient,
          as: 'recipient',
          attributes: ['id', 'name', 'street', 'number'],
        },
        {
          model: Courier,
          as: 'courier',
          attributes: ['id', 'name', 'email'],
        },
        {
          model: File,
          as: 'signature',
          attributes: ['id', 'name', 'path'],
        },
      ],
    });

    return res.json(deliveries);
  }

  async store(req, res) {
    const { recipient_id, courier_id } = req.body;

    const findRecipient = await Recipient.findByPk(recipient_id);

    if (!findRecipient) {
      return res.status(400).json({ error: 'Invalid recipient id' });
    }

    const findCourier = await Courier.findByPk(courier_id);

    if (!findCourier) {
      return res.status(400).json({ error: 'Invalid courier id' });
    }

    const { id, product } = await Delivery.create(req.body);

    return res.json({
      id,
      product,
      recipient_id,
      courier_id,
    });
  }
}

export default new DeliveryController();
