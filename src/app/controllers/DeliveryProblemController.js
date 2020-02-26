import DeliveryProblem from '../schemas/DeliveryProblem';
import Delivery from '../models/Delivery';
import Courier from '../models/Courier';

import Mail from '../../lib/Mail';

class DeliveryProblemController {
  async index(req, res) {
    const problems = await DeliveryProblem.find();

    return res.json(problems);
  }

  async show(req, res) {
    const delivery = await Delivery.findByPk(req.params.id);

    if (!delivery) {
      return res.status(400).json({ error: 'Invalid delivery id' });
    }

    const problems = await DeliveryProblem.find({
      delivery: req.params.id,
    });

    return res.json(problems);
  }

  async store(req, res) {
    const delivery = await Delivery.findByPk(req.params.id);

    if (!delivery) {
      return res.status(400).json({ error: 'Invalid delivery id' });
    }

    const { description } = req.body;

    if (!description) {
      return res.status(400).json({ error: 'You must provide a description' });
    }

    const problem = await DeliveryProblem.create({
      delivery: req.params.id,
      description,
    });

    return res.json(problem);
  }

  async delete(req, res) {
    const problem = await DeliveryProblem.findById(req.params.id);

    if (!problem) {
      return res.status(400).json({ error: 'Invalid problem id' });
    }

    const delivery = await Delivery.findByPk(problem.delivery, {
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

    await delivery.update({
      canceled_at: new Date(),
    });

    await Mail.sendMail({
      to: `${delivery.courier.name} <${delivery.courier.email}>`,
      subject: 'Entrega cancelada',
      template: 'cancelation',
      context: {
        courier: delivery.courier.name,
        product: delivery.product,
        description: problem.description,
      },
    });

    return res.json(delivery);
  }
}

export default new DeliveryProblemController();
