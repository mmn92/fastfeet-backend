import Courier from '../models/Courier';
import File from '../models/File';

class CourierController {
  async index(req, res) {
    const couriers = await Courier.findAll({
      attributes: ['id', 'name', 'email', 'avatar_id'],
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['name', 'path', 'url'],
        },
      ],
    });

    return res.json(couriers);
  }

  async store(req, res) {
    const { name, email } = req.body;

    const findCourier = await Courier.findOne({ where: { email } });

    if (findCourier) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const { id } = await Courier.create({ name, email });

    return res.json({
      id,
      name,
      email,
    });
  }

  async update(req, res) {
    const reqEmail = req.body.email;

    const courier = await Courier.findByPk(req.params.id);

    if (!courier) {
      return res.status(400).json({ error: 'Courier not found' });
    }

    if (reqEmail && reqEmail !== courier.email) {
      const findCourier = await Courier.findOne({ where: { email: reqEmail } });
      if (findCourier) {
        return res.status(400).json({ error: 'Email already in use' });
      }
    }

    const updated = await courier.update(req.body);

    return res.json(updated);
  }

  async delete(req, res) {
    const courier = await Courier.findByPk(req.params.id);

    if (!courier) {
      return res.status(400).json({ error: 'Courier not found' });
    }

    const isDeleted = await Courier.destroy({ where: { id: req.params.id } });

    if (!isDeleted) {
      return res.status(500).json({ error: 'Could not delete entry' });
    }

    const { id, name, email } = courier;

    return res.json({
      id,
      name,
      email,
    });
  }
}

export default new CourierController();
