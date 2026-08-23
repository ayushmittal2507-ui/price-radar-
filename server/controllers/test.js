import Joi from 'joi';
import { getPrice } from '../utils/getPrice.js';
import Site from '../models/SiteModel.js';

const testSchema = Joi.object({
  url: Joi.string().uri().required().messages({
    'any.required': 'URL is required',
    'string.uri': 'Please enter a valid URL',
  }),
  siteId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required().messages({
    'any.required': 'Site ID is required',
    'string.pattern.base': 'Invalid Site ID format',
  }),
});

export const testScraper = async (req, res) => {
  try {
    const { error, value } = testSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const site = await Site.findById(value.siteId);
    if (!site) {
      return res.status(404).json({ message: 'Site selector configuration not found' });
    }

    const scrapedData = await getPrice(value.url, site);
    res.json({
      message: 'Scraping validation successful',
      data: scrapedData,
    });
  } catch (error) {
    if (error.message.startsWith('SELECTOR_NOT_FOUND:')) {
      return res.status(422).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};
