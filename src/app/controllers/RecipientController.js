import * as Yup from 'yup';
import Recipient from '../models/Recipient';

class RecipientController {
  async index(req, res) {
    const recipients = await Recipient.findAll();

    return res.json(recipients);
  }

  async show(req, res) {
    const { id } = req.params;
    const findRecipient = await Recipient.findOne({ where: { id } });

    if (!findRecipient) {
      return res.status(401).json({ error: 'Recipient not found' });
    }

    return res.json(findRecipient);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      street: Yup.string().required(),
      number: Yup.string().required(),
      complement: Yup.string(),
      state: Yup.string().required(),
      city: Yup.string().required(),
      postal: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation error' });
    }

    const findRecipient = await Recipient.findOne({ where: req.body });

    if (findRecipient) {
      return res.status(400).json({ error: 'Recipient already registered' });
    }

    const recipient = await Recipient.create(req.body);

    return res.json(recipient);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      street: Yup.string(),
      number: Yup.string(),
      complement: Yup.string(),
      state: Yup.string(),
      city: Yup.string(),
      postal: Yup.string(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation error' });
    }

    const { id } = req.params;

    const recipient = await Recipient.findByPk(id);

    if (!recipient) {
      return res.status(400).json({ error: 'Recipent not found' });
    }

    const {
      name,
      stree,
      number,
      complement,
      state,
      city,
      postal,
    } = await recipient.update(req.body);

    return res.json({
      name,
      stree,
      number,
      complement,
      state,
      city,
      postal,
    });
  }
}

export default new RecipientController();
