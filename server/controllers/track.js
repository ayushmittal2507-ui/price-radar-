import Joi from 'joi';
import mongoose from 'mongoose';
import Track from '../models/TrackModel.js';
import Site from '../models/SiteModel.js';
import { DEFAULT_SITES } from './site.js';

const SHOWCASE_TRACKS = [
  {
    _id: "60d5ecb8b5c0c24d88e40011",
    name: "Sony WH-1000XM5 Wireless Noise-Cancelling Headphones",
    url: "https://www.amazon.com/dp/B09XS7JWHH",
    site: { _id: "60d5ecb8b5c0c24d88e40001", name: "Amazon" },
    type: "product",
    demandPrice: 349.99,
    lowestPriceEver: 299.99,
    informed: false,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60",
    history: [
      { price: 399.99, date: new Date(Date.now() - 86400000 * 5) },
      { price: 379.99, date: new Date(Date.now() - 86400000 * 4) },
      { price: 349.99, date: new Date(Date.now() - 86400000 * 3) },
      { price: 329.99, date: new Date(Date.now() - 86400000 * 2) },
      { price: 299.99, date: new Date(Date.now() - 86400000 * 1) },
    ],
    createdAt: new Date(Date.now() - 86400000 * 5),
  },
  {
    _id: "60d5ecb8b5c0c24d88e40012",
    name: "Apple iPhone 15 (128 GB) - Midnight Black",
    url: "https://www.amazon.com/dp/B0BDHD7P6B",
    site: { _id: "60d5ecb8b5c0c24d88e40001", name: "Amazon" },
    type: "product",
    demandPrice: 749.00,
    lowestPriceEver: 799.00,
    informed: false,
    image: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=500&auto=format&fit=crop&q=60",
    history: [
      { price: 899.00, date: new Date(Date.now() - 86400000 * 4) },
      { price: 849.00, date: new Date(Date.now() - 86400000 * 3) },
      { price: 829.00, date: new Date(Date.now() - 86400000 * 2) },
      { price: 799.00, date: new Date(Date.now() - 86400000 * 1) },
    ],
    createdAt: new Date(Date.now() - 86400000 * 4),
  },
  {
    _id: "60d5ecb8b5c0c24d88e40013",
    name: "A Light in the Attic (Poetry Collection)",
    url: "http://books.toscrape.com/catalogue/a-light-in-the-attic_1000/index.html",
    site: { _id: "60d5ecb8b5c0c24d88e40003", name: "Demo Books Store (books.toscrape.com)" },
    type: "product",
    demandPrice: 55.00,
    lowestPriceEver: 51.77,
    informed: true,
    image: "http://books.toscrape.com/media/cache/2c/da/2cdad67c44b002e7ead0cc35693c0e8b.jpg",
    history: [
      { price: 58.50, date: new Date(Date.now() - 86400000 * 3) },
      { price: 54.00, date: new Date(Date.now() - 86400000 * 2) },
      { price: 51.77, date: new Date(Date.now() - 86400000 * 1) },
    ],
    createdAt: new Date(Date.now() - 86400000 * 3),
  },
  {
    _id: "60d5ecb8b5c0c24d88e40014",
    name: "Apple Inc. (AAPL) Regular Market Price",
    url: "https://finance.yahoo.com/quote/AAPL/",
    site: { _id: "60d5ecb8b5c0c24d88e40004", name: "Yahoo Finance (Stock)" },
    type: "stock",
    demandPrice: 220.00,
    lowestPriceEver: 224.23,
    informed: false,
    image: "",
    history: [
      { price: 235.10, date: new Date(Date.now() - 86400000 * 5) },
      { price: 231.40, date: new Date(Date.now() - 86400000 * 4) },
      { price: 228.90, date: new Date(Date.now() - 86400000 * 3) },
      { price: 226.50, date: new Date(Date.now() - 86400000 * 2) },
      { price: 224.23, date: new Date(Date.now() - 86400000 * 1) },
    ],
    createdAt: new Date(Date.now() - 86400000 * 5),
  },
];

let inMemoryTracks = [...SHOWCASE_TRACKS];

const trackSchema = Joi.object({
  name: Joi.string().required().messages({
    'any.required': 'Item name is required',
  }),
  url: Joi.string().uri().required().messages({
    'any.required': 'URL is required',
    'string.uri': 'Please enter a valid URL',
  }),
  site: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required().messages({
    'any.required': 'Site ID is required',
    'string.pattern.base': 'Invalid Site ID format',
  }),
  type: Joi.string().valid('product', 'stock').required().messages({
    'any.required': 'Type is required',
    'any.only': 'Type must be either product or stock',
  }),
  demandPrice: Joi.number().positive().required().messages({
    'any.required': 'Demand price is required',
    'number.positive': 'Demand price must be greater than zero',
  }),
  image: Joi.string().allow('', null).optional(),
  telegramChatId: Joi.string().allow('', null).optional(),
});

export const getAllTracks = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const tracks = await Track.find().populate('user', 'name email').populate('site', 'name');
      if (tracks && tracks.length > 0) return res.json(tracks);
    }
    return res.json(inMemoryTracks);
  } catch (error) {
    return res.json(inMemoryTracks);
  }
};

export const getMyTracks = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1 && req.user?._id) {
      const tracks = await Track.find({ user: req.user._id }).populate('site', 'name');
      if (tracks && tracks.length > 0) return res.json(tracks);
    }
    return res.json(inMemoryTracks);
  } catch (error) {
    return res.json(inMemoryTracks);
  }
};

export const getTrackById = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      try {
        const track = await Track.findById(req.params.id).populate('site', 'name');
        if (track) return res.json(track);
      } catch {
        // Fall through to in-memory lookup
      }
    }
    const memTrack = inMemoryTracks.find(t => t._id === req.params.id);
    if (memTrack) return res.json(memTrack);
    return res.status(404).json({ message: 'Track not found' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createTrack = async (req, res) => {
  try {
    const { error, value } = trackSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    let siteName = 'Online Store';
    const foundDefault = DEFAULT_SITES.find(s => s._id === value.site);
    if (foundDefault) siteName = foundDefault.name;

    if (mongoose.connection.readyState === 1) {
      try {
        const siteExists = await Site.findById(value.site);
        if (siteExists) siteName = siteExists.name;
        
        const track = await Track.create({
          ...value,
          user: req.user?._id || '60d5ecb8b5c0c24d88e40099',
        });
        const populated = await track.populate('site', 'name');
        return res.status(201).json(populated);
      } catch (err) {
        console.warn('DB track create note:', err.message);
      }
    }

    const mockTrack = {
      _id: '60d5ecb8b5c0c24d88e400' + (inMemoryTracks.length + 20),
      ...value,
      site: { _id: value.site, name: siteName },
      user: req.user?._id || '60d5ecb8b5c0c24d88e40099',
      lowestPriceEver: value.demandPrice,
      informed: false,
      history: [
        { price: value.demandPrice * 1.08, date: new Date(Date.now() - 86400000 * 2) },
        { price: value.demandPrice, date: new Date() }
      ],
      createdAt: new Date(),
    };
    inMemoryTracks.unshift(mockTrack);
    return res.status(201).json(mockTrack);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteTrack = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      try {
        const track = await Track.findById(req.params.id);
        if (track) {
          await track.deleteOne();
        }
      } catch {
        // Continue to memory delete
      }
    }
    inMemoryTracks = inMemoryTracks.filter(t => t._id !== req.params.id);
    return res.json({ message: 'Track removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
