import Delivery from '../models/Delivery';
import Recipient from '../models/Recipient';
import Courier from '../models/Courier';
import File from '../models/File';

import Mail from '../../lib/Mail';

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

    await Mail.sendMail({
      to: `${findCourier.name} <${findCourier.email}>`,
      subject: 'Nova entrega',
      template: 'registration',
      context: {
        courier: findCourier.name,
        product,
      },
    });

    return res.json({
      id,
      product,
      recipient_id,
      courier_id,
    });
  }

  async update(req, res) {
    const delivery = await Delivery.findByPk(req.params.id, {
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
      ],
    });

    if (!delivery) {
      return res.status(400).json({ error: 'Delivery not found' });
    }

    const { courier_id, product } = req.body;

    if (courier_id) {
      const findCourier = await Courier.findByPk(courier_id);

      if (!findCourier) {
        return res.status(400).json({ error: 'Invalid new Courier id' });
      }
    }

    const response = await delivery.update({
      courier_id,
      product,
    });

    return res.json(response);
  }

  async delete(req, res) {
    const delivery = await Delivery.findByPk(req.params.id);

    if (!delivery) {
      return res.status(400).json({ error: 'Delivery not found' });
    }

    await delivery.update({
      canceled_at: new Date(),
    });

    return res.json(delivery);
  }
}

export default new DeliveryController();
