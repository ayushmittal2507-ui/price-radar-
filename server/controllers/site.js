import Joi from 'joi';
import Site from '../models/SiteModel.js';

const siteSchema = Joi.object({
  name: Joi.string().required().messages({
    'any.required': 'Site name is required',
  }),
  type: Joi.string().valid('product', 'stock').required().messages({
    'any.required': 'Type is required',
    'any.only': 'Type must be either product or stock',
  }),
  priceLocation: Joi.string().required().messages({
    'any.required': 'Price CSS selector is required',
  }),
  nameLocation: Joi.string().required().messages({
    'any.required': 'Name CSS selector is required',
  }),
  imageLocation: Joi.string().required().messages({
    'any.required': 'Image CSS selector is required',
  }),
});

export const getSites = async (req, res) => {
  try {
    const sites = await Site.find();
    res.json(sites);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getSiteByName = async (req, res) => {
  try {
    const { name } = req.params;
    const site = await Site.findOne({ name: new RegExp('^' + name + '$', 'i') });
    if (!site) {
      return res.status(404).json({ message: 'Site not found' });
    }
    res.json(site);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getSitesByType = async (req, res) => {
  try {
    const { type } = req.params;
    if (type !== 'product' && type !== 'stock') {
      return res.status(400).json({ message: 'Type must be product or stock' });
    }
    const sites = await Site.find({ type });
    res.json(sites);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createSite = async (req, res) => {
  try {
    const { error, value } = siteSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    
    const siteExists = await Site.findOne({ name: value.name, type: value.type });
    if (siteExists) {
      return res.status(400).json({ message: 'Site with this name and type already exists' });
    }

    const site = await Site.create(value);
    res.status(201).json(site);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteSite = async (req, res) => {
  try {
    const site = await Site.findById(req.params.id);
    if (!site) {
      return res.status(404).json({ message: 'Site not found' });
    }
    await site.deleteOne();
    res.json({ message: 'Site removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
