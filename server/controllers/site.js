import Joi from 'joi';
import mongoose from 'mongoose';
import Site from '../models/SiteModel.js';

export const DEFAULT_SITES = [
  {
    _id: "60d5ecb8b5c0c24d88e40001",
    name: "Amazon",
    type: "product",
    priceLocation: ".a-price .a-offscreen, #priceblock_ourprice, #priceblock_dealprice, .priceToPay .a-price-whole",
    nameLocation: "#productTitle, h1.a-size-large",
    imageLocation: "#landingImage, #imgBlkFront, #main-image",
  },
  {
    _id: "60d5ecb8b5c0c24d88e40002",
    name: "Flipkart",
    type: "product",
    priceLocation: "._30jeq3._16J063, ._30jeq3, div.Nx9bqj",
    nameLocation: ".B_NuCI, span.VU-ZEz, ._2NKhZn",
    imageLocation: "._396cs4._16LucQ, img._53J4C-, img.DByuf4",
  },
  {
    _id: "60d5ecb8b5c0c24d88e40003",
    name: "Demo Books Store (books.toscrape.com)",
    type: "product",
    priceLocation: "p.price_color",
    nameLocation: "h1",
    imageLocation: "div.item.active img, .thumbnail img",
  },
  {
    _id: "60d5ecb8b5c0c24d88e40004",
    name: "Yahoo Finance (Stock)",
    type: "stock",
    priceLocation: "fin-streamer[data-field='regularMarketPrice'], span[data-testid='qsp-price']",
    nameLocation: "h1.yf-xxplace, h1",
    imageLocation: "img.logo",
  },
];

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
    if (mongoose.connection.readyState === 1) {
      const sites = await Site.find();
      if (sites && sites.length > 0) return res.json(sites);
    }
    return res.json(DEFAULT_SITES);
  } catch (error) {
    return res.json(DEFAULT_SITES);
  }
};

export const getSiteByName = async (req, res) => {
  try {
    const { name } = req.params;
    if (mongoose.connection.readyState === 1) {
      const site = await Site.findOne({ name: new RegExp('^' + name + '$', 'i') });
      if (site) return res.json(site);
    }
    const matched = DEFAULT_SITES.find(s => s.name.toLowerCase() === name.toLowerCase());
    if (matched) return res.json(matched);
    return res.status(404).json({ message: 'Site not found' });
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
    if (mongoose.connection.readyState === 1) {
      const sites = await Site.find({ type });
      if (sites && sites.length > 0) return res.json(sites);
    }
    return res.json(DEFAULT_SITES.filter(s => s.type === type));
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
    
    if (mongoose.connection.readyState === 1) {
      const siteExists = await Site.findOne({ name: value.name, type: value.type });
      if (siteExists) {
        return res.status(400).json({ message: 'Site with this name and type already exists' });
      }

      const site = await Site.create(value);
      return res.status(201).json(site);
    }

    const mockSite = { ...value, _id: '60d5ecb8b5c0c24d88e400' + (DEFAULT_SITES.length + 1) };
    DEFAULT_SITES.push(mockSite);
    return res.status(201).json(mockSite);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteSite = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const site = await Site.findById(req.params.id);
      if (site) {
        await site.deleteOne();
        return res.json({ message: 'Site removed' });
      }
    }
    const idx = DEFAULT_SITES.findIndex(s => s._id === req.params.id);
    if (idx !== -1) {
      DEFAULT_SITES.splice(idx, 1);
      return res.json({ message: 'Site removed' });
    }
    return res.status(404).json({ message: 'Site not found' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
