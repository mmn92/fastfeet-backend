import { Sequelize } from 'sequelize';
import { startOfToday, getHours } from 'date-fns';

import Courier from '../models/Courier';
import Delivery from '../models/Delivery';

class DashboardController {
  async indexPending(req, res) {
    const courier = await Courier.findByPk(req.params.id);

    if (!courier) {
      return res.status(400).json({ error: 'Invalid courier id' });
    }

    const deliveries = await Delivery.findAll({
      where: {
        courier_id: req.params.id,
        end_date: null,
        canceled_at: null,
      },
    });

    return res.json(deliveries);
  }

  async indexComplete(req, res) {
    const courier = await Courier.findByPk(req.params.id);

    if (!courier) {
      return res.status(400).json({ error: 'Invalid courier id' });
    }

    const deliveries = await Delivery.findAll({
      where: {
        courier_id: req.params.id,
        end_date: {
          [Sequelize.Op.ne]: null,
        },
        canceled_at: null,
      },
    });

    return res.json(deliveries);
  }

  async update(req, res) {
    const courier = await Courier.findByPk(req.params.id);

    if (!courier) {
      return res.status(400).json({ error: 'Invalid courier id' });
    }

    const delivery = await Delivery.findByPk(req.params.did, {
      attributes: ['id', 'start_date', 'end_date', 'product'],
      include: [
        {
          model: Courier,
          as: 'courier',
          attributes: ['id', 'name', 'email'],
        },
      ],
    });

    if (!delivery) {
      return res.status(400).json({ error: 'Invalid delivery id' });
    }

    if (delivery.courier.id !== courier.id) {
      return res
        .status(401)
        .json({ error: 'Delivery assigned to another courier' });
    }

    const { start_date, end_date } = req.body;

    if (start_date) {
      if (getHours(start_date) < 8 || getHours(start_date) > 18) {
        return res
          .status(400)
          .json({ error: 'You must start a delivery in comercial hours' });
      }

      const deliveries = await Delivery.findAll({
        where: {
          courier_id: req.params.id,
          start_date: {
            $gte: startOfToday(),
          },
          canceled_at: null,
        },
      });

      if (deliveries.length >= 5) {
        return res
          .status(403)
          .json({ error: 'Deliveries limit reached for today' });
      }
    }

    if (end_date) {
      if (!delivery.start_date) {
        return res
          .status(400)
          .json({ error: 'You cant complete a delivery without start date' });
      }
    }

    const updated = await delivery.update(req.body);

    return res.json(updated);
  }
}

export default new DashboardController();
